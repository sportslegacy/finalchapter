#!/usr/bin/env node
// Distribution discovery + scoring for The Final Chapter.
//
// Surfaces fresh Reddit threads and news items about the five legends, ranks
// them, and prints a digest you can scan in the morning. DISCOVERY ONLY — it
// never posts. You read the shortlist and reply from your own account.
//
// Usage:
//   node scripts/distribution/discover.mjs                 # full digest, last 7 days
//   node scripts/distribution/discover.mjs --player=neymar # one player
//   node scripts/distribution/discover.mjs --days=3        # tighter window
//   node scripts/distribution/discover.mjs --reddit-only
//   node scripts/distribution/discover.mjs --news-only
//   node scripts/distribution/discover.mjs --json          # machine-readable
//   node scripts/distribution/discover.mjs --draft         # + paste-ready reply drafts
//
// Reddit access: uses Reddit's PUBLIC Atom RSS search feeds — no app, no
// credentials, no OAuth. RSS doesn't expose upvote/comment counts, so ranking
// is by recency + title relevance + subreddit rather than raw engagement.
//
// Drafting (--draft): for each player's top thread, asks Claude to write a
// reply in our established playbook voice (validate the thread's angle → add
// one sharp fact grounded in data/players.js → end with the bare https:// URL).
// Needs ANTHROPIC_API_KEY in the env; without it, discovery still runs and the
// tool just prints a one-line note on how to enable drafts. You still paste the
// reply yourself — this only removes the blank-page step, never auto-posts.

import { writeFileSync } from "node:fs";

const UA = "FinalChapterBot/1.0 (distribution discovery; contact tbcql1986@gmail.com)";

// `query` is the Reddit search term; `match` is the regex used to decide whether
// a thread's TITLE is really about this player (title hits rank far above
// body-only mentions, which are usually lineup lists / unrelated noise).
const PLAYERS = [
  { id: "messi",    name: "Lionel Messi",      site: "/player/messi",
    query: "Messi",              match: /\bmessi\b/i,
    subs: ["soccer", "worldcup", "Barca", "argentina", "InterMiamiCF"] },
  { id: "ronaldo",  name: "Cristiano Ronaldo", site: "/player/ronaldo",
    query: '"Cristiano Ronaldo"', match: /\bronaldo\b/i,
    subs: ["soccer", "worldcup", "realmadrid", "portugal"] },
  { id: "modric",   name: "Luka Modric",       site: "/player/modric",
    query: "Modric",             match: /modri[cć]/i,
    subs: ["soccer", "worldcup", "realmadrid", "ACMilan", "croatia"] },
  { id: "neymar",   name: "Neymar",            site: "/player/neymar",
    query: "Neymar",             match: /\bneymar\b/i,
    subs: ["soccer", "worldcup", "Barca", "PSG", "brasil"] },
  { id: "debruyne", name: "Kevin De Bruyne",   site: "/player/debruyne",
    query: '"De Bruyne"',        match: /\bde bruyne\b/i,
    subs: ["soccer", "worldcup", "MCFC", "Napoli", "belgium"] },
];

// Titles matching this are low-value reply targets (live/auto-generated threads
// where the player is incidental, e.g. a substitute in a lineup dump).
const NOISE_TITLE = /(match thread|post-?match|pre-?match|free agents|daily discussion|rate the|highlights?:)/i;

// Subreddits that are bot-run news mirrors, user profile pages, meme/spam
// dumps, FIFA-game card subs, or merch/repost feeds — no live human football
// discussion, so they're not worth replying in.
const JUNK_SUB = /(auto|newspaper|^u_|_news$|memes?$|bot$|trials$|goalupon|getnoted|starcutouts|cults3d|^fut$|futmobile)/i;

// Shopping / merch / commerce subs: people there want a BUY link, not editorial
// analysis, so an on-brand reply gets downvoted (learned the hard way —
// r/SoccerJerseys reply pulled 450 views but -2 karma). Penalize hard so the
// digest stops queuing them as reply targets.
const COMMERCE_SUB = /(jerseys?$|kits?$|merch|forsale|swap|deals?$|shopping|sneakers|fashionreps|reps?$)/i;

// APPROXIMATE subscriber counts per subreddit — a reach TIEBREAKER for the
// editor's brief only (NOT used in scoring). Reddit RSS gives us no engagement
// data, and the brief otherwise had no notion of audience size, so it once
// called a ~50K sub a "high-visibility piggyback". These are rough, drift
// slowly (months), and are deliberately labelled "approx" in the prompt so the
// brief treats reach as a tiebreaker, not gospel — a fresh thread with a live
// comment on a small sub still beats a stale/comment-less one on a huge sub.
// Keys are lowercased sub names. Unknown subs → null → "size unknown".
const SUB_REACH = {
  soccer: 6_500_000, worldcup: 350_000, argentina: 1_200_000, brasil: 1_100_000,
  realmadrid: 900_000, barca: 700_000, mcfc: 550_000, fcbarcelona: 700_000,
  acmilan: 250_000, belgium: 250_000, portugal: 250_000, fulbo: 250_000,
  croatia: 200_000, napoli: 120_000, intermiamicf: 60_000, canarinho: 60_000,
  messi: 55_000, soccercentral: 40_000, thetouchline: 30_000,
};
function formatReach(sub) {
  const n = SUB_REACH[String(sub || "").toLowerCase()];
  if (!n) return "size unknown";
  return n >= 1_000_000 ? `~${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M subs`
       : `~${Math.round(n / 1000)}K subs`;
}

