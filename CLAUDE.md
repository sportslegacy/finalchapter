# Final Chapter — project notes for Claude

Static Next.js fan site celebrating five legends playing their final World Cup at the first 48-team FIFA tournament (USA · Canada · Mexico, 11 Jun – 19 Jul 2026).

**Players:** Lionel Messi, Cristiano Ronaldo, Luka Modrić, Neymar Jr, Kevin De Bruyne.

## Live

- **Production:** https://finalchapterfc.com (and www.finalchapterfc.com)
- **Vercel preview alias:** https://finalchapter.vercel.app
- **Vercel project:** `finalchapter` under team `starwindmoonclouds-projects`
- **GitHub:** https://github.com/sportslegacy/finalchapter (PUBLIC, `main`) — needs to stay public on Hobby plan; org-owned private repos can't connect to Vercel without Pro
- **Hosting plan:** Vercel Hobby (free). 100GB bandwidth/mo. For this size site ≈ 700K–1M page views/mo headroom. **Commercial use is technically against Hobby ToS** — upgrade to Pro ($20/user/mo) if monetizing.
- **Analytics:** Vercel Web Analytics — enabled in dashboard + `<Analytics />` mounted in root layout. 30-day retention on Hobby.
- **CLI auth:** `vercel` is installed globally; logged in as `starwindmooncloud`.

## Stack

- **Next.js 16.2.6** App Router, React 19, Turbopack
- **No DB, no API routes, no SSR.** Every route is static (`○`) or SSG (`●` for `/player/[id]`). Build output is pure HTML/CSS/JS + a few generated PNGs.
- Fonts: Playfair Display (serif) + Inter (sans), via Google Fonts CDN
- Styles: a single `app/globals.css` + one CSS module (`app/page.module.css`)
- Content lives in **`data/players.js`** — single source of truth for the 5 players + tournament data
- Analytics: `@vercel/analytics`

## How to ship a change

```bash
# 1. self-test
npm run build                   # must compile clean — no skipping
# 2. for UI changes, render & eyeball (Claude Preview MCP or manual)
npm run dev                     # then open http://localhost:3000 in a small viewport (375×812 mobile)
# 3. commit + push → auto-deploys
git add <files>
git commit -m "..."
git push                        # Vercel deploys on push to main in ~30s
```

**Auto-deploy is live.** Every push to `main` triggers a production build at Vercel — no `vercel --prod` needed unless GitHub is down.

To force a manual deploy: `vercel --prod` from the repo root.

## File layout

```
app/
  layout.js                       # root metadata (OG, Twitter, metadataBase) + <Analytics/>
  page.js                         # homepage (hero, tournament, legends grid, cities) + JSON-LD SportsEvent + ItemList
  not-found.js                    # branded 404
  globals.css                     # all styles + CSS variables (--accent-gold, etc.)
  icon.svg                        # favicon — static SVG, gold "F" on dark
  apple-icon.js                   # 180×180 PNG for iOS home screen, generated via next/og
  opengraph-image.js              # 1200×630 site-level OG card (fallback), generated at build via next/og
  twitter-image.js                # re-exports opengraph-image
  robots.js                       # → /robots.txt, allow-all + sitemap pointer
  sitemap.js                      # → /sitemap.xml, lists homepage + 5 player URLs
  player/[id]/page.js             # per-player detail page (SSG'd for all 5 ids) + JSON-LD Person schema
  player/[id]/opengraph-image.js  # PER-PLAYER 1200×630 OG card with photo + name + first milestone hook
  components/
    Nav.js                        # header w/ hamburger drawer + LEGENDS dropdown
    Countdown.js                  # site-wide ticker to the tournament opener
    MatchCountdown.js             # per-player ticker to their first group match (handles TBD)
    HashScroll.js                 # smooth-scroll for /#section links
  lib/navigate-to-section.js
data/players.js                   # all content
public/players/                   # editorial portraits per player (CC-licensed from Wikimedia)
  messi.jpg                       #   Hossein Zohrevand · CC BY 4.0
  ronaldo.jpg                     #   Анна Нэсси (Anna Nessi) · CC BY-SA 3.0
  modric.jpg                      #   Real Madrid · CC BY 3.0
  neymar.jpg                      #   Fernando Frazão / Agência Brasil · CC BY 3.0 BR
  debruyne.jpg                    #   Bryan Berlin · CC BY-SA 4.0
scripts/test-nav.mjs              # playwright test for nav dropdown widths
.claude/launch.json               # for Claude Preview MCP — points at `npm run dev` on :3000
```

