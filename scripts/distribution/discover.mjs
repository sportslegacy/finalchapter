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

// Subreddits that are bot-run news mirrors, user profile pages, or meme/spam
// dumps — no live human discussion, so they're not worth replying in.
const JUNK_SUB = /(auto|newspaper|^u_|_news$|memes?$|bot$|trials$)/i;

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hoursAgo = (ts) => Math.round((Date.now() - ts) / 3600_000);

// ---------- Reddit (public Atom RSS) ----------

const redditWindow = () =>
  DAYS <= 1 ? "day" : DAYS <= 7 ? "week" : DAYS <= 31 ? "month" : "year";

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
    const link = linkM ? decodeEntities(linkM[1]) : null;
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

async function redditRssSearch({ sub, query }) {
  const t = redditWindow();
  const path = sub
    ? `/r/${sub}/search.rss?restrict_sr=1&sort=new&t=${t}&limit=25&q=${encodeURIComponent(query)}`
    : `/search.rss?sort=new&t=${t}&limit=25&q=${encodeURIComponent(query)}`;
  const res = await fetch("https://www.reddit.com" + path, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  return parseAtomEntries(await res.text());
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
    const targets = [{ sub: null }, ...p.subs.map((sub) => ({ sub }))];
    for (const { sub } of targets) {
      let entries = [];
      try {
        entries = await redditRssSearch({ sub, query: p.query });
      } catch {
        /* ignore a single failed feed */
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
      await sleep(700); // be polite to Reddit's public feeds
    }
    hits.sort((a, b) => b.score - a.score);
    // Collapse the same headline reposted across subs — keep the top-scored.
    const byTitle = new Map();
    for (const h of hits) {
      const k = titleKey(h.title);
      if (!byTitle.has(k)) byTitle.set(k, h);
    }
    out.push({ player: p.id, name: p.name, site: p.site, hits: [...byTitle.values()] });
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

1. Open by engaging the thread's specific angle/debate as a real fan would — validate or gently reframe it. No "great post", no greeting, no throat-clearing.
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

async function draftReply({ player, thread, apiKey }) {
  const facts = playerFacts(player);
  const userMsg = `THREAD to reply inside:
Subreddit: r/${thread.subreddit}
Title: ${thread.title}
URL: ${thread.url}

FACTS you may use (and nothing beyond these):
${facts}

Write the reply draft now.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
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
      system: [
        { type: "text", text: DRAFT_SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const text = (json.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return text || "(empty draft)";
}

// Draft a reply for each player's single top-scored Reddit hit. Runs the calls
// in parallel; a failure on one player just leaves that hit undrafted.
async function attachDrafts(reddit) {
  if (!reddit) return;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    reddit.draftNote =
      "drafting skipped — set ANTHROPIC_API_KEY to generate reply drafts (export ANTHROPIC_API_KEY=sk-ant-...)";
    return;
  }
  const voice = await loadVoice();
  await Promise.all(
    reddit.byPlayer.map(async (p) => {
      const top = p.hits[0];
      const player = voice.get(p.player);
      if (!top || !player) return;
      try {
        top.draft = await draftReply({ player, thread: top, apiKey });
      } catch (e) {
        top.draftError = e.message;
      }
    })
  );
}

// ---------- Output ----------

function printDigest({ reddit, news }) {
  const date = new Date().toISOString().slice(0, 10);
  console.log(`\n=== Final Chapter · distribution digest · ${date} · last ${DAYS}d ===`);
  if (reddit) console.log(`Reddit access: ${reddit.authMode}\n`);
  if (reddit?.draftNote) console.log(`(${reddit.draftNote})\n`);

  if (reddit) {
    for (const p of reddit.byPlayer) {
      console.log(`\n## ${p.name}  (${p.site})`);
      if (!p.hits.length) {
        console.log("  (no fresh Reddit threads found)");
        continue;
      }
      for (const h of p.hits.slice(0, 5)) {
        console.log(`  [${String(h.score).padStart(3)}] r/${h.subreddit} · ${h.ageH}h ago${h.titleHit ? "" : " · (body mention)"}`);
        console.log(`        ${h.title}`);
        console.log(`        ${h.url}`);
        if (h.draft) {
          console.log("        ── draft reply (paste & adapt; reply under a high-upvote comment) ──");
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
      for (const it of p.items.slice(0, 5)) {
        console.log(`  · ${it.ageH}h · ${it.source || "?"} — ${it.title}`);
        console.log(`      ${it.link}`);
      }
    }
  }
  console.log("");
}

(async () => {
  const reddit = NEWS_ONLY ? null : await gatherReddit();
  const news = REDDIT_ONLY ? null : await gatherNews();
  if (DRAFT) await attachDrafts(reddit);
  if (JSON_OUT) {
    console.log(JSON.stringify({ reddit, news }, null, 2));
  } else {
    printDigest({ reddit, news });
  }
})();