// Keywords that signal a thread is on-topic for us (World Cup / final-chapter angle).
const WC_TERMS = ["world cup", "wc2026", "wc26", "2026", "retire", "retirement", "last dance", "final", "swan song", "international"];

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  })
);
const DAYS = Number(args.days || 7);
const WINDOW_MS = DAYS * 86400_000;
const ONLY_PLAYER = args.player ? String(args.player).toLowerCase() : null;
const REDDIT_ONLY = !!args["reddit-only"];
const NEWS_ONLY = !!args["news-only"];
const JSON_OUT = !!args.json;
const DRAFT = !!args.draft;
const HTML_PATH = typeof args.html === "string" ? args.html : null;

// How many items to surface per player. Keep the shortlist tight — you can only
// realistically reply to a couple of threads a day, so showing 5 was noise.
const SHOW_TOP_N = 2; // Reddit threads shown (and drafted) per player
const NEWS_TOP_N = 3; // news headlines shown per player

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hoursAgo = (ts) => Math.round((Date.now() - ts) / 3600_000);

// ---------- Reddit (public Atom RSS) ----------

const redditWindow = () =>
  DAYS <= 1 ? "day" : DAYS <= 7 ? "week" : DAYS <= 31 ? "month" : "year";

// Reddit's RSS sometimes returns links whose slug carries raw non-ASCII
// characters (e.g. a Vietnamese or Arabic post title). Those URLs don't paste
// or click reliably — they get mangled in chat apps and Reddit's own app — so
// the operator can't open the thread. The slug is purely decorative: only the
// post id (and, for comment permalinks, the comment id) actually resolves. This
// rebuilds a clean, ASCII-only canonical URL. Handles /r/<sub>/, /user/<name>/,
// and bare /comments/ forms, and both submission and comment permalinks.
function canonicalRedditUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!/reddit\.com$/i.test(u.hostname)) return url;
    const seg = u.pathname.split("/").filter(Boolean);
    const ci = seg.indexOf("comments");
    if (ci === -1) return url; // not a thread/comment URL — leave it untouched
    const postId = seg[ci + 1];
    if (!postId) return url;
    const commentId = seg[ci + 3]; // present only on comment permalinks (.../slug/<id>)
    const tail = commentId ? `comments/${postId}/comment/${commentId}/` : `comments/${postId}/`;
    // Keep the /r/<sub>/ or /user/<name>/ prefix when present; else bare /comments/.
    const prefix = ci >= 2 ? `${seg[ci - 2]}/${seg[ci - 1]}/` : "";
    return `https://www.reddit.com/${prefix}${tail}`;
  } catch {
    return url; // malformed URL — don't break the digest over it
  }
}

function parseAtomEntries(xml) {
  const entries = [];
  const blocks = xml.split(/<entry>/).slice(1);
  for (const b of blocks) {
    const tag = (name) => {
      const m = b.match(new RegExp(`<${name}[^>]*>(.*?)</${name}>`, "s"));
      return m ? decodeEntities(m[1]).trim() : null;
    };
    const linkM = b.match(/<link[^>]*href="([^"]+)"/);
    const catM = b.match(/<category[^>]*label="r\/([^"]+)"/);
    const title = tag("title");
    const link = linkM ? canonicalRedditUrl(decodeEntities(linkM[1])) : null;
    const published = tag("published") || tag("updated");
    if (title && link) {
      // Prefer the subreddit from the URL (/r/<sub>/ or /u_<user>/); the
      // <category> tag is missing on user-profile posts.
      const urlSub = link.match(/reddit\.com\/(?:r|user)\/([^/]+)/i);
      entries.push({
        title,
        link,
        subreddit: urlSub ? urlSub[1] : catM ? catM[1] : "?",
        ts: published ? Date.parse(published) : NaN,
      });
    }
  }
  return entries;
}

// Tagged error so callers can tell a throttled feed apart from an empty one.
class RateLimitError extends Error {
  constructor(status) {
    super(`reddit feed returned HTTP ${status}`);
    this.name = "RateLimitError";
    this.status = status;
  }
}

// Reddit's public endpoints throttle aggressively (429). Retry a couple of
// times with backoff, and THROW (don't return "") on persistent failure so a
// throttled response is never silently treated as an empty result.
async function fetchTextRetry(url, { attempts = 4, backoff = 2000 } = {}) {
  let lastStatus = 0;
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(backoff * attempt);
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res.text();
    lastStatus = res.status;
    // 4xx other than 429 won't fix itself on retry; bail immediately.
    if (res.status !== 429 && res.status < 500) break;
  }
  throw new RateLimitError(lastStatus);
}

async function redditRssSearch({ sub, query }) {
  const t = redditWindow();
  const path = sub
    ? `/r/${sub}/search.rss?restrict_sr=1&sort=new&t=${t}&limit=25&q=${encodeURIComponent(query)}`
    : `/search.rss?sort=new&t=${t}&limit=25&q=${encodeURIComponent(query)}`;
  return parseAtomEntries(await fetchTextRetry("https://www.reddit.com" + path));
}

// Decode HTML entities + strip tags/URLs from a comment's RSS <content> HTML
// down to plain readable text.
function cleanCommentHtml(s) {
  return decodeEntities(decodeEntities(String(s)))
    .replace(/<[^>]+>/g, " ")          // strip HTML tags
    .replace(/https?:\/\/\S+/g, " ")   // drop bare URLs
    .replace(/\s+/g, " ")
    .trim();
}