### Player page section order

(See `app/player/[id]/page.js`.)

1. Profile hero — **editorial portrait** (4:5, gold-glow border, country flag emoji as small corner badge) → name → country/position/age → quote → stats
2. **Final Chapter pull-quote** — gold pill + serif italic, sets thematic anchor
3. **Match Countdown** — "Next up · Country vs Opponent · in X days Y hours"
4. Group Stage Schedule — group badge, storyline, 3 match cards
5. **Records in Play** — 3-card milestone grid ("3 from Klose", "Sixth WC", etc.)
6. Career Timeline ("Every Chapter") — one card per past World Cup + a 2026 "future" card
7. Bio + career honors tags
8. Prev/next player nav
9. Photo credit (CC attribution: author · license · Wikimedia source · "resized")
10. Site footer

### `data/players.js` schema per player

```js
{
  id, name, fullName, country, countryCode, countryFlag,
  position, birthDate, ageAtTournament, clubAtTournament,
  quote, worldCupGoals, worldCupAssists, worldCupApps,
  wc2026: {
    group, groupTeams[], storyline,
    matches: [{ opponent, date, time, kickoffUtc, venue, city }]   // first match's kickoffUtc drives the countdown; null when TBD
  },
  worldCups: [{ year, host, age, result, goals, assists, apps, highlight, emoji }],
  careerHonors[],
  photo: {                                                         // editorial portrait (CC-licensed from Wikimedia Commons)
    src,                                                           //   /players/<id>.jpg
    credit, license, licenseUrl, sourceUrl,                        //   shown as a small CC-attribution line near page footer
    focus,                                                         //   CSS object-position for off-center crops (e.g. "70% center" for landscape originals)
  },
  finalChapterReason,                                              // single poetic paragraph for the pull-quote
  milestonesAtStake: [{ headline, detail }],                       // 3 cards rendered in "Records in Play"
  bio,
}
```

## Brand tokens (in `app/globals.css`)

| Var | Value | Use |
|---|---|---|
| `--bg-primary` | `#0a0a0c` | page background |
| `--bg-secondary` | `#111116` | cards, drawer |
| `--bg-card` | `#16161d` | milestone cards, match-countdown |
| `--accent-gold` | `#d4a853` | headlines, CTAs, "Records in Play" |
| `--accent-gold-dim` | `#a88535` | borders |
| `--accent-blue` | `#4a7bff` | links |
| `--text-primary` | `#f0f0f2` | body |
| `--text-secondary` | `#9a9ab0` | subdued |
| `--text-muted` | `#5a5a72` | labels |
| `--border-subtle` | `#222233` | dividers |
| `--border-glow` | `rgba(212, 168, 83, 0.3)` | accent borders |
| `--gradient-gold` | linear-gradient gold→cream→gold | top accent stripe on milestone cards |
| `--font-serif` | Playfair Display | h1/h2, pull-quote |
| `--font-sans` | Inter | body, UI |

## Gotchas / lessons learned

### Opening-match kickoff time — FIFA's widget is wrong

`tournament.openingMatch.kickoffUtc` is **`2026-06-11T19:00:00.000Z`** — that's 13:00 Mexico City local / 15:00 ET. This is the **official** kickoff (Yahoo, Roadtrips, Wego, FOX all agree).

FIFA's own homepage countdown widget appears to run ~1 hour late (showing 20:00 UTC). **Don't "fix" our countdown to match FIFA's widget** — ours is correct, theirs is off.

### Nav dropdown chevron on narrow phones