// Pull the top comments for a thread from Reddit's PUBLIC comment RSS feed
// (<permalink>.rss?sort=top). Reddit 403s the unauthenticated .json API, but
// the .rss feeds are open — the same path we already use for search. RSS
// exposes no upvote count, but the feed comes back in top-sorted order, so the
// first real comment is the top one. Lets the digest name the EXACT comment to
// reply under, and each draft engage that commenter's point.
async function fetchTopComments(permalink, n = 3) {
  const url = permalink.replace(/\/?$/, "/") + ".rss?sort=top&limit=25";
  const xml = await fetchTextRetry(url); // throws RateLimitError on persistent 429/5xx
  const out = [];
  for (const block of xml.split("<entry>").slice(1)) {
    const link = (block.match(/<link[^>]*href="(.*?)"/) || [])[1] || "";
    // A comment permalink has an extra id segment after the post slug; the
    // submission's own entry link stops at the slug — skip it.
    if (!/\/comments\/[^/]+\/[^/]+\/[a-z0-9]+\/?$/i.test(link)) continue;
    const author = ((block.match(/<author>[\s\S]*?<name>(.*?)<\/name>/) || [])[1] || "").replace(/^\/u\//, "");
    if (!author || /^automoderator$/i.test(author)) continue;
    const body = cleanCommentHtml((block.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1] || "");
    if (!body || body === "[deleted]" || body === "[removed]") continue;
    out.push({ author, body, permalink: canonicalRedditUrl(link) });
    if (out.length >= n) break;
  }
  return out;
}

// Serial, polite pass: attach the top comments to each shown thread. Kept out
// of the parallel draft pass so all Reddit requests stay in one rate-limit-safe
// sequence.
async function attachComments(reddit) {
  if (!reddit) return;
  await sleep(3000); // cool-down after the RSS phase before hitting the stricter JSON endpoint
  for (const p of reddit.byPlayer) {
    for (const hit of p.hits.slice(0, SHOW_TOP_N)) {
      try {
        hit.topComments = await fetchTopComments(hit.url);
      } catch (e) {
        if (e instanceof RateLimitError) hit.commentsThrottled = true;
      }
      await sleep(2500); // the comment JSON endpoint rate-limits harder than RSS
    }
  }
}

// Score 0..100 from RSS-available signals only (no upvotes/comments).
// Recency + whether the player is named in the TITLE (strong) vs body-only
// (weak) + a topic bonus for World-Cup / retirement / final-chapter angles.
function scoreReddit(entry, player) {
  const ageH = hoursAgo(entry.ts);
  const recency = Math.max(0, 1 - ageH / (DAYS * 24));
  const titleHit = player.match.test(entry.title);
  const topical = WC_TERMS.some((t) => entry.title.toLowerCase().includes(t));
  const curated = player.subs.some((s) => s.toLowerCase() === entry.subreddit.toLowerCase());
  let score = 100 * (0.45 * recency + (titleHit ? 0.4 : 0.1) + (topical ? 0.15 : 0));
  if (NOISE_TITLE.test(entry.title)) score *= 0.25;
  if (JUNK_SUB.test(entry.subreddit)) score *= 0.15;
  if (COMMERCE_SUB.test(entry.subreddit)) score *= 0.05; // merch subs downvote editorial replies
  if (curated) score = Math.min(100, score + 8); // hand-picked quality subs
  return { score: Math.round(score), ageH, titleHit, topical };
}

// Normalize a title for cross-subreddit dedup (auto-mirror subs repost the same
// headline). Strip [source] tags + punctuation, lowercase, first 60 chars.
const titleKey = (t) =>
  t.replace(/\[[^\]]*\]/g, "").replace(/[^a-z0-9 ]/gi, "").toLowerCase().trim().slice(0, 60);

async function gatherReddit() {
  const players = ONLY_PLAYER ? PLAYERS.filter((p) => p.id === ONLY_PLAYER) : PLAYERS;
  const out = [];
  for (const p of players) {
    const seen = new Set();
    const hits = [];
    let throttled = false;
    const targets = [{ sub: null }, ...p.subs.map((sub) => ({ sub }))];
    for (const { sub } of targets) {
      let entries = [];
      try {
        entries = await redditRssSearch({ sub, query: p.query });
      } catch (e) {
        if (e instanceof RateLimitError) throttled = true;
        /* ignore a single failed feed; keep whatever other feeds returned */
      }
      for (const e of entries) {
        if (seen.has(e.link)) continue;
        seen.add(e.link);
        if (Number.isNaN(e.ts) || Date.now() - e.ts > WINDOW_MS) continue;
        const s = scoreReddit(e, p);
        hits.push({
          player: p.id,
          score: s.score,
          ageH: s.ageH,
          titleHit: s.titleHit,
          subreddit: e.subreddit,
          title: e.title,
          url: e.link,
          site: p.site,
        });
      }
      await sleep(1100); // be polite to Reddit's public feeds (it throttles fast)
    }
    hits.sort((a, b) => b.score - a.score);
    // Collapse the same headline reposted across subs — keep the top-scored.
    const byTitle = new Map();
    for (const h of hits) {
      const k = titleKey(h.title);
      if (!byTitle.has(k)) byTitle.set(k, h);
    }
    out.push({ player: p.id, name: p.name, site: p.site, hits: [...byTitle.values()], throttled });
  }
  return { authMode: "public RSS (no auth)", byPlayer: out };
}

// ---------- Google News RSS (no auth) ----------

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function parseRssItems(xml) {
  const items = [];
  const blocks = xml.split(/<item>/).slice(1);
  for (const b of blocks) {
    const get = (tag) => {
      const m = b.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s"));
      return m ? decodeEntities(m[1]).trim() : null;
    };
    const title = get("title");
    const link = get("link");
    const pubDate = get("pubDate");
    const source = get("source");
    if (title && link) items.push({ title, link, pubDate, source });
  }
  return items;
}

async function gatherNews() {
  const players = ONLY_PLAYER ? PLAYERS.filter((p) => p.id === ONLY_PLAYER) : PLAYERS;
  const out = [];
  for (const p of players) {
    const q = encodeURIComponent(`"${p.name}" (World Cup OR 2026 OR retirement)`);
    const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
    let items = [];
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) items = parseRssItems(await res.text());
    } catch {
      /* ignore */
    }
    const fresh = items
      .map((it) => ({ ...it, ts: it.pubDate ? Date.parse(it.pubDate) : NaN }))
      .filter((it) => !Number.isNaN(it.ts) && Date.now() - it.ts <= WINDOW_MS)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8)
      .map((it) => ({ ...it, ageH: hoursAgo(it.ts) }));
    out.push({ player: p.id, name: p.name, site: p.site, items: fresh });
  }
  return out;
}

// ---------- Drafting (Claude API, optional) ----------

const SITE_BASE = "https://finalchapterfc.com";

// The playbook voice, distilled from CLAUDE.md's "Reddit reply tactics that
// worked". Stable across every call so the API can cache it.
const DRAFT_SYSTEM = `You write Reddit reply drafts for a person promoting "The Final Chapter", a fan site about five footballers playing their last World Cup (Messi, Ronaldo, Modrić, Neymar, De Bruyne).

These drafts are pasted BY A HUMAN as a reply inside an existing Reddit thread — never auto-posted. Match this exact voice, which has converted before:

1. If a TOP COMMENT is provided, open by engaging THAT commenter's specific point — validate or gently reframe what they said, like a real fan replying directly to them. Otherwise engage the thread's headline angle. No "great post", no greeting, no throat-clearing.
2. Add exactly ONE sharp, specific fact the other commenters likely don't have. Use ONLY the facts provided below — never invent stats, dates, records, or quotes. If you're unsure a number is in the provided facts, leave it out.
3. Keep it short: 2–4 sentences, conversational, lowercase-casual is fine. Never salesy. Never say "check out my site", "I built", or "here's a site".
4. End with the bare URL on its very own last line, exactly as given, including https://. Nothing after it.

Output ONLY the reply text itself — no preamble, no quotes around it, no explanation.`;

let voiceCache = null;
async function loadVoice() {
  if (voiceCache) return voiceCache;
  const mod = await import(new URL("../../data/players.js", import.meta.url));
  voiceCache = new Map(mod.players.map((p) => [p.id, p]));
  return voiceCache;
}

function playerFacts(p) {
  const miles = (p.milestonesAtStake || [])
    .map((m) => `- ${m.headline}: ${m.detail}`)
    .join("\n");
  return `Player: ${p.name} (${p.country}, age ${p.ageAtTournament} at the tournament)
World Cup totals entering 2026: ${p.worldCupGoals} goals, ${p.worldCupAssists} assists, ${p.worldCupApps} appearances.
Why this is his final chapter: ${p.finalChapterReason}
Milestones in play:
${miles}
The ONLY URL to use (paste on its own final line): ${SITE_BASE}/player/${p.id}`;
}

// Shared Claude Messages call with retry/backoff. A transient network blip
// ("fetch failed") or a 429/5xx used to poison a whole card (e.g. X plays) with
// an error string; now we retry before giving up. Returns the joined text.
async function callClaude({ apiKey, system, userMsg, attempts = 4, backoff = 1500 }) {
  let lastErr = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(backoff * attempt);
    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-opus-4-7",
          max_tokens: 2000,
          thinking: { type: "adaptive" },
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: userMsg }],
        }),
      });
    } catch (e) {
      // Network-level failure (DNS, reset, "fetch failed") — retry.
      lastErr = e;
      continue;
    }
    if (res.ok) {
      const json = await res.json();
      return (json.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
    }
    const body = await res.text().catch(() => "");
    lastErr = new Error(`Claude API ${res.status}: ${body.slice(0, 200)}`);
    // Only 429/5xx are worth retrying; 4xx (bad request, auth) won't fix itself.
    if (res.status !== 429 && res.status < 500) break;
  }
  throw lastErr || new Error("Claude API: unknown failure");
}

async function draftReply({ player, thread, apiKey }) {
  const facts = playerFacts(player);
  const top = thread.topComments?.[0];
  const commentBlock = top
    ? `\nTOP COMMENT to reply under (engage THIS person's point):
u/${top.author}: "${top.body.slice(0, 500)}"\n`
    : "";
  const userMsg = `THREAD to reply inside:
Subreddit: r/${thread.subreddit}
Title: ${thread.title}
URL: ${thread.url}
${commentBlock}
FACTS you may use (and nothing beyond these):
${facts}

Write the reply draft now.`;

  const text = await callClaude({ apiKey, system: DRAFT_SYSTEM, userMsg });
  return text || "(empty draft)";
}

// Draft replies for each player's top scored Reddit hits, so the digest gives
// you a choice when the #1 thread is a weak reply target. All calls run in
// parallel; a failure on one thread just leaves that hit undrafted.
async function attachDrafts(reddit) {
  if (!reddit) return;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    reddit.draftNote =
      "drafting skipped — set ANTHROPIC_API_KEY to generate reply drafts (export ANTHROPIC_API_KEY=sk-ant-...)";
    return;
  }
  const voice = await loadVoice();
  const tasks = [];
  for (const p of reddit.byPlayer) {
    const player = voice.get(p.player);
    if (!player) continue;
    for (const hit of p.hits.slice(0, SHOW_TOP_N)) {
      tasks.push(
        draftReply({ player, thread: hit, apiKey })
          .then((d) => { hit.draft = d; })
          .catch((e) => { hit.draftError = e.message; })
      );
    }
  }
  await Promise.all(tasks);
}