At < 430px viewport, the `Tournament | Legends + chevron | Cities` row used to overflow and the chevron got pushed off-screen on iPhone 17 (393pt). Fix lives in `app/globals.css` — a `@media (max-width: 430px)` that hides Tournament and Cities inline (they're still in the hamburger drawer). Don't undo it.

### Next.js dev "N" indicator

Disabled via `devIndicators: false` in `next.config.mjs`. If a future Next release renames this, the badge will reappear in dev — re-check the config flag name.

### UI changes need a pixel render, not just a build

Per the global CLAUDE.md rule: `next build` exits cleanly doesn't prove anything was actually drawn. For UI changes, use **Claude Preview MCP** (`.claude/launch.json` is set up for it):

1. `preview_start` with name `dev`
2. `preview_resize` to `mobile` preset (375×812) — or test `desktop` too
3. `preview_eval` to navigate (`window.location.href = '/player/messi'`)
4. `preview_screenshot` and READ the PNG before claiming done

Or manually: `npm run dev` and open in iPhone-sized window. **Production deploys on push** — a broken UI lands instantly.

### MatchCountdown handles TBD times

`wc2026.matches[*].kickoffUtc` is `null` for matches whose kickoff time isn't published yet (Ronaldo's Group K, KDB's Group G). The component falls back to a date-only countdown ("23d 3h (kickoff TBD)") anchored at 04:00 UTC of that date. When FIFA publishes times, just fill the `kickoffUtc` ISO and the countdown switches to the precise form.

### `playwright` is for `scripts/test-nav.mjs`

The script is in `package-lock.json` already; if it's not installed locally: `npm i -D playwright && npx playwright install chromium`. Run it against `npm run dev` on `:3000` to verify nav widths.

### CC attribution is required — don't drop the photo-credit footer

All five `public/players/*.jpg` are sourced from Wikimedia Commons under CC licenses (BY 3.0, BY 4.0, BY-SA 3.0, BY-SA 4.0). Per the license terms we must credit the author, link the license, link the source, and indicate that the image was modified (we resized them to 1200px long-edge JPEG at quality 80). All of that is rendered by the `.photo-credit` block on each player page just above the site footer. **If you change the photo for a player, update the corresponding `photo: { credit, license, licenseUrl, sourceUrl }` in `data/players.js` — and ideally re-verify the license is still valid on the source page.** Don't remove the credit block.

### Adding / replacing a player photo

1. Find a CC-licensed photo on Wikimedia Commons (filter by "free media" + check the file's license on its description page).
2. Download the **original** file from `upload.wikimedia.org`.
3. Drop it into `public/players/<id>.jpg`.
4. Resize: `sips -Z 1200 public/players/<id>.jpg --setProperty formatOptions 80`. Keeps long-edge ≤ 1200px and quality at 80% — yields ~150–300KB per file.
5. Update `data/players.js → players[i].photo` with the new credit/license/source.
6. If the photo is landscape (or the player is off-center), set a `focus: "70% center"` (or similar) to override `object-position`.

### Stale player content to refresh as 2026 approaches

`data/players.js` is the only file to touch for content. Things that may drift:
- `clubAtTournament` (Modrić → AC Milan, KDB → Napoli — already updated for 2025 transfers)
- `wc2026.matches[*].time` / `kickoffUtc` — FIFA will lock in TBD times closer to tournament
- `worldCups[*].apps/goals/assists` for the 2026 entry — currently `null`, fill post-tournament
- `careerHonors` numbers (e.g. Ballons d'Or count) — verify on Wikipedia after any awards ceremony
- `worldCupGoals`/`worldCupAssists`/`worldCupApps` top-level totals MUST equal the sum of the per-WC entries. See "Stat data integrity" below.

### Stat data integrity — ALWAYS run the consistency check after editing `data/players.js`

We learned the hard way: it's easy to update a stat number in one place and not the other. The page renders count-of-past-WCs as `worldCups.length - 1`, which is independent from the top-level `worldCupApps` total. They can silently drift.

After ANY edit to `data/players.js`, run **both** of these checks. They catch different bug classes.

#### Check 1: numeric — per-WC sums match the stated totals

```bash
node -e "const{players}=require('./data/players.js');players.forEach(p=>{const past=p.worldCups.filter(w=>w.year!==2026);const sumG=past.reduce((s,w)=>s+(w.goals||0),0);const sumA=past.reduce((s,w)=>s+(w.assists||0),0);const sumApps=past.reduce((s,w)=>s+(w.apps||0),0);const ok=sumG===p.worldCupGoals&&sumA===p.worldCupAssists&&sumApps===p.worldCupApps;console.log(p.name+': '+(ok?'OK':'MISMATCH G='+sumG+'/'+p.worldCupGoals+' A='+sumA+'/'+p.worldCupAssists+' Apps='+sumApps+'/'+p.worldCupApps))})"
```

Should print `OK` for all 5 players. Any `MISMATCH` line tells you which totals don't match which per-WC sums.

#### Check 2: prose — ordinal WC-count claims in bio copy match `worldCups.length`

This catches text like *"in his fourth World Cup"* when the data actually has him at his fifth. Different bug class than Check 1 — the numbers can all sum correctly while the prose still lies.

```bash
# Step 1: print what number each player's 2026 actually is
node -e "const{players}=require('./data/players.js');players.forEach(p=>console.log(p.id+': 2026 = his #'+p.worldCups.length+' WC'))"

# Step 2: grep for any ordinal-WC mentions in player copy
grep -nE "(second|third|fourth|fifth|sixth|seventh) World Cup" data/players.js
```

Manually reconcile the two outputs — each ordinal-WC phrase in the copy should match the player's actual 2026 count.

**Expected counts (will not change unless a player is added/removed):**

| Player | Past WCs | 2026 is his... | Why |
|---|---|---|---|
| Messi | 5 (06, 10, 14, 18, 22) | 6th | full cohort |
| Ronaldo | 5 (06, 10, 14, 18, 22) | 6th | full cohort |
| Modrić | 4 (06, 14, 18, 22) | **5th** | Croatia missed 2010 qualifying |
| Neymar | 3 (14, 18, 22) | 4th | wasn't in 2010 squad |
| De Bruyne | 3 (14, 18, 22) | 4th | Belgium didn't qualify 2002/06/10; KDB debuted post-2010 |

The Modrić "Croatia missed 2010" footnote is the trap — easy to assume the same-age cohort played the same number of WCs.

**Past audit failures we already fixed (don't repeat):**
- Messi's `worldCups` array originally missing the 2018 entry — page showed "4 WORLD CUPS" instead of 5. Totals included 2018 but the array didn't.
- Modrić 2022 was listed as 5 apps; should be 7 (Croatia played 7 games on the run to 3rd place, he started all).
- Neymar 2022 was 4 apps + 1 goal; correct is 3 apps + 2 goals (he missed group games 2/3 with the ankle injury, returned for R16 + QF where he scored a penalty vs South Korea and the extra-time goal vs Croatia).
- Neymar "5 from Pelé" milestone hook was based on a worldCupGoals total of 7, but he actually has 8.
- KDB "4× PL Player of the Season" — should be 2× (2019-20, 2021-22). The 4× likely conflated with PL Playmaker of the Season (the assists award), which is a different trophy.
- Neymar "3× Ligue 1 Player of the Year" — only 1× (2017-18); Mbappé won the rest.
- Neymar "2× Copa Libertadores" — only 1× (2011 with Santos).

**Trusted sources for verification:**
- Wikipedia "Lionel Messi at the FIFA World Cup" / per-player WC articles — game-by-game appearances and goals
- Wikipedia "List of international goals scored by [player]" — definitive goal list
- `thesoccerworldcups.com/players/<name>.php` — clean per-tournament totals (apps + goals)
- FIFA's player profile pages on fifa.com — sometimes outdated but authoritative when current

**Assist counts are the murkiest stat.** FIFA, Opta, StatsBomb, and Wikipedia frequently differ on what counts as an assist. Don't waste time chasing perfect parity across providers. As long as our per-WC entries sum to the page total, the page is internally consistent — that's the bar.

## Domain / DNS (GoDaddy)

- Registrar: GoDaddy
- DNS records that matter:
  - `A    @     76.76.21.21`              → Vercel anycast
  - `CNAME www  cname.vercel-dns.com.`    → Vercel managed
- Leave alone: NS (×2), SOA, `_domainconnect`, `_dmarc` TXT
- **Don't reattach** GoDaddy's WebsiteBuilder to the domain — it silently overwrites the apex A record back to GoDaddy parking IPs (13.248.243.5 / 76.223.105.230). If the site ever 502/parks, first check that WebsiteBuilder hasn't crept back onto the domain.

If SSL ever fails to auto-issue (Vercel's prober occasionally misses the DNS even after records are correct), force it:

```
vercel certs issue finalchapterfc.com www.finalchapterfc.com
```

…issues in ~12 sec via Let's Encrypt.

## Vercel CLI notes

- **Login:** `vercel login` opens a browser device-flow auth. Already logged in as `starwindmooncloud`.
- **Deploy now (skip auto):** `vercel --prod --yes` from repo root.
- **List recent deploys:** `vercel ls finalchapter`
- **Domain inspect:** `vercel domains inspect finalchapterfc.com`
- **Re-issue cert:** `vercel certs issue <domain> <www-domain>`
- **Git connect (private org repo limitation):** `vercel git connect` only works on Hobby for PUBLIC repos. We made the GitHub repo public so this could connect. Keep it public, or upgrade to Pro if you ever need to flip it back to private.

## What's intentionally NOT done (post-MVP backlog)

In rough priority if traffic justifies more work:

- **Per-player accent color** (Argentina sky-blue for Messi, Croatia red for Modrić, etc.) — pure CSS, ~40 lines, would differentiate the 5 pages now that they each have a portrait. Add `colors: { primary, secondary }` to `data/players.js` and use them on the headline gradient + milestone-card top stripe + timeline accents. **This is the natural next move** since the portraits and per-player OG cards already differentiate visually, but the in-page chrome is still uniform gold.
- **Shareable player "career card"** — see Parked Ideas below; we built this and removed it for MVP.
- **`error.js` boundary** — pure static + no API means basically nothing to crash, but it's polite.
- **A11y audit** — Lighthouse pass; spot-check contrast tweaks.
- **PWA manifest beyond `apple-icon`** — service worker / offline play.
- **Match-result updates during the tournament** — currently the schedule shows match times but no result field. As matches happen, a tiny `match.result: "W 2-0"` style field + a few lines of JSX in the schedule card would give returning visitors a reason to come back. Update manually after each match (5 min of work per game for a 5-player site).

### Shipped — was on this list previously
- ✅ Editorial photo per player (5 CC-licensed Wikipedia photos in `public/players/`)
- ✅ `robots.txt` + `sitemap.xml` (auto-generated via `app/robots.js` + `app/sitemap.js`)
- ✅ Per-player OG images (`app/player/[id]/opengraph-image.js`, photo + name + first milestone hook)
- ✅ JSON-LD structured data (SportsEvent + ItemList on homepage, Person on player pages)

## Distribution playbook

Site went live May 24, 2026 — ~3 weeks before the tournament opener. Current analytics show ~16 visitors, 3.3 pages/visitor, 88% US traffic. Most growth ahead will come from social, not SEO (which compounds over months).

### What works for this site

**X / Twitter:**
- Football Twitter is the right audience but new-account reach is ~zero — algorithm de-prioritizes for 1–3 months
- Use **personal account, not a brand handle.** Existing follower count + posting history > zero followers from `@finalchapterfc`
- **Tweet the content, not just the link.** A thread that drips one player per tweet, with the URL only in the LAST tweet, outperforms a single "I built this →" tweet by 10×
- Standalone milestone tweets ("Messi is 3 goals from breaking Klose's all-time WC record. He has up to 7 matches to find them.") are scroll-stoppers and don't need to point to the site
- Reply thoughtfully to bigger football accounts — each good reply gets exposure to that account's audience. One viral quote-tweet from a 50K+ follower account does more than 20 of our own posts.

**Reddit:**
- **r/WorldCup (~350K subs) is the best target** — exact topical match for a "Final Chapter" site
- **r/soccer (~1.2M)** is bigger but stricter; save it for after r/WorldCup has worked
- Country/club-specific subs are smaller (5–50K) but engagement is high: `r/realmadrid` covers both Modrić and Ronaldo's histories, `r/Barca` covers Messi
- **Warm up before posting:** comment 2–3× in an active thread (no link) before dropping a linked post. Drive-by self-promo gets removed even when the content is good.
- **Reply, don't post, when you find a thread that's already debating your topic.** Example: a 7-day-old r/worldcup thread debating "Portugal stacked but held back by 41-year-old Ronaldo" — reply with the "not tactical, terminal" reframe + per-player URL. The OG card preview in the reply does the selling.
- Bare URLs on their own line render with the OG card preview directly in the comment. Don't bury URLs in markdown brackets.
- Each country/club sub gets ONE post, spread over a week. Mods cross-check; don't copy-paste the same framing.
- **Existing personal Reddit account, NOT a new brand account.** AutoMod auto-removes posts from low-karma/new accounts in most football subs. Personal account with even 50+ karma clears the filter.

### Subs to avoid for this project

- **Hacker News:** wrong audience, would not perform
- **Product Hunt:** for software, not editorial sites
- **TikTok / YouTube Shorts:** wrong format unless committing to video content
- **Facebook:** declining organic reach, older demographic, not where football discussion lives
- **Instagram feed posts:** zero off-platform click conversion — IG actively suppresses outbound links

### Timing for the tournament window

- **Pre-tournament (now through June 10):** awareness build via Reddit + X
- **Opening week (June 11+):** repost on every platform with the "kickoff today" angle; this is when search/scroll volume for "World Cup 2026" peaks
- **During tournament:** standalone "milestone hit" tweets after every match a featured player plays
- **Post-tournament:** SEO compounds; long-tail queries like "Modrić last World Cup" start ranking 3–6 months out

## OG card cache busting

The OG cards we generate (site-level + per-player) are correct on the server, but every messaging platform caches link previews aggressively. **A URL that was shared before today's per-player-OG push will continue showing the OLD generic card for days** until the platform re-fetches.

| Platform | Cache window | Force-refresh tool |
|---|---|---|
| iMessage | ~24–48h per device | Delete the message + re-paste; or send to a contact who's never seen the URL |
| Twitter / X | ~7 days | [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) |
| LinkedIn | ~7 days | [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) |
| Facebook / Threads | ~30 days | [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/) |
| WhatsApp | ~30 days | None public — wait it out, or use a new URL |
| Slack | hours to days | Delete + re-post; or `/unfurl-cache` on paid plans |
| Discord | a few hours | Delete + re-paste usually works |

**Sanity-test the live OG endpoint directly** (bypasses all caches):

```
https://finalchapterfc.com/player/<id>/opengraph-image
```

Opening that URL in any browser shows the actual generated PNG — what crawlers receive on first fetch.

## Parked ideas (built, removed, may revisit)

### Shareable player career card

**What it was.** A vertical "trading card" on each player page showing flag + name + WC stat trio (goals/assists/apps) + a row of year stamps (gold-filled for champion years, dashed border for 2026). A "Share this card →" button generated a PNG via `<canvas>` and either invoked `navigator.share({ files: [...] })` (mobile) or downloaded the file (desktop).

**Why we removed it for MVP** (decision: 2026-05-24):

1. **Two implementations to maintain.** The HTML card and the canvas card were separate ~120-line implementations of the same visual; the canvas already had drifted (stale `finalchapter2026.com` URL while the HTML pointed at `finalchapterfc.com`).
2. **Maintenance load disproportionate to payoff** for a 5-page site — the OG image already covers ~90% of "look at this site" sharing when the URL is pasted into iMessage/X/Slack.
3. **Mobile/desktop UX divergence** — the same button gave a slick share sheet on mobile and an opaque "PNG appeared in Downloads" experience on desktop.

**If we bring it back, two clean paths:**

- **Minimal (recommended):** a single "Share this page" button that calls `navigator.share({ url, title, text })`. ~10 lines, no canvas, no PNG, no drift. The recipient's app uses the OG image automatically. This is what 95% of fan sites actually need.

- **Full sticker (revisit if Instagram Stories matters):** instead of canvas-redrawing the card, generate the PNG at build time via `next/og` (same machinery as our OG/Apple icons) at e.g. `app/player/[id]/share-card.png`. Single source of truth, real Playfair fonts available, no client-side canvas browser quirks. Reference it from a Web Share API call. The old canvas approach is the wrong implementation; ImageResponse is the right one.

**The original component, CSS, and import call sites are preserved in git history** at commit `d42bc84` (`app/components/ShareCard.js` + `.share-*` / `.wc-stamp*` rules in `globals.css`). If reviving: `git show d42bc84:app/components/ShareCard.js` is a starting point but rebuild via `next/og` rather than copying the canvas code.

## Quick checks after any deploy

1. **Phone:** load https://finalchapterfc.com, click into a player, open the LEGENDS dropdown
2. **Countdown** is ticking and the day count matches `(2026-06-11T19:00:00Z − Now())`
3. **Per-player MatchCountdown** renders "Next up · …" above each schedule
4. **Records in Play** cards show with the gold top stripe
5. **OG preview (site-level):** paste `finalchapterfc.com` into iMessage → gold "The Final Chapter" 1200×630 card shows
6. **OG preview (per-player):** paste `finalchapterfc.com/player/messi` into iMessage → personalized Messi card with "3 from Klose" hook shows
7. **`Add to Home Screen`** on iOS → gold "F" icon, not a screenshot thumbnail
8. **Analytics dashboard** (Vercel project → Analytics tab): page views appearing within 1–2 min of a real visit (use mobile data / incognito if ad-blocker is suspected)
9. **`/robots.txt` and `/sitemap.xml`** return reasonable content (curl them or browse directly)
10. **Search Console** (whenever set up): no new structured-data errors on JSON-LD

## Verifying stats after editing `data/players.js`

This is important enough to repeat. After ANY content change in `data/players.js`, run the consistency check (see "Stat data integrity" section above). The page-level rendering uses `worldCups.length - 1` for the "WORLD CUPS" stat, which is independent from the `worldCupApps`/`worldCupGoals`/`worldCupAssists` totals. They MUST agree, or one of them is wrong.