// ---------- Editor's brief (Claude reads the whole digest) ----------

const BRIEF_SYSTEM = `You are the distribution editor for "The Final Chapter", a fan site about five footballers playing their last World Cup (Messi, Ronaldo, Modrić, Neymar, De Bruyne).

Given today's digest of Reddit threads + news headlines about the five, write a SHORT morning brief telling the operator exactly where to spend limited time. They manually paste ONE reply at a time under a high-upvote comment, and can realistically act on only 2–4 threads a day.

Output GitHub-flavoured markdown, in this order:
- "## Top moves today" — a numbered list of up to 3 specific threads to reply in. For each, you MUST start with an EXACT locator so the operator can find the right card instantly: the player, then the subreddit and score together in brackets exactly as given (e.g. "[r/messi · score 85]") — this pair uniquely identifies one card in the per-player section below. Then a few quoted words of the thread title, then the comment to reply under. You MUST name the commenter marked "REPLY TARGET" for that thread (as u/<author>, quoting a few of their words) — NEVER name an "other comment — CONTEXT ONLY" entry, and never invent a commenter; if a thread has no REPLY TARGET line, say "reply to the post directly (no comment surfaced yet)". Then WHY it's the best target right now (freshness, an active debate — the context-only comments help you judge that — a breaking-news hook), and the one-line angle to take. NOTE: the best target for a player is often NOT their top-scored thread — a slightly-lower-scored thread with a live high-upvote comment to reply under beats a higher-scored thread with no comment. Pick the best target and the [r/sub · score N] locator tells the operator exactly which card it is.
- "## Skip today" — one or two lines naming players or thread types not worth it today, and why.
- If and only if a news item is time-sensitive enough to act on immediately, add a final "## Breaking" line.

Rules: Reference ONLY threads/news/commenters that appear in the digest below — never invent a thread, stat, quote, or username. Be decisive and specific; no generic marketing advice. A 4h-old thread with an active debate beats a 60h-old one; body-only mentions are weak targets. Each thread shows its subreddit's APPROXIMATE subscriber count (e.g. "r/soccer (~6.5M subs)" vs "r/messi (~55K subs)") — use it as a reach TIEBREAKER: a reply on a huge sub is seen by far more people, so NEVER call a small/niche sub "high-visibility". But reach is only a tiebreaker, not the deciding factor — a fresh thread with a live high-upvote comment to reply under (even on a small sub) usually beats a bigger sub's thread that has no comment surfaced or is stale. When you pick a smaller-sub thread over a bigger-sub one, say why in one clause (e.g. "over the bigger r/soccer post, which has no comment to reply under"). Keep the whole brief under ~200 words.`;

function digestForBrief({ reddit, news }) {
  let s = "";
  if (reddit) {
    s += "REDDIT THREADS (per player, top scored first):\n";
    for (const p of reddit.byPlayer) {
      s += `\n${p.name}:\n`;
      if (!p.hits.length) {
        s += p.throttled ? "  (rate-limited — unknown)\n" : "  (no fresh threads)\n";
        continue;
      }
      for (const h of p.hits.slice(0, SHOW_TOP_N)) {
        s += `  - [score ${h.score}, ${h.ageH}h old, r/${h.subreddit} (${formatReach(h.subreddit)})${h.titleHit ? "" : ", body-only"}] ${h.title}\n`;
        // Only topComments[0] is a valid reply target — it's the comment the
        // per-player section prints AND the one the paste-ready draft is written
        // against. The remaining comments are shown to the brief purely as
        // debate-liveliness context; the brief must NOT name them (doing so
        // points the operator at a comment that has no matching draft). See the
        // "brief named a non-[0] comment" digest bug.
        const cs = h.topComments || [];
        if (cs[0]) {
          s += `      REPLY TARGET (the ONLY comment you may name to reply under) — u/${cs[0].author}: ${cs[0].body.replace(/\s+/g, " ").slice(0, 160)}\n`;
        }
        cs.slice(1, 3).forEach((c) => {
          s += `      (other comment — CONTEXT ONLY, never name as the reply target) u/${c.author}: ${c.body.replace(/\s+/g, " ").slice(0, 140)}\n`;
        });
      }
    }
  }
  if (news) {
    s += "\nNEWS HEADLINES (per player):\n";
    for (const p of news) {
      s += `\n${p.name}:\n`;
      if (!p.items.length) { s += "  (none)\n"; continue; }
      for (const it of p.items.slice(0, NEWS_TOP_N)) s += `  - [${it.ageH}h, ${it.source || "?"}] ${it.title}\n`;
    }
  }
  return s;
}

async function editorBrief({ reddit, news, apiKey }) {
  const userMsg = `Today's digest:\n\n${digestForBrief({ reddit, news })}\n\nWrite the morning brief now.`;
  return callClaude({ apiKey, system: BRIEF_SYSTEM, userMsg });
}

// ---------- X / Twitter plays (drafting only — no search API exists for free) ----------

const X_SYSTEM = `You write X (Twitter) post drafts for the person behind "The Final Chapter", a fan site about five footballers playing their last World Cup (Messi, Ronaldo, Modrić, Neymar, De Bruyne).

The account is small, so reach comes from the CONTENT, not the link. Hard rules learned from this account's own data:
- Standalone "milestone hook" posts (a single scroll-stopping stat or framing) outperform "I built a site →" posts by far. Keep posts LINK-FREE — links suppress reach and barely convert here; the site URL lives in the bio.
- A post must stand on its own as a sharp football take, never read as an ad. No hashtags spam (0–1 max), no "check out", no emojis-as-decoration.
- Each post ≤ 280 characters.

Given today's top angles (from the editor's brief), the news headlines, and the player facts, output up to 2 posts in GitHub-flavoured markdown:
- "## Standalone posts" — 1–2 ready-to-paste tweets, each as a markdown list item in backticks-free plain text, tied to TODAY's freshest angle/news.
- "## Reply-guy target (optional)" — one line: which kind of big football account's post to look for today (e.g. a Fabrizio Romano post about X) and a ≤280-char reply to leave under it. You CANNOT see live tweets, so describe the target by topic, don't invent a specific tweet.

Use ONLY the facts provided — never invent stats, dates, records, or quotes. Be specific and timely. Keep the whole thing tight.`;

async function xPlays({ brief, news, apiKey }) {
  const voice = await loadVoice();
  const facts = [...voice.values()].map((p) => playerFacts(p)).join("\n\n");
  let newsLines = "";
  for (const p of news || []) {
    for (const it of p.items.slice(0, NEWS_TOP_N)) newsLines += `- [${p.name}, ${it.ageH}h] ${it.title}\n`;
  }
  const userMsg = `TODAY'S EDITOR BRIEF:
${brief || "(none)"}

TODAY'S NEWS HEADLINES:
${newsLines || "(none)"}

PLAYER FACTS (use only these for any numbers):
${facts}

Write today's X plays now.`;
  return callClaude({ apiKey, system: X_SYSTEM, userMsg });
}

// ---------- Output ----------

function printDigest({ reddit, news, brief, xplays }) {
  const date = new Date().toISOString().slice(0, 10);
  console.log(`\n=== Final Chapter · distribution digest · ${date} · last ${DAYS}d ===`);
  if (reddit) console.log(`Reddit access: ${reddit.authMode}\n`);
  if (reddit?.draftNote) console.log(`(${reddit.draftNote})\n`);

  if (brief) {
    console.log("===== EDITOR'S BRIEF (AI read of today's digest) =====\n");
    console.log(brief);
    console.log("\n======================================================\n");
  }

  if (xplays) {
    console.log("===== X / TWITTER PLAYS (paste from your own account; link-free) =====\n");
    console.log(xplays);
    console.log("\n======================================================\n");
  }

  if (reddit) {
    for (const p of reddit.byPlayer) {
      console.log(`\n## ${p.name}  (${p.site})`);
      if (!p.hits.length) {
        console.log(
          p.throttled
            ? "  (Reddit rate-limited this feed — re-run later; NOT a real empty result)"
            : "  (no fresh Reddit threads found)"
        );
        continue;
      }
      for (const h of p.hits.slice(0, SHOW_TOP_N)) {
        console.log(`  [${String(h.score).padStart(3)}] r/${h.subreddit} · ${h.ageH}h ago${h.titleHit ? "" : " · (body mention)"}`);
        console.log(`        ${h.title}`);
        console.log(`        ${h.url}`);
        const tc = h.topComments?.[0];
        if (tc) {
          console.log(`        ↪ reply under u/${tc.author}: "${tc.body.replace(/\s+/g, " ").slice(0, 120)}"`);
        } else if (h.commentsThrottled) {
          console.log("        ↪ (comments rate-limited — open the thread to pick a comment)");
        }
        if (h.draft) {
          console.log("        ── draft reply (engages the comment above; paste & adapt) ──");
          for (const line of h.draft.split("\n")) console.log(`        | ${line}`);
        } else if (h.draftError) {
          console.log(`        (draft failed: ${h.draftError})`);
        }
      }
    }
  }

  if (news) {
    console.log(`\n\n=== News (Google News RSS) ===`);
    for (const p of news) {
      console.log(`\n## ${p.name}`);
      if (!p.items.length) {
        console.log("  (no fresh news)");
        continue;
      }
      for (const it of p.items.slice(0, NEWS_TOP_N)) {
        console.log(`  · ${it.ageH}h · ${it.source || "?"} — ${it.title}`);
        console.log(`      ${it.link}`);
      }
    }
  }
  console.log("");
}

// ---------- HTML renderer (brand-styled, self-contained) ----------

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Tiny markdown → HTML for the editor's brief (headings, bold, bullet/numbered
// lists, paragraphs). Deliberately minimal — the brief is short and well-formed.
function mdToHtml(md) {
  const lines = String(md).split("\n");
  let html = "";
  let listType = null; // "ul" | "ol" | null
  const closeList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
  const inline = (t) =>
    esc(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if ((m = line.match(/^#{2,4}\s+(.*)$/))) { closeList(); html += `<h3>${inline(m[1])}</h3>`; }
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
      if (listType !== "ol") { closeList(); html += "<ol>"; listType = "ol"; }
      html += `<li>${inline(m[1])}</li>`;
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      if (listType !== "ul") { closeList(); html += "<ul>"; listType = "ul"; }
      html += `<li>${inline(m[1])}</li>`;
    } else if (line.trim() === "") {
      // A blank line must NOT close an open list. The brief separates its
      // numbered "Top moves" with blank lines (loose-list style); closing the
      // <ol> on each blank put every item in its own <ol>, so they all rendered
      // as "1." instead of 1/2/3. Skip blank lines — list items, paragraphs and
      // headings each open/close lists explicitly, so spacing isn't lost.
      continue;
    }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return html;
}

function scoreClass(s) {
  if (s >= 85) return "hot";
  if (s >= 70) return "warm";
  return "cool";
}

function renderHtml({ reddit, news, brief, xplays, colors }) {
  const date = new Date().toISOString().slice(0, 10);
  const accent = (id) => colors?.get(id) || "#d4a853";

  let redditHtml = "";
  if (reddit) {
    for (const p of reddit.byPlayer) {
      const a = accent(p.player);
      redditHtml += `<section class="player" style="--pa:${esc(a)}">
        <h2><span class="dot"></span>${esc(p.name)} <a class="site" href="${esc(SITE_BASE)}${esc(p.site)}" target="_blank" rel="noopener">${esc(p.site)}</a></h2>`;
      if (!p.hits.length) {
        redditHtml += `<p class="empty">${p.throttled
          ? "Reddit rate-limited this feed — re-run later (not a real empty result)"
          : "No fresh Reddit threads found"}</p></section>`;
        continue;
      }
      for (const h of p.hits.slice(0, SHOW_TOP_N)) {
        redditHtml += `<article class="hit">
          <div class="hitmeta">
            <span class="score ${scoreClass(h.score)}">${h.score}</span>
            <span class="sub">r/${esc(h.subreddit)}</span>
            <span class="age">${h.ageH}h ago</span>
            ${h.titleHit ? "" : `<span class="bodyonly">body mention</span>`}
          </div>
          <a class="title" href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.title)}</a>`;
        const tc = h.topComments?.[0];
        if (tc) {
          redditHtml += `<a class="replyunder" href="${esc(tc.permalink)}" target="_blank" rel="noopener">↪ reply under <strong>u/${esc(tc.author)}</strong> — ${esc(tc.body.replace(/\s+/g, " ").slice(0, 140))}${tc.body.length > 140 ? "…" : ""}</a>`;
        } else if (h.commentsThrottled) {
          redditHtml += `<p class="replyunder muted">↪ comments rate-limited — open the thread to pick a comment</p>`;
        }
        if (h.draft) {
          redditHtml += `<div class="draftwrap">
            <div class="drafthead"><span>draft reply — engages the comment above; paste & adapt</span>
            <button class="copy" type="button">Copy</button></div>
            <pre class="draft">${esc(h.draft)}</pre>
          </div>`;
        } else if (h.draftError) {
          redditHtml += `<p class="err">draft failed: ${esc(h.draftError)}</p>`;
        }
        redditHtml += `</article>`;
      }
      redditHtml += `</section>`;
    }
  }

  let newsHtml = "";
  if (news) {
    for (const p of news) {
      newsHtml += `<section class="player news"><h2>${esc(p.name)}</h2>`;
      if (!p.items.length) { newsHtml += `<p class="empty">No fresh news</p></section>`; continue; }
      newsHtml += "<ul class=\"newslist\">";
      for (const it of p.items.slice(0, NEWS_TOP_N)) {
        newsHtml += `<li><span class="age">${it.ageH}h</span> <span class="src">${esc(it.source || "?")}</span>
          <a href="${esc(it.link)}" target="_blank" rel="noopener">${esc(it.title)}</a></li>`;
      }
      newsHtml += "</ul></section>";
    }
  }

  const briefHtml = brief
    ? `<div class="brief"><div class="brieftag">Editor's brief · AI read of today's digest</div>${mdToHtml(brief)}</div>`
    : "";
  const xHtml = xplays
    ? `<div class="brief xplays"><div class="brieftag">X / Twitter plays · paste from your own account · link-free</div>${mdToHtml(xplays)}</div>`
    : "";
  const note = reddit?.draftNote ? `<p class="note">${esc(reddit.draftNote)}</p>` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Final Chapter digest · ${date}</title>
<style>
  :root{--bg:#0a0a0c;--bg2:#111116;--card:#16161d;--gold:#d4a853;--gold-dim:#a88535;
        --txt:#f0f0f2;--txt2:#9a9ab0;--muted:#5a5a72;--border:#222233;--blue:#4a7bff;}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--txt);
       font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;}
  .wrap{max-width:820px;margin:0 auto;padding:28px 18px 60px}
  header h1{font-family:"Playfair Display",Georgia,serif;font-size:26px;margin:0 0 4px;color:var(--gold)}
  header .meta{color:var(--muted);font-size:13px;margin:0 0 22px}
  h2{font-size:17px;margin:0 0 12px;display:flex;align-items:center;gap:9px}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--pa,var(--gold));box-shadow:0 0 8px var(--pa,var(--gold))}
  .site{font-size:12px;color:var(--txt2);font-weight:400;text-decoration:none;border-bottom:1px dotted var(--border)}
  .brief{background:linear-gradient(180deg,#1b160c,#141019);border:1px solid var(--gold-dim);
         border-radius:12px;padding:6px 20px 18px;margin:0 0 30px}
  .brieftag{display:inline-block;margin:16px 0 4px;font-size:11px;letter-spacing:.08em;
            text-transform:uppercase;color:var(--gold);font-weight:600}
  .brief h3{font-size:14px;color:var(--gold);margin:18px 0 6px;text-transform:uppercase;letter-spacing:.04em}
  .brief ol,.brief ul{margin:6px 0 6px;padding-left:22px}
  .brief li{margin:5px 0}
  .brief p{margin:7px 0;color:var(--txt)}
  .brief strong{color:#fff}
  .note{color:var(--muted);font-size:13px;font-style:italic;margin:0 0 20px}
  section.player{background:var(--bg2);border:1px solid var(--border);border-radius:12px;
                 padding:16px 18px;margin:0 0 16px}
  .empty{color:var(--muted);font-style:italic;margin:4px 0 0}
  .hit{border-top:1px solid var(--border);padding:14px 0 4px}
  .hit:first-of-type{border-top:0;padding-top:4px}
  .hitmeta{display:flex;align-items:center;gap:9px;font-size:12px;color:var(--txt2);margin-bottom:5px}
  .score{font-weight:700;color:#0a0a0c;border-radius:5px;padding:1px 7px;font-size:12px}
  .score.hot{background:#7ed492}.score.warm{background:var(--gold)}.score.cool{background:#6b6b80}
  .sub{color:var(--blue)}
  .bodyonly{color:var(--muted);border:1px solid var(--border);border-radius:4px;padding:0 5px;font-size:11px}
  a.title{display:block;color:var(--txt);text-decoration:none;font-weight:600;margin-bottom:8px}
  a.title:hover{color:var(--gold)}
  .replyunder{display:block;font-size:12.5px;color:var(--txt2);text-decoration:none;
              background:rgba(74,123,255,.07);border:1px solid var(--border);border-radius:7px;
              padding:6px 10px;margin:0 0 8px;line-height:1.4}
  a.replyunder:hover{border-color:var(--blue);color:var(--txt)}
  .replyunder strong{color:var(--blue)}
  .replyunder.muted{color:var(--muted)}
  .cscore{color:var(--gold-dim);font-weight:600}
  .xplays{background:linear-gradient(180deg,#0c1622,#101019)}
  .xplays .brieftag,.xplays h3{color:var(--blue)}
  .draftwrap{background:var(--card);border:1px solid var(--border);border-radius:9px;
             border-left:3px solid var(--pa,var(--gold));overflow:hidden;margin-bottom:6px}
  .drafthead{display:flex;justify-content:space-between;align-items:center;gap:10px;
             padding:7px 12px;font-size:11.5px;color:var(--txt2);background:rgba(255,255,255,.02)}
  .copy{background:var(--gold);color:#0a0a0c;border:0;border-radius:6px;padding:4px 12px;
        font-size:12px;font-weight:600;cursor:pointer}
  .copy.done{background:#7ed492}
  pre.draft{margin:0;padding:12px;white-space:pre-wrap;word-wrap:break-word;
            font:13.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--txt)}
  .err{color:#e06b6b;font-size:13px;margin:4px 0}
  section.news h2{font-size:15px}
  .newslist{list-style:none;margin:0;padding:0}
  .newslist li{padding:7px 0;border-top:1px solid var(--border);font-size:13.5px}
  .newslist li:first-child{border-top:0}
  .newslist .age{color:var(--muted);font-size:12px}
  .newslist .src{color:var(--gold-dim);font-size:12px;margin-right:4px}
  .newslist a{color:var(--txt);text-decoration:none}
  .newslist a:hover{color:var(--gold)}
  .sechead{font-family:"Playfair Display",Georgia,serif;color:var(--gold);font-size:20px;
           margin:34px 0 14px;border-bottom:1px solid var(--border);padding-bottom:6px}
</style></head>
<body><div class="wrap">
  <header>
    <h1>The Final Chapter · distribution digest</h1>
    <p class="meta">${date} · last ${DAYS} days · discovery only, never posts</p>
  </header>
  ${briefHtml}
  ${xHtml}
  ${note}
  ${reddit ? `<h2 class="sechead">Reddit threads</h2>${redditHtml}` : ""}
  ${news ? `<h2 class="sechead">News</h2>${newsHtml}` : ""}
</div>
<script>
  document.querySelectorAll(".copy").forEach(function(btn){
    btn.addEventListener("click", function(){
      var pre = btn.closest(".draftwrap").querySelector(".draft");
      navigator.clipboard.writeText(pre.textContent).then(function(){
        var old = btn.textContent; btn.textContent = "Copied ✓"; btn.classList.add("done");
        setTimeout(function(){ btn.textContent = old; btn.classList.remove("done"); }, 1400);
      });
    });
  });
</script>
</body></html>`;
}

(async () => {
  const reddit = NEWS_ONLY ? null : await gatherReddit();
  const news = REDDIT_ONLY ? null : await gatherNews();
  // Pull top comments for the shown threads (serial, polite) so we can name the
  // exact comment to reply under. Runs before drafting so drafts can use them.
  if (reddit) await attachComments(reddit);
  if (DRAFT) await attachDrafts(reddit);

  // Editor's brief + X plays: extra Claude passes. Same key as drafting;
  // skipped when no key is set.
  let brief = null;
  let xplays = null;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (DRAFT && apiKey) {
    try {
      brief = await editorBrief({ reddit, news, apiKey });
    } catch (e) {
      brief = `_(editor's brief failed: ${e.message})_`;
    }
    try {
      xplays = await xPlays({ brief, news, apiKey });
    } catch (e) {
      xplays = `_(X plays failed: ${e.message})_`;
    }
  }

  if (JSON_OUT) {
    console.log(JSON.stringify({ brief, xplays, reddit, news }, null, 2));
  } else {
    printDigest({ reddit, news, brief, xplays });
  }

  if (HTML_PATH) {
    let colors = null;
    try {
      const voice = await loadVoice();
      colors = new Map([...voice].map(([id, p]) => [id, p.colors?.primary || "#d4a853"]));
    } catch { /* fall back to gold */ }
    writeFileSync(HTML_PATH, renderHtml({ reddit, news, brief, xplays, colors }));
  }
})();
