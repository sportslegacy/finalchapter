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
  sitemap.js                      # → /sitemap.xml: home + status + format + groups + 5 player URLs
  world-cup-2026-format/page.js   # SEO explainer for "world cup 2026 format" intent + SportsEvent/FAQPage JSON-LD
  world-cup-2026-groups/page.js   # SEO visual: full 48-team draw (12 group cards), 5 legend nations highlighted + linked + SportsEvent JSON-LD
  status/page.js                  # "Who's Still Standing" hub — live status of all 5 legends, sorted alive-first/deepest-stage; SportsEvent + FAQPage JSON-LD
  status/opengraph-image.js       # 1200×630 OG card: "{aliveCount} of 5 legends still in it" + 5 legend rows w/ stage label
  status/twitter-image.js         # re-exports status/opengraph-image
  road-to-the-final/page.js       # "Road to the Final" — each legend's knockout path drawn as a single straight left-to-right lane (5 lanes), so one nation's route is readable (a symmetric bracket tree isn't). Lit nodes derive from wc2026.status; opponent/score labels from optional wc2026.knockout[]. SportsEvent JSON-LD. Sorted alive-first/deepest (mirrors /status)
  player/[id]/page.js             # per-player detail page (SSG'd for all 5 ids) + JSON-LD Person schema; opens with the live status strip
  player/[id]/opengraph-image.js  # PER-PLAYER 1200×630 OG card with photo + name + first milestone hook
  components/
    Nav.js                        # header w/ hamburger drawer + TWO inline dropdowns (Tournament▾ = the 4 secondary pages /status, /road-to-the-final, /world-cup-2026-format, /world-cup-2026-groups; Legends▾ = the 5 players); logo scrolls-to-top when already on "/"
    Countdown.js                  # site-wide ticker to the tournament opener
    MatchCountdown.js             # per-player ticker to their first group match (handles TBD)
    HashScroll.js                 # smooth-scroll for /#section links
    CountUp.js                    # animates profile stat numbers 0→value on scroll-in (IO + reduced-motion aware)
    GoalChart.js                  # "goals by World Cup" bar chart on the player timeline (bars grow on scroll-in)
    ShopLinks.js                  # "Fan Shop" affiliate block on player pages — Amazon Associates (server component, no JS); links from playerShopLinks(player), rel="sponsored" + disclosure
  lib/navigate-to-section.js
data/players.js                   # all content
public/players/                   # editorial portraits per player (CC-licensed from Wikimedia)
  messi.jpg                       #   Hossein Zohrevand · CC BY 4.0 (2022 WC, Argentina fist-pump)
  ronaldo.jpg                     #   Анна Нэсси (Anna Nessi) · CC BY-SA 3.0 (2018 WC face close-up)
  modric-wc18.jpg                 #   Светлана Бекетова (Svetlana Beketova) · CC BY-SA 3.0 (2018 WC action, Croatia kit + armband)
  neymar-wc18.jpg                 #   Julia Engel (Granada) · CC BY-SA 4.0 (2018 Brazil-kit head-on portrait)
  debruyne.jpg                    #   Bryan Berlin · CC BY-SA 4.0 (Belgium anthem shot)
scripts/test-nav.mjs              # playwright test for nav dropdown widths
.claude/launch.json               # for Claude Preview MCP — points at `npm run dev` on :3000
```

### Player page section order

(See `app/player/[id]/page.js`.)

Everything below (after Nav, before footer) is wrapped in a `.player-accent-scope` div that sets inline CSS vars `--player-accent` / `--player-accent-2` from `colors.primary/secondary` — see "Per-player accent colors" gotcha.

0. **Live status strip** (`.status-banner`) — the page's cold-open above the hero. An editorial standing, NOT a search Q&A: gold `WORLD CUP 2026` label (section-label style) → serif-italic statement line from `statusStatement(player)` ("In the hunt." / "Into the Round of 16." / "Out — …" / "Champions. 🏆") → compact stage track (`STAGE_ORDER` pills, current highlighted) → `status.note` (opener/next-match line). Top padding clears the fixed 53px nav. See "Status strip is editorial, not a Q&A box" gotcha.
1. Profile hero — **editorial portrait** (4:5, accent-glow border, country flag emoji as small corner badge) → name (accent gradient) → country/position/age → quote → stats (stat numbers animate via `CountUp`)
2. **Final Chapter pull-quote** — accent pill + serif italic, sets thematic anchor
3. **Match Countdown** — "Next up · Country vs Opponent · in X days Y hours"
4. Group Stage Schedule — group badge, storyline, 3 match cards. A played match (one with a `result`) renders a W/D/L badge + score + scorers (`.match-result`, `outcome-w/d/l` colors); unplayed matches fall back to date/venue.
5. **Records in Play** — 3-card milestone grid ("3 from Klose", "Sixth WC", etc.)
6. Career Timeline ("Every Chapter") — one card per past World Cup + a 2026 "future" card; includes the `GoalChart` "goals by World Cup" bar chart
7. Bio + career honors tags + **"Also in The Final Chapter"** cross-link block (`relatedPlayers` → other legends with a shared-club/era relation; internal-SEO + bounce)
8. **Common Questions** — FAQ section (4 Q&As from `faqs[]`); also emits a second JSON-LD `<script>` with FAQPage schema (`buildFaqJsonLd`)
9. **Fan Shop** (`<ShopLinks player={player} />`, `.shop-section`) — Amazon Associates affiliate block: "Wear the Colors" header + 2 cards (national-team kit + player books) → tagged Amazon search URLs, with the required disclosure line. Inside `.player-accent-scope`, so cards pick up the national accent. See "Affiliate monetization" gotcha.
10. Prev/next player nav
11. Photo credit (CC attribution: author · license · Wikimedia source · "resized")
12. Site footer

### `data/players.js` schema per player

```js
{
  id, name, fullName, country, countryCode, countryFlag,
  colors: { primary, secondary },                                  // national accent colors — drives .player-accent-scope vars + homepage card
  position, birthDate, ageAtTournament, clubAtTournament,
  quote, worldCupGoals, worldCupAssists, worldCupApps,
  wc2026: {
    group, groupTeams[], storyline,
    status: { stage, alive, note },                                // LIVE status — single source of truth. stage ∈ STAGE_ORDER (group→…→champion) or "eliminated"; alive=false ⇒ out. Drives the player status strip, the /status hub, the dynamic <title>, and FAQ JSON-LD. note = short opener/next-match line.
    matches: [{ opponent, date, time, kickoffUtc, venue, city,
                result: { outcome, score, scorers } }],            // first match's kickoffUtc drives the countdown; null when TBD. result OPTIONAL — add per played game: outcome "W"|"D"|"L" (legend's nation POV), score "own-opp", scorers (legend first, optional). Absent ⇒ card shows date/venue.
    knockout: [{ stage, opponent, result: { outcome, score, scorers } }],  // OPTIONAL — labels for /road-to-the-final lane nodes. stage ∈ ROAD_STAGES (r32…final); add one entry per knockout round as it's played. The lane LIGHTS nodes from status.stage, NOT this array — knockout[] only supplies opponent/score captions. Absent ⇒ node shows the round date placeholder.
  },
  relatedPlayers: [{ id, relation }],                              // OPTIONAL — other legends to cross-link ("Barcelona & PSG teammate"); renders "Also in The Final Chapter" block
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
  faqs: [{ q, a }],                                                // 4 Q&As → "Common Questions" section + FAQPage JSON-LD
}
```

**Affiliate links (derived, not stored):** `data/players.js` also exports `AFFILIATE_TAG = "finalchapterf-20"` (Amazon Associates), `amazonSearchUrl(query)` (builds a tagged `/s?k=…&tag=…` search URL), and `playerShopLinks(player)` → `[{ label, sublabel, href }]` for the Fan Shop block. The two links per player (national-team kit + player books) are **derived from existing fields** (`player.country`, `player.name`) — no per-player shop content to maintain. We point at tagged *search* pages, not specific ASINs, so nothing breaks when an item goes out of stock; Amazon's 24-hour cookie credits any tagged link.

### `tournament` object schema (also in `data/players.js`)

```js
export const tournament = {
  name, tagline, hosts[], format,
  openingMatch: { date, time, timezone, kickoffUtc, teams, venue, city },
  final: { date, venue, city },
  hostCities: [{ city, country, venue }],                          // 16 venues → homepage #cities + format page
  keyDates: [{ date, event }],                                     // → homepage + format page "Key Dates"
  groups: [{ id, teams: [{ name, flag, host? }] }],                // FULL 48-team draw, 12 groups A–L → /world-cup-2026-groups
  faqs: [{ q, a }],                                                // 7 Q&As → homepage #faq + format page + FAQPage JSON-LD
};
```

**`tournament.groups`** is the single source of truth for the group-stage grid. All 12 groups (A–L) × 4 teams, in pot/seeding order, sourced from the **Dec 5 2025 draw** and verified vs FIFA + Wikipedia (commit `1380e41`). `host: true` marks the three predetermined host slots (Mexico A1, Canada B1, USA D1). The five legends' groups (C, G, J, K, L) **must stay in sync** with each player's `wc2026.groupTeams` — the groups page highlights them by cross-referencing `players[].wc2026.group`, so do NOT add a "legend" flag onto the group data. England/Scotland use the subdivision flag emojis (🏴󠁧󠁢󠁥󠁮󠁧󠁿 / 🏴󠁧󠁢󠁳󠁣󠁴󠁿). After editing groups, re-run the cross-check (see "Group-stage grid" gotcha).

### The three tournament SEO pages + internal linking

The site is really **5 player pages + 3 tournament pages**, internally cross-linked so Google can crawl between intents and visitors can bounce between "who," "how," and "where":

- **`/` (homepage)** — legends-first. `#tournament` section → groups page CTA ("See all 48 teams & the full group draw →"); `#faq` section → format page link ("Read the full 2026 format guide →").
- **`/world-cup-2026-format`** — prose explainer for "how the 2026 format works" (48 teams / Round of 32 / best-third-place). Links → groups page ("See the full draw →") AND → all 5 player pages (legends cross-link grid). Has the "bracket"/"knockout" keyword surface (the others don't).
- **`/world-cup-2026-groups`** — visual full draw, 12 group cards. The 5 legend nations are gold-highlighted `<a>` rows linking → their player pages. Links → format page. Scoped to "draw/groups" vocabulary (NOT "bracket").

All three carry SportsEvent JSON-LD; format + homepage also carry FAQPage; homepage also carries ItemList. All in the sitemap.

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

### Live status system — single source of truth + two phrasings (SEO vs on-page)

`wc2026.status = { stage, alive, note }` in `data/players.js` is the ONE place to edit a player's tournament state. Editing it ripples to: the player-page status strip, the `/status` hub (sort + card), the dynamic player `<title>`, and the FAQ JSON-LD. Helpers live in `data/players.js`:
- `STAGE_ORDER` / `STAGE_LABELS` / `STAGE_SHORT`, `stageLabel(stage)`, `stageIndex(stage)`.
- `statusHeadline(player)` → `{ q, a, alive }` — the **search-style Q&A** ("Is X still in…? Yes — …"). Used ONLY where answer-led phrasing wins clicks: the `<title>`, meta description, and FAQ JSON-LD (`buildFaqJsonLd` prepends it). GSC showed player pages ranking ~7 for the "is X playing/out" question cluster with near-zero CTR → leading the title with "Yes" converts.
- `statusStatement(player)` → a short **editorial serif line** ("In the hunt." / "Into the Round of 16." / "Out — …" / "Champions. 🏆"). Used for the on-page status strip only.

During the tournament: flip `status.stage`/`alive` (and update `note`) as each legend advances or goes out; add a `result` to the played match in `wc2026.matches[]` (see schema). That's the whole "reason to come back" loop.

### Road to the Final (`/road-to-the-final`) — lit by status, captioned by knockout[]

The five-lane knockout-path view (built 2026-06-06; the legends-lens alternative to a generic bracket — see backlog). Three rules so it stays accurate with near-zero maintenance:

1. **Lanes light from `wc2026.status.stage`, NOT from `wc2026.knockout[]`.** `playerRoad(player)` in `data/players.js` walks `ROAD_STAGES = ["group","r32","r16","qf","sf","final"]` and marks each node `reached` / `current` / `out` / `upcoming` purely off `stageIndex(status.stage)` (+ champion/eliminated). So advancing a legend is the SAME one-line `status.stage` edit that already drives `/status` and the player strip — no second source of truth.
2. **`wc2026.knockout[]` only supplies opponent/score captions.** Optional array of `{ stage, opponent, result }` (schema above). Add one entry per knockout round as it's played; absent ⇒ the node shows the round-date placeholder ("from Jun 28"). Don't put group data here — the group node names the group from `wc2026.group`.
3. **Reached-pill background MUST stay opaque** (`color-mix(... 18%, var(--bg-card))`, NOT `..., transparent`). The connector line runs behind the pills; a transparent reached-pill lets the gold line bleed through the round label and reads as a strikethrough. Caught + fixed during build; don't revert to a transparent tint. Also: the 7-node track is tuned to fit a 375px mobile viewport (small pills/captions, `min-width:0`) — re-measure `scrollWidth<=clientWidth` if you change node sizing, or the Final + trophy get clipped (the whole point is seeing the WHOLE road).

Sorted alive-first/deepest (`rank()`, mirrors `/status`). `isChampion(player)` drives the trophy cap.

#### "Who they could face" — projected opponents per lane (added 2026-06-06)

After shipping the lanes the user asked for "more than this, also easy to tell who are the potential opponents." Each still-alive, pre-knockout lane now carries a **"Who they could face"** panel with **two branches** (win the group vs finish 2nd), each listing the **R32 / R16 / QF** projected opponents. Derived 100% from the fixed bracket + the group draw at render time — **zero ongoing maintenance**; once real names exist (`wc2026.knockout[]`), the lane nodes above already show them, and this panel is hidden anyway once the legend is out/deep.

The bracket model lives in `data/players.js` (after `isChampion()`):
- **`R32_MATCHES`** (matches 73–88) maps each R32 slot to its two feeder slots, encoded as `"W:E"` (winner of E), `"RU:C"` (runner-up of C), or `"3:A,B,C,D,F"` (one of these groups' 3rd-place sides — the 8 best-thirds are unassigned until June 27). **`KO_TREE`** (89→104) maps each later match to its two feeder matches. Both verified against Wikipedia "2026 FIFA World Cup knockout stage."
- **`projectedPaths(player)`** → `{ group, win[], runnerUp[] }`. `projectBranch(group, finish)` finds the legend's R32 match, takes the *other* slot as the R32 opponent, then walks `KO_TREE` parents taking the *sibling* subtree's seed teams for R16/QF.
- The page renders only **`rounds.slice(0, 3)`** (R32/R16/QF) — SF/Final fan out across half the draw, too many candidates to name.

**Two accuracy gotchas (don't revert):**
1. **No team chips for an open 3rd-place R32 slot.** `r32OpponentRound` returns `teams: []` when the slot spans multiple groups (`"3:D,E,I,J,L"`) — the occupant is a genuinely-unknown 3rd-placed side, and is **never** a group's seed/winner. Showing seed chips there was misleading (implied Portugal could meet Argentina in the R32). The prose line ("3rd place · Group D/E/I/J/L") carries it instead. Single-group slots still show all four group teams.
2. **`siblingOpponentRound` names a position-matched representative team for every slot, via `groupNth(letter, i)`.** Groups in `data/players.js` are stored in pot/seeding order, so `t[0]` is the projected group winner and `t[1]` the projected runner-up. A "Winner · Group B/K" slot shows each group's **top seed** (Canada, Portugal — the favourite to win, and where legend-vs-legend collisions surface, e.g. Portugal's QF "Winner · Group J" → Argentina); a "Runner-up · Group D/G" slot shows each group's **2nd seed** (Paraguay, Egypt — the favourite to finish 2nd). Both are pot-seeding projections disclaimed by the panel header. **NEVER show the top seed under a "Runner-up" label** — the top seed is the team *least* likely to finish 2nd, so "Runner-up → United States" is self-contradictory (this was a real bug, twice). The "or a 3rd-place side" pill still appears when the sibling subtree contains a thirds slot (`hasThirds`). (The R32 row is different — a single concrete group, so it lists all 4 of that group's teams via `r32OpponentRound`.)
3. **The Winner/Runner-up/3rd-place seed word is bold + accent-colored** (`.proj-round-seed`). When a legend's two branches face the *same group* at R32 (e.g. Argentina play a Group H side whether they win J or finish 2nd), the team chips are identical and the seed word is the *only* difference — so it must read at a glance, or the two branches look like a copy-paste bug.

The panel only renders for `!out && !champ` lanes (`projectedPaths` returns null without a `group`). Styles: `.road-proj` / `.proj-branch` / `.proj-round*` / `.proj-team*` in `globals.css`; two-column grid → single column at ≤640px. Picks up the national accent inside the lane's `--player-accent` scope.

### Status strip is EDITORIAL, not a Q&A snippet box (don't revert)

The player-page status strip first shipped (2026-06-05) literally rendering `statusHeadline`'s `q`+`a` — "Is Cristiano Ronaldo playing in the 2026 World Cup? / Yes — Portugal are in Group K." It read like a Google featured-snippet widget grafted onto the tribute page → off-brand against the serif/editorial tone (user flagged it "weird and not cohesive"). Reshaped into: gold `WORLD CUP 2026` label (section-label vocabulary) + serif-italic `statusStatement()` line + stage track + note. **Keep the on-page strip editorial; keep the Q&A phrasing in title/meta/JSON-LD where it earns clicks.** Don't merge the two back together. Also: the strip is the first element on the page, so `.status-banner-inner` carries top padding to clear the fixed 53px nav (without it the label hides under the nav and the statement reads orphaned).

### No share buttons — they don't fit our distribution (removed 2026-06-05)

A `ShareButton` component (Web Share API + clipboard fallback) was built for `/status` and reused on player pages, then **removed entirely** (component deleted, `.status-share-btn` CSS gone). Rationale grounded in real data: Reddit (our only working channel, ~80% of referrals) does NOT render OG cards in comments — only link-posts do — and X is dead at our scale (~20 views/post). An on-page share button is decorative. If sharing ever matters again, the right move is a single `navigator.share({ url, title, text })` call (see Parked Ideas), not a styled button — but default is no share UI.

### Affiliate monetization — Amazon Associates "Fan Shop" (first revenue, 2026-06-06)

The site's first monetization: a per-player **Fan Shop** block (`app/components/ShopLinks.js`, rendered as section 9 on each player page) linking to Amazon via the Associates tag **`finalchapterf-20`**. Links come from `playerShopLinks(player)` in `data/players.js` (national-team kit + player books, derived from `player.country`/`player.name` — no per-player shop content to maintain) and use tagged *search* URLs (`amazonSearchUrl`) rather than specific ASINs, so nothing breaks when products go out of stock.

**Two Associates program rules are MANDATORY — don't remove them:**
1. Every affiliate link must carry **`rel="sponsored"`** (ShopLinks uses `rel="sponsored noopener noreferrer"`). Stripping `sponsored` is a program violation.
2. The affiliate relationship must be **disclosed near the links** — ShopLinks renders "As an Amazon Associate, The Final Chapter earns from qualifying purchases." Keep it.

`AFFILIATE_TAG` in `data/players.js` is the single source of truth for the tag — change it there, not in markup. ShopLinks is a **server component (no client JS)** and renders inside `.player-accent-scope`, so cards pick up the national accent on hover. `.shop-*` styles live in `app/globals.css`. Commit `9e5b486`.

**Hobby-plan ToS caveat now live:** the top-of-file note says Vercel Hobby forbids commercial use — with affiliate revenue now wired in, the site is technically in violation. If this earns meaningfully, upgrade to **Vercel Pro ($20/mo)**. Until then it's a known, accepted risk for a tiny-traffic fan site.

### Per-player accent colors — `.player-accent-scope`

Each player's `colors: { primary, secondary }` (in `data/players.js`) flow into the page via a wrapper div that sets inline CSS vars:

```jsx
<div className="player-accent-scope" style={{ "--player-accent": player.colors?.primary || "var(--accent-gold)", "--player-accent-2": player.colors?.secondary || "var(--accent-gold-dim)" }}>
```

CSS then reads `var(--player-accent, ...)` for the name gradient, stat numbers, section labels, milestone stripe, photo glow, etc. The homepage legend cards use the **same** inline-var pattern per `.player-card`. Tints use `color-mix(in srgb, var(--player-accent) X%, transparent)`. Always provide the gold fallback so a player missing `colors` still renders.

### Nav logo scrolls to top when already on the homepage

`<Link href="/">` is a no-op when you're already on `/` (path unchanged → nothing happens, looked like a dead click when scrolled down). `Nav.js`'s `onLogoClick` detects `pathname === "/"`, `preventDefault`s, and smooth-scrolls to top instead. On player pages it lets the Link navigate home normally. Don't revert it to a bare `onClick={closeAll}`.

### Swapping a `public/players/*.jpg` — RENAME the file, don't overwrite in place

Replacing a portrait at the **same path** leaves stale copies everywhere the URL is the cache key:
- **Browsers** cache `/players/<id>.jpg` (the homepage card is a plain `<img>`, so a returning visitor keeps seeing the OLD photo there).
- The **player page** uses `next/image` → a *different* URL (`/_next/image?url=...`), which busts independently. Net effect: homepage shows old, player page shows new — they look like two different photos. (This is exactly what happened with Neymar/Modrić; fixed by renaming.)

**Rule:** when you change a player's photo, give the new file a fresh name (e.g. `neymar-wc18.jpg`) and update `photo.src` in `data/players.js`. Everything (homepage card, player `<Image>`, OG card, JSON-LD) derives from `photo.src`, so one rename busts all caches consistently. Don't reuse the old filename.

Local dev has a milder version of the same staleness: after editing, the raw file at `http://localhost:3000/players/<file>.jpg` updates but the page's `next/image` render can lag. In Claude Preview MCP, `location.reload(true)` then verify via `naturalWidth/naturalHeight` ratio (0.667 for an 800×1200 portrait vs ~1.5 for a landscape) before screenshotting.

### CC photo sourcing — 2022 Qatar World Cup shots are scarce

Most freely-licensed (CC) football photos on Wikimedia Commons come from **Russia 2018 and earlier** (soccer.ru photographers, etc.). Qatar 2022 match photography was tightly controlled → almost all 2022 shots are copyrighted (Getty/AP) and unusable. When refreshing portraits, expect the best CC option to be a 2018 WC or recent-friendly national-team shot, not 2022. Exceptions found: Messi's 2022 fist-pump (CC BY 4.0) and a Ronaldo 2022 WC shot (CC BY 4.0, but full-body → frames poorly as a tight portrait, so we kept his 2018 face close-up). To download a Commons original: `curl -L -A "FinalChapterBot/1.0 (contact <email>)" "https://commons.wikimedia.org/wiki/Special:FilePath/<File_Name>.jpg" -o out.jpg`. Always confirm license + author on the file page before use, then update `data/players.js → photo` and re-verify the `.photo-credit` block renders the new attribution.

### Opening-match kickoff time — FIFA's widget is wrong

`tournament.openingMatch.kickoffUtc` is **`2026-06-11T19:00:00.000Z`** — that's 13:00 Mexico City local / 15:00 ET. This is the **official** kickoff (Yahoo, Roadtrips, Wego, FOX all agree).

FIFA's own homepage countdown widget appears to run ~1 hour late (showing 20:00 UTC). **Don't "fix" our countdown to match FIFA's widget** — ours is correct, theirs is off.

### Nav dropdowns (Tournament ▾ and Legends ▾) — two splits, shared CSS

The inline nav row is `Tournament▾ | Legends▾ | Cities`. Both "Tournament" and "Legends" are **split items**: the label is an `<a>` that scrolls to the homepage section (`/#tournament`, `/#legends`), and a chevron `<button>` toggles a dropdown panel. Tournament's panel = the 4 secondary PAGES (`TOURNAMENT_PAGES` array in `Nav.js`); Legends' panel = the 5 players. Built 2026-06-06 to make `/status`, `/road-to-the-final`, `/world-cup-2026-format`, `/world-cup-2026-groups` reachable from the nav on desktop (the hamburger drawer — the prior only route to them — is hidden ≥769px).

Three things NOT to revert:
1. **Both panels share the `.nav-legends-panel` CSS**; the tournament panel adds `.nav-tournament-panel` ONLY to flip the desktop anchor from `right: 0` (Legends, right side of row) to `left: 0` (Tournament, left side of row). Without the left-anchor the Tournament panel drops under Cities, misaligned.
2. **The chevron-rotate + open-toggle-highlight CSS keys off `aria-expanded`** (`.nav-legends-toggle[aria-expanded="true"]`), NOT the old `.site-nav.legends-open` nav-level class. Both toggles carry `.nav-legends-toggle`, so a nav-level class would rotate/highlight BOTH chevrons when either opens. Per-toggle `aria-expanded` scopes it correctly. (The `legends-open`/`tournament-open` classes are still set on `.site-nav` but no longer drive the chevron.)
3. **The two dropdowns are mutually exclusive + close on outside-click.** Each toggle's onClick closes the other dropdown and the menu; each has its own `useEffect` outside-click handler keyed to its `ref` + toggle class. The hamburger button closes both.

The Tournament split li has class `nav-tournament-item` (NOT `nav-legends-item`), so the `@media (max-width:430px)` `:not(.nav-legends-item)` rule still hides it on tiny phones — only the Legends dropdown stays inline there, same as before; the 4 pages fall back to the drawer.

### Nav dropdown chevron on narrow phones

At < 430px viewport, the `Tournament | Legends + chevron | Cities` row used to overflow and the chevron got pushed off-screen on iPhone 17 (393pt). Fix lives in `app/globals.css` — a `@media (max-width: 430px)` rule (`.nav-links > li:not(.nav-legends-item)`) that hides the Tournament and Cities inline items (they're still in the hamburger drawer), leaving only the Legends dropdown. Don't undo it.

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
3. Drop it into `public/players/` under a **NEW filename** (e.g. `<id>-wc18.jpg`) — never overwrite the existing file in place, or browser/CDN caches will keep serving the old photo on the plain-`<img>` homepage card. See the "RENAME the file" gotcha.
4. Resize: `sips -Z 1200 public/players/<file>.jpg --setProperty formatOptions 80`. Keeps long-edge ≤ 1200px and quality at 80% — yields ~150–300KB per file.
5. Update `data/players.js → players[i].photo` (`src` to the new filename, plus credit/license/source).
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
- Modrić "Oldest captain in the field" — **false**. Ronaldo at 41 captains Portugal and is older than Modrić at 40. **Always check comparative-age claims against Ronaldo first** — he's the oldest outfield player + captain at the tournament. Anyone claiming "oldest X" for Modrić, Messi (39), Neymar (34), or De Bruyne (35) is wrong by default. Fixed by replacing the milestone with "Fifth World Cup at 40" (Croatia missed 2010 qualifying — a true Modrić-specific fact).

**Trusted sources for verification:**
- Wikipedia "Lionel Messi at the FIFA World Cup" / per-player WC articles — game-by-game appearances and goals
- Wikipedia "List of international goals scored by [player]" — definitive goal list
- `thesoccerworldcups.com/players/<name>.php` — clean per-tournament totals (apps + goals)
- FIFA's player profile pages on fifa.com — sometimes outdated but authoritative when current

**Assist counts are the murkiest stat.** FIFA, Opta, StatsBomb, and Wikipedia frequently differ on what counts as an assist. Don't waste time chasing perfect parity across providers. As long as our per-WC entries sum to the page total, the page is internally consistent — that's the bar.

### JSON-LD must be SERVER-rendered; client components cause React #418 + Google "duplicate field"

Two separate bugs hit us here (May 2026) — both fixed, don't reintroduce.

1. **FAQPage "Duplicate field" in Google Rich Results.** React 19 re-inserts inline `<script type="application/ld+json">` on hydration, so prod DOM ended up with 2 copies of each block. Google read the dupes and flagged "Duplicate field FAQPage."
2. **Minified React error #418 (hydration mismatch).** First fix attempt rendered the ld+json from a *client* component — that fixed the dupes but threw #418, which surfaced as a scary "Uncaught Error" in the console.

**The working design (keep it):**
- **`app/components/JsonLd.js` is a plain SERVER component** — just returns `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`. Do NOT add `"use client"` to it.
- **`app/components/JsonLdDedupe.js` is a client component that renders `null`** — in a `useEffect` it walks `document.querySelectorAll('script[type="application/ld+json"]')` and removes textually-duplicate copies left behind by hydration. Mounted once per page (homepage + player page).
- Net result verified in prod: homepage = 2 ld+json (SportsEvent + ItemList), player page = 2 (Person + FAQPage), no dupes, no #418.

### Countdown timers caused the OTHER #418 — fixed via mounted-gate / suppressHydrationWarning

The countdowns render time-relative text, so the build-time HTML never matches the first client render → hydration mismatch (#418). Two fixes already in place — don't revert:
- **`Countdown.js`**: the `.countdown-value` div has `suppressHydrationWarning` (its structure is fixed — 4 unit tiles — only the digits differ, so suppressing is safe).
- **`MatchCountdown.js`**: uses the **mounted-gate** pattern — `useState(null)`, set `now` in `useEffect`, and early-return a stable placeholder (team names only, no ticking value) while `now === null`. Its rendered *structure* varies with the time remaining, so suppressing isn't enough — it must not render any time-relative content until mounted.

**Rule:** any new component that renders a clock, "X days ago", random value, or `Date`-derived text must use one of these two patterns, or it'll throw #418 in prod.

### "A lot of links are broken" was a false-positive — don't chase it

A link-checker browser extension red-boxed many links and the user reported them broken. They were NOT: `curl -w "%{http_code}"` confirmed every URL returned 200, and analytics showed 3.7 pages/visit (real users navigating fine). The extension was reacting to the React #418 console error (now fixed), not to any actual dead link. The prev/next player nav links are valid `<Link>`s — just dim-styled by design. **If links are reported broken again: first `curl` the URLs for status codes and check analytics pages/visit before touching any link markup.**

### Short-URL redirects — long keyword slugs stay canonical (2026-06-07)

The two tournament SEO pages live at the **long, keyword-rich slugs** `/world-cup-2026-format` and `/world-cup-2026-groups` — those are canonical and must stay so (sitemap, `<link rel=canonical>`, OpenGraph URLs, and all internal links point at them; the keywords in the path are a ranking signal matching real query intent).

The short forms people guess/type (`/format`, `/groups`, `/group`) are **308 permanent redirects** to the canonical long slugs, declared via `async redirects()` in `next.config.mjs`. A 308 passes ranking signal through and tells Google the canonical lives at the long slug, so the aliases don't split or dilute SEO. They work on the static deploy because **Vercel serves redirects at the edge** (no SSR needed). Verified locally with `next start` + curl (308 → canonical, both targets 200). Commit `51b78b5`.

**SEO rule:** anything a crawler indexes or you link internally → the long slug. Short forms are human-convenience only (say-out-loud, Reddit comments) — the redirect lands them on the canonical page. **NEVER put a short URL into the sitemap or a canonical tag.** If you add more SEO pages later, follow the same pattern: long keyword slug canonical + optional short 308 alias.

### Responsive sizing — compact mobile BASE + `@media (min-width: 769px)` desktop scale-up (2026-06-07)

`/status` cards and the `/road-to-the-final` "Who they could face" projection panels read small on both desktop (content capped at a narrow max-width, empty side margins) and on physically-larger phones (base sizes tuned for 375px). Fixed in two layers in `globals.css`:
1. **Desktop** — widened `.status-grid` from `max-width: 900px` to `var(--max-width)` (1200px) and added a `@media (min-width: 769px)` block (matches the nav desktop breakpoint) scaling up status-card photo/name/track and `.proj-*` panel type.
2. **Phone** — raised the **base** `.status-card` and `.proj-*` font/photo sizes. The user judges absolute readability on a real device, not relative correctness — verifying "the desktop block doesn't apply + no overflow" is NOT enough; eyeball the base sizes at native size.

**HARD constraint that survived all bumps:** `.road-track` (the 7-node knockout lane) must fit a 375px viewport with `scrollWidth <= clientWidth` — measured 264px == 264px, ZERO slack. NEVER enlarge the track nodes/captions or the Final node + trophy clip. Re-measure across all 5 lanes after any node-sizing change. Commits `394fc1b`, `701951e`, `8ed0a7e`, `fad9ef5`.

### SportsEvent JSON-LD enhancement fields (GSC "Improve item appearance")

Google flagged 4 *optional* enhancement suggestions (0 errors) for the SportsEvent schema. Three are now added to BOTH the homepage `eventJsonLd` (`app/page.js`) and the player-page `buildPersonJsonLd` `subjectOf` SportsEvent (`app/player/[id]/page.js`), commit `9e7881b`:
- `image` (homepage uses `/opengraph-image`; player pages use the portrait)
- `location` as `Place` + `PostalAddress` with `addressCountry` (US / CA / MX) — not bare `Country`
- `performer` as `SportsTeam` (homepage = all 5 nations; player page = that player's nation)

**`offers` is intentionally SKIPPED** — that field is for ticketed events; this is an editorial fan site with nothing to sell. It'll stay as a harmless optional suggestion in GSC forever; don't "fix" it.

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

- **Shareable player "career card"** — see Parked Ideas below; we built this and removed it for MVP.
- **`error.js` boundary** — pure static + no API means basically nothing to crash, but it's polite.
- **A11y audit** — Lighthouse pass; spot-check contrast tweaks.
- **PWA manifest beyond `apple-icon`** — service worker / offline play.
- ✅ **Match-result updates during the tournament** — ENGINE BUILT 2026-06-05. Add a `result: { outcome, score, scorers }` to the played match in `wc2026.matches[]` (schema above) — it renders on the schedule card + `/status`. Also flip `wc2026.status` as legends advance/exit. This is the manual returning-visitor loop (~5 min/game); no active results in prod yet.
- **Generic knockout bracket page** — STILL deliberately NOT built (decided 2026-06-01). A full 104-match symmetric bracket tree is the saturated, maintenance-trap space: "world cup 2026 bracket" demand is HIGH but owned by purpose-built **interactive predictor** tools (bracket2026.com, cup-predictor.com, worldcuppass.com, CNN, Covers) an editorial static site can't out-execute. **What we DID build instead (2026-06-06): `/road-to-the-final`** — the pre-approved legends-lens take, but framed as five single-line *path lanes* rather than a fillable bracket. It needs no speculative R32-slot table (lit nodes derive from `wc2026.status`; opponent/score labels come from the optional `wc2026.knockout[]` array filled in per round from June 28). See "Road to the Final" gotcha below. The generic predictor remains off the table; revisit a fuller knockout surface only if GSC shows `/road-to-the-final` or `/world-cup-2026-format` pulling steady bracket/knockout impressions.
- ✅ **"Tournament ▾" nav dropdown** — BUILT 2026-06-06 (this is the "fold Format + Groups into a Tournament menu" refactor the old backlog note proposed). The inline "Tournament" item is now a split (label still scrolls to `/#tournament`; a chevron toggle opens a panel of the 4 secondary PAGES: Who's Still Standing, Road to the Final, How the 2026 Format Works, All 12 Groups). Mirrors the existing Legends split exactly — shares `.nav-legends-*` styling; the panel anchors LEFT (`.nav-tournament-panel { left: 0 }`) since Tournament sits on the left of the row, vs Legends' right anchor. The 4 pages also list in the hamburger drawer's Navigate section (both fed by the shared `TOURNAMENT_PAGES` array). See "Nav dropdowns" gotcha. This closed the desktop-discoverability gap: `/status`, `/road-to-the-final`, `/world-cup-2026-format`, `/world-cup-2026-groups` were previously reachable from the nav ONLY via the hamburger drawer, which is hidden ≥769px.

### Shipped — was on this list previously
- ✅ **`/road-to-the-final`** — five legends' knockout paths as single straight lanes (the legends-lens alternative to a generic bracket). Lit nodes from `wc2026.status`; opponent/score captions from optional `wc2026.knockout[]`. SportsEvent JSON-LD, in sitemap (daily, 0.8), cross-linked from `/status`. See "Road to the Final" gotcha. (2026-06-06)
- ✅ **Affiliate monetization (Fan Shop)** — Amazon Associates per-player block (tag `finalchapterf-20`), first revenue mechanism. See "Affiliate monetization" gotcha. (commit `9e5b486`, 2026-06-06)
- ✅ **Tournament SEO pages:** `/world-cup-2026-format` (prose explainer) + `/world-cup-2026-groups` (full 48-team draw visual, 5 legend nations highlighted + linked). Bi-directionally cross-linked with homepage + each other + player pages. See "The three tournament SEO pages" above. (commits `abcd4c1`, `1380e41`, `07f0ac6`)
- ✅ Homepage + format-page **tournament-format FAQ** (7 Q&As from `tournament.faqs`) + FAQPage JSON-LD — validated real format-confusion demand via keyword research.
- ✅ Editorial photo per player (5 CC-licensed Wikipedia photos in `public/players/`)
- ✅ `robots.txt` + `sitemap.xml` (auto-generated via `app/robots.js` + `app/sitemap.js`)
- ✅ Per-player OG images (`app/player/[id]/opengraph-image.js`, photo + name + first milestone hook)
- ✅ JSON-LD structured data (SportsEvent + ItemList on homepage, Person + FAQPage on player pages)
- ✅ Per-player accent colors (`colors: { primary, secondary }` in `data/players.js`) — drive the `.player-accent-scope` chrome on detail pages AND the homepage legend cards (top stripe, name, age badge, CTA, hover glow)
- ✅ Animated profile stat numbers (`CountUp`) + "goals by World Cup" bar chart (`GoalChart`)
- ✅ Per-player FAQ sections + FAQPage JSON-LD (SEO / People-Also-Ask)
- ✅ Homepage legend cards: portrait banner + national color (was text-only flag + stats)
- ✅ JSON-LD hardened: server-rendered `JsonLd` + `JsonLdDedupe` (fixes Google "duplicate FAQPage"); see gotcha
- ✅ React #418 hydration error eliminated (Countdown `suppressHydrationWarning` + MatchCountdown mounted-gate)
- ✅ SportsEvent enhancement fields (`image`, `location`→Place+address, `performer`) on homepage + player pages

## Session handoff — current state (last updated 2026-06-07)

Quick orientation for a fresh session. Details live in the gotchas + "three tournament SEO pages" section above.

**2026-06-07 session — responsive sizing + short-URL redirects:**
- **Enlarged `/status` cards + `/road-to-the-final` projection panels** on both desktop and phone (the "looks small" feedback). Two-layer fix: widened `.status-grid` to `var(--max-width)` + a `@media (min-width:769px)` scale-up block, AND raised the base mobile sizes. The `.road-track` 7-node lane stays untouched (375px fit constraint, zero slack). See "Responsive sizing" gotcha. Commits `394fc1b`, `701951e`, `8ed0a7e`, `fad9ef5`.
- **Short-URL redirects** — `/format`, `/groups`, `/group` now 308 → the canonical long slugs (`async redirects()` in `next.config.mjs`). Long keyword slugs remain canonical for SEO; short forms are human-convenience only. See "Short-URL redirects" gotcha. Commit `51b78b5`.
- **SEO confirmed complete** for the recent pages — sitemap (9 URLs) + robots + per-page metadata/JSON-LD already cover `/status`, `/road-to-the-final`, `/world-cup-2026-format`, `/world-cup-2026-groups`. No changes needed there.

**2026-06-06 session — first monetization + status-strip polish:**
- **Amazon Associates "Fan Shop"** — first revenue mechanism. Per-player block (`app/components/ShopLinks.js`) links to national-team kit + player books via tagged Amazon search URLs (tag `finalchapterf-20`, single source of truth: `AFFILIATE_TAG` in `data/players.js`). Server component, `rel="sponsored"` + Associates disclosure, picks up national accent inside `.player-accent-scope`. Commit `9e5b486`. **Hobby-plan commercial-use ToS now technically violated** — upgrade to Vercel Pro if revenue becomes meaningful. See "Affiliate monetization" gotcha.
- **Status strip reshaped to editorial** — the player-page status banner shipped first as a literal SEO Q&A box ("Is X playing…? / Yes — …") and read off-brand ("weird and not cohesive"); reshaped to gold `WORLD CUP 2026` label + serif-italic `statusStatement()` line + stage track. SEO Q&A phrasing now lives ONLY in title/meta/FAQ JSON-LD. See the two "Status strip" / "Live status system" gotchas. Top-padded to clear the fixed 53px nav.
- **Share buttons removed site-wide** — `ShareButton` deleted (player strip + `/status`), grounded in distribution data. See "No share buttons" gotcha.
- **`/road-to-the-final`** — NEW page: each legend's knockout path drawn as a single straight left-to-right lane (the user's idea — symmetric brackets make one nation's route hard to trace; we deliberately did NOT build a generic predictor). Five `.road-lane`s, nodes lit from `wc2026.status` via new `playerRoad()` helper, opponent/score captions from optional `wc2026.knockout[]`. New exports in `data/players.js`: `ROAD_STAGES`, `KNOCKOUT_STAGE_DATES`, `playerRoad()`, `isChampion()`. SportsEvent JSON-LD, sitemap (daily, 0.8), cross-linked from `/status`. Verified in-tournament rendering with temp Messi data (reverted). Fixed a connector-line-bleed-through-pill (strikethrough) bug → reached-pill bg is opaque. See "Road to the Final" gotcha. Mobile 7-node track fits 375px.
- **Digest run** — discovery-only Reddit/news scan; top opportunities are the three laggard players (KDB Belgium 5-0 Tunisia live thread, Ronaldo hattrick-anniversary thread, Neymar joke thread). No posting done.

**2026-06-05 session — live status system + match results + cross-linking (all shipped & live in prod):**
- **`/status` "Who's Still Standing" hub** — NEW page tracking all 5 legends through the tournament; sorts alive-first/deepest-stage, eliminated to the bottom; each card links to the player. SportsEvent + FAQPage JSON-LD, OG + twitter image, in sitemap (priority 0.9, daily), linked from homepage (after legends grid) + Nav hamburger drawer (NOT the inline row — width-test guard) + `/world-cup-2026-groups` cross-link. Commit `889505f`.
- **Live status system** — added `wc2026.status = { stage, alive, note }` to every player as the single source of truth + helpers (`statusHeadline` for SEO Q&A, `statusStatement` for the editorial on-page line, `STAGE_ORDER`/`stageLabel`/`stageIndex`). Player `<title>` is now answer-led ("Yes — …") to convert the question-cluster impressions GSC flagged. See "Live status system" + "Status strip is editorial" gotchas.
- **Player status strip** — opens each player page (above the hero). Shipped first as a literal SEO Q&A box, then **reshaped to editorial** (gold `WORLD CUP 2026` label + serif-italic statement + stage track + opener note) after the Q&A read off-brand. Top-padded to clear the fixed nav. Commits `08aed1d` (reshape), `d8c6020` (nav-clearance fix).
- **Match-result engine** — optional `result: { outcome, score, scorers }` on `wc2026.matches[]`; renders W/D/L badge + score + scorers on the schedule card and "Last: …" on the `/status` cards. Currently NO active results in prod (verified end-to-end with a temp Messi result, then reverted). Commit `054f72d`.
- **Bio cross-linking** — `relatedPlayers` on 4 players (Messi↔Neymar "Barcelona & PSG"; Ronaldo↔Modrić "Real Madrid") → "Also in The Final Chapter" block. KDB has none. Commit `054f72d`.
- **Share buttons REMOVED site-wide** — `ShareButton` was built for `/status` + player strip, then deleted entirely (component + CSS) per "not our direction"; grounded in distribution data (Reddit comments render no OG card, X dead). Commits `794435e` (player), `a7f8f41` (status + component delete). See "No share buttons" gotcha.
- **GSC:** `/status` submitted via URL Inspection → Request Indexing (user did this).
- Stat-integrity check OK for all 5 after the `data/players.js` edits; every build compiled clean (24 routes).

**Open / next for the status system:** during the tournament, edit each player's `wc2026.status` (and add match `result`s) as games happen — that's the whole returning-visitor loop. Pre-tournament all 5 read `stage:"group", alive:true` with opener notes.

**2026-06-01 session — tournament SEO build-out (all shipped & verified live in prod):**
- **`/world-cup-2026-format`** — prose explainer page for the "how does the 2026 format work" intent (48 teams, Round of 32, best-third-place rule). SportsEvent + FAQPage JSON-LD. Validated demand first via keyword research (every major publisher has a format explainer). Commit `abcd4c1`. Footer link fixed to `/#legends` (was `/`, label said "legends" but landed on hero) — commit `da44ee8`.
- **`/world-cup-2026-groups`** — NEW: visual full 48-team draw, 12 group cards (A–L). Sourced from the Dec 5 2025 draw, **verified vs FIFA + Wikipedia** (our 5 legend groups already matched player data). The 5 legend nations are gold-highlighted `<a>` rows → player pages; 3 hosts badged. `tournament.groups` added to `data/players.js` as single source of truth. Commit `1380e41`.
- **Homepage `#tournament`** → groups CTA added ("See all 48 teams & the full group draw →"), commit `07f0ac6`. Internal linking across the legends/format/groups trio is now complete + bi-directional.
- **GSC:** both new pages submitted via URL Inspection → Request Indexing (format indexed within ~1 day — confirmed "URL is on Google," Events + FAQ valid, the Events "non-critical" issue is the intentionally-skipped `offers`).
- **Distribution digest:** Anthropic **Console credits topped up** — digest drafts working again (the digest's `ANTHROPIC_API_KEY` bills the Console, NOT the Claude.ai Pro subscription; that's why drafts failed at $0 earlier). 2026-06-01 digest top moves were Neymar (injury-cloud goal thread), Ronaldo (curse-debate), KDB (Stellini spat) — i.e. the laggard players are currently the hottest threads.

**Decisions made this session (don't re-litigate without new data):**
- **No bracket page** — demand is high but the space is saturated with interactive predictors; revisit only if GSC shows the format page pulling bracket/knockout impressions, and then only a post-June-27 legends-lens version. See backlog.
- ~~**No "Groups" nav entry**~~ — SUPERSEDED 2026-06-06: built the "Tournament ▾" dropdown (Status / Road to the Final / Format / Groups) + drawer entries. The 4 secondary pages are now nav-reachable on both desktop and mobile. See the Shipped backlog item + "Nav dropdowns" gotcha.
- **User is holding social posting** (as of 2026-06-01) to let the format/groups SEO work breathe before the next Reddit wave.

**Carried over from 2026-05-30 (CL-final wave — verify if still relevant):**
- PSG won the 2025/26 UCL (back-to-back under Luis Enrique). Neymar/galáctico Reddit angle was used on the `[Official] PSG wins` megathread. **Possible pending:** a Neymar comment URL may have been posted without `https://` (dead gray text) needing an edit — confirm with user if still open.

**Open / next actions (rough priority):**
1. **Watch GSC Performance** over the next 1–3 weeks for the new pages: impressions first (page 3–5), then position climbing. For the bracket question specifically, filter Query contains "bracket"/"knockout" on the `/world-cup-2026-format` page (it's the only one with that keyword surface).
2. **Resume Reddit** when ready — laggards Neymar + De Bruyne are currently the top digest threads. Run `zsh scripts/distribution/daily.sh` for a fresh queue.
3. **Bing Webmaster Tools** — import from GSC, submit sitemap (now includes format + groups URLs). Not done; needs user's login.
4. **Email capture** — biggest structural gap (the only owned audience). One-field "reminder before each legend's first match" form → one broadcast on June 11. Needs user to create a free Buttondown/ConvertKit account first.
5. ✅ **Player-bio cross-linking** — DONE 2026-06-05 (`relatedPlayers` → "Also in The Final Chapter" block: Messi↔Neymar, Ronaldo↔Modrić).

**Verification etiquette the user asked for:** avoid noisy/repeated permission prompts for headless-Chrome and `npm run build`. Self-test with a single build; only run the browser when a UI render is genuinely needed. After deploys, use Google's Rich Results Test for instant schema validation rather than waiting on GSC's crawl. NOTE: Claude Preview's scroll resets to top on these content pages (known quirk) — verify mid-page content via DOM queries / `getComputedStyle` rather than mid-scroll screenshots.

## Distribution playbook

Site went live May 24, 2026 — ~3 weeks before the tournament opener. Current analytics show ~16 visitors, 3.3 pages/visitor, 88% US traffic. Most growth ahead will come from social, not SEO (which compounds over months).

### What works for this site

**X / Twitter:**
- **HARD 280-CHARACTER LIMIT per post.** Always count before handing the user a draft — a single tweet that runs long can't be posted. Keep standalone tweets well under 280 (aim ≤250 to leave room). If the idea needs more room, split it into a thread (one beat per tweet) rather than one over-length post.
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
- **Reply, don't post, when you find a thread that's already debating your topic.** Example: a 7-day-old r/worldcup thread debating "Portugal stacked but held back by 41-year-old Ronaldo" — reply with the "not tactical, terminal" reframe + a clickable per-player URL. The clickable link does the converting (see "Reddit comment links" gotcha below — there is NO card preview in comments).
- **Reddit comment links: always include `https://`, and don't expect an OG card.** Two hard rules learned the hard way (2026-05-30):
  1. **Comments never render the OG card thumbnail** — that only happens on link *posts* (submissions). A comment link is just a blue hyperlink at best. The week-1 wins (Ronaldo 2→16, Messi 4→16) came from people *tapping a clickable link*, NOT from a card preview. Don't tell the user "the card will sell it" for a comment.
  2. **A bare domain with no scheme renders as plain gray un-tappable text** in Reddit's official mobile app. Always write the full `https://finalchapterfc.com/player/<id>` on its own line so it becomes a clickable blue link. `finalchapterfc.com/player/neymar` (no `https://`) failed to link on mobile — the comment was posted but the URL was dead text until edited.
  - If you genuinely need the OG card to show, that requires a standalone **link post** (riskier — self-promo filters), not a comment.
- Each country/club sub gets ONE post, spread over a week. Mods cross-check; don't copy-paste the same framing.
- **Existing personal Reddit account, NOT a new brand account.** AutoMod auto-removes posts from low-karma/new accounts in most football subs. Personal account with even 50+ karma clears the filter.

### Subs to avoid for this project

- **Hacker News:** wrong audience, would not perform
- **Product Hunt:** for software, not editorial sites
- **TikTok / YouTube Shorts:** wrong format unless committing to video content
- **Facebook:** declining organic reach, older demographic, not where football discussion lives
- **Instagram feed posts:** zero off-platform click conversion — IG actively suppresses outbound links
- **Shopping / merch / jersey subs (r/SoccerJerseys, r/FashionReps, kit/swap/deals subs):** people there want a BUY link, not editorial analysis — an on-brand reply gets **downvoted**. Learned 2026-06-02: an r/SoccerJerseys Neymar-kit reply pulled 450 views but **−2 karma**. `discover.mjs` now hard-penalizes these via the `COMMERCE_SUB` regex (score × 0.05) so the digest stops queuing them.

### Timing for the tournament window

- **Pre-tournament (now through June 10):** awareness build via Reddit + X
- **Opening week (June 11+):** repost on every platform with the "kickoff today" angle; this is when search/scroll volume for "World Cup 2026" peaks
- **During tournament:** standalone "milestone hit" tweets after every match a featured player plays
- **Post-tournament:** SEO compounds; long-tail queries like "Modrić last World Cup" start ranking 3–6 months out

### What's actually working (data from week 1)

Analytics after 7 days live (May 24 → May 27, 2026):
- **58 visitors, 179 page views, 3.3 pages/visit** (engagement is strong)
- **Reddit is THE channel.** 8 reddit.com referrers vs 3 t.co (Twitter/X). Both Reddit replies we posted drove measurable lifts:
  - Portugal/Ronaldo r/worldcup reply → `/player/ronaldo` jumped from 2 → 16 visits (+14)
  - Messi MLS r/worldcup reply → `/player/messi` jumped from 4 → 16 visits (+12)
- **X is dead at our scale.** 13 followers, 3 total t.co clicks in a week. Don't invest more X effort beyond the pinned tweet + URL in bio. **Focus all marketing time on Reddit.**
- **Geographic concentration:** 71% US, then India 5%, Canada 3%, Germany 3%, France 3%. Country-specific subreddits (Croatia, Belgium, Brazil) would diversify the geo mix.
- **Devices:** 64% desktop, 36% mobile (more desktop than expected for a fan site — possible Reddit-from-desktop bias)
- **Under-served players:** Modrić, Neymar, De Bruyne each got only 4–5 visits. Same Reddit-reply playbook should pull them up. The proven recipe is below.

### What's actually working (data from week 2 — 2026-06-02)

Vercel (30-day): **164 visitors, 651 page views, ~4 pages/visit.** Reddit still dominant referrer (reddit.com 26 + com.reddit.frontpage 7 = 33 vs google 6, t.co 5). `/player/neymar` (50) overtook Ronaldo (49) and Messi (41) as the top player page — the laggard-player Reddit focus worked.

**Reddit comment views (from the posting account's Comments tab) — views ≫ X by ~100×:**
- **Ronaldo "scored in 5 different World Cups" (22/8 stat) on r/SoccerCentral → 2,173 views, +2.** Biggest single piece the digest has produced. **The Ronaldo stat hook (scored in 5 WCs / 26 WC appearances / past Matthäus) is the strongest content we have — lean into it.**
- r/Canarinho Neymar arrival replies → 524 + 160 views (on-target Brazil NT sub).
- r/soccer KDB/Stellini reply → **1 view** (buried — was top-level on a busy thread; per the playbook, sub-reply under a high-upvote comment instead).
- r/SoccerJerseys Neymar-kit reply → 450 views but **−2** (wrong sub — see "Subs to avoid"; now blocked in discover.mjs).
- **X (@finalchapter): 19–24 views per post.** Reconfirms "X is dead at our scale" — ~100× below Reddit. Brand shelf only; don't draft standalone X content for reach.

**Caveat:** views ≠ site visits. A comment gets no OG card, so conversion depends on a clickable full-`https://` link IN the comment. A high-view comment with no clickable link is a pure leak — always verify the link rendered blue/tappable (bare domain = dead gray text on mobile).

**SEO (GSC, first ~4 days of data, May 28–31):** impressions ramping 2 → 24 → 263 → 294/day; first clicks (5) on May 31. **De Bruyne is the surprise search magnet** — `/player/debruyne` has 417 impressions (more than all other pages combined) at position ~7 but only 0.48% CTR. Dominant intent is the **question** cluster: "is/will Kevin De Bruyne play(ing) (in the) World Cup 2026" (54+19+17+15... impressions) and "is this <player>'s last World Cup" (Messi/Modrić too). Fixed 2026-06-02 (commit `b39b243`) by making player-page titles/descriptions **answer-led** ("...Last World Cup? **Yes** — ..." / "**Yes** — <player> plays for <country>...") to convert page-1 impressions into clicks. Geo in search skews US 202 / **India 112** — a latent audience Reddit isn't reaching.

### What's actually working (data from week 3 — 2026-06-06)

Full comment-history view-count audit (39 comments, the posting account's Comments tab). Three load-bearing takeaways:

- **VIEWS ≠ VISITS — the killer finding this week.** The Vercel 30-day numbers (below) prove raw comment views badly overstate clicks, and the view leaderboard inverts the *visits* leaderboard. Read the conversion paragraph before optimizing for views.
- **Ronaldo 22/8 "scored in 5 different World Cups" on r/SoccerCentral → 10,510 views, +2, with a clickable full-`https://` link.** New all-time view high, ~5× the week-2 record (2,173, *same sub, same hook*). **It's your best REACH tool — but it converted at sub-1%** (see below): `/player/ronaldo` got only 87 *total* visits from *all* sources over 30 days. So r/SoccerCentral + the Ronaldo stat is the awareness play, NOT the traffic play — use it, but don't let it crowd out the subs that actually convert.
- **r/Canarinho is the reliable mid-tier home base AND your best converter.** Four Neymar/Brazil comments at 563 / 201 / 175 / 145 views — and `/player/neymar` (97) is the **#1 page on the site**, beating Ronaldo despite Ronaldo's 10,510 monster. Steady on-target national-team threads out-convert one viral general-football hit. Keep feeding it.
- **Stop spending strong hooks on link-less banter.** The view leaderboard is dominated by one-line banter with NO URL — "But only Brazil?" (1,849), CL-final "cruelest thing in sports" (539, +6), "30% US is huge" (9), "46% is more than expected" (152), "Who's Lowkey" (46). Big views + real upvotes, **zero site conversion**. Fine as account-warming (karma to clear AutoMod), but the clickable link belongs on the *on-target national-team threads* (r/Canarinho, r/croatia), not the banter.

**Conversion check (Vercel 30-day, 2026-06-06): 299 visitors / 895 page views / ~3.0 pages-per-visit** — up from 164/651 in week 2. Reddit still the engine: **84 attributed referrals** (reddit.com 54 + com.reddit.frontpage app 28 + old.reddit 2) vs google 11 (SEO starting to contribute) and t.co 5 (X dead). Player-page visitors: **neymar 97 > ronaldo 87 > modric 64 > messi 51 > debruyne 37.** The inversion vs the *view* leaderboard is the whole point — Neymar (steady r/Canarinho) tops Ronaldo (one 10,510 viral hit). **Optimize for on-target sub + clickable link, not for raw views.**
- **Geo diversified exactly as the country-sub strategy predicted:** Croatia surged to **10% — now the #2 country** — and `/player/modric` to #3 page (64), off the r/croatia (560 views) + r/ACMilan Modrić replies. US down to **53%** (from 71% in week 1). India 5%, Canada 4%, Brazil 3%. Country/national-team subs are how you both diversify geo AND lift laggard players.
- **Mobile flipped to 57%** (was ~36% in week 1) — Reddit-app traffic is now the majority. This makes the "full `https://` on its own line, never a bare domain" rule mission-critical: bare domains render as dead gray un-tappable text in the Reddit app, which is now most of the audience.

**X (@finalchapter) is confirmed dead for reach — STOP drafting standalone X brand posts.** Audited the account's post impressions (2026-06-06): **8–115 views/post, mostly under 40, ~0 likes/reposts.** The killer proof it's the *channel*, not the *content*: the **exact same Ronaldo "scored in 5 different World Cups" hook** that did **10,510 views on Reddit** that same week pulled **8 / 12 / 36 / 28 views** as standalone tweets here — ~300–1,000× less reach for identical copy. Cause: X gives near-zero distribution to standalone posts from a <100-follower *brand* handle, and 0 early engagement means no amplification beyond your own timeline. Two minor within-X notes: news-pegged posts (Neymar "Cleveland trip" 72) beat evergreen stat-restatements (8–36); and recycling one stat ~4× on a single timeline just trains the audience to scroll past (Reddit works because each post is a *fresh sub's* audience). **Rules going forward:** (1) don't draft standalone X content for reach — it's pure opportunity cost vs a Reddit national-team-sub reply; (2) keep X as a brand shelf only (pinned tweet + bio URL); (3) if X reach ever matters, it must be reply-guy from a *personal* account with existing followers, never @finalchapter standalone.

Distribution remains brutally bimodal: a handful of comments break 500+, the long tail sits at 1–5 views — driven by *thread position*, not text quality. Every 1–2-view comment here (KDB "done filtering," Stellini "napoli politics," Lugano reframe) was top-level or on a busy thread → reconfirms the #1 lever: **sub-reply under a high-upvote comment, never top-level on a big thread.** Also: r/SoccerJerseys −2 again (commerce-sub penalty holding as modeled in discover.mjs); a r/worldcup comment was `[Removed by moderator]` (145 views, check removal reason — r/worldcup filter may be tightening).

### Reddit reply tactics that worked (3 successful examples)

The pattern across all three successful replies:

1. **Reply to a specific high-upvoted comment in the thread, NOT a top-level new comment.** Top-level comments on 7-day-old threads get buried. Replying under a 100+ upvote comment piggybacks on its visibility.
2. **Quote/validate the parent commenter's framing first.** "The reframe I'd offer..." / "The 'rationed not gone' line nails it..." — shows you read, not promoted.
3. **Add one specific fact other commenters don't have.** Not generic stats; a sharp footnote like "Croatia missed 2010 qualifying" or "Messi won MLS MVP at 37."
4. **End with a single full `https://` URL on its own line.** No "check out my site" preamble. It renders as a clickable blue hyperlink (NOT a card preview — comments don't get those; see the "Reddit comment links" gotcha). The tap-through is what converts. A bare domain without `https://` is dead gray text on mobile.
5. **Skip generic praise threads.** Best targets have an **active debate** — Ronaldo "held back the team" thread, Messi MLS-vs-international, Modrić retiring after WC. Look for disagreement in the comments; that's where a reframe lands.

**Worked examples preserved in git history** (in case you want to study the tone):
- Portugal/Ronaldo reply: "2026 isn't tactical for him, it's terminal..." (Fragahah comment in r/worldcup)
- Messi MLS reply: "The discourse is louder than the data..." (taube_d's post in r/worldcup)
- Modrić retirement reply: "Win or not, the participating is already historic..." (Abideguide comment in r/soccer)

### Sub-priorities (Modrić, Neymar, KDB needed Reddit reply love)

- **Modrić:** r/soccer "Modric retiring after WC" thread (5.2K upvotes) was the win. Future: country-specific r/CroatianFootball if it has karma threshold under your account.
- **Neymar:** Find r/worldcup or r/soccer threads about Brazil's chances, Ancelotti's selection, or Pelé record. r/Brazil_Football_Talk if active.
- **De Bruyne:** Belgium / Golden Generation / KDB's Napoli move are the topical hooks. Smaller national team = smaller threads but easier to dominate the conversation.

### What to NOT do (learned)

- **Don't tweet standalone content on X at <100 followers.** Reach is effectively zero. Reply-guy strategy or skip.
- **Don't post on r/soccer cold.** Comment 1–2× in the thread first (no link) to register as a participant before the linked reply.
- **Don't reply to threads >2 weeks old as a top-level comment.** Sub-reply under a high-upvote comment instead.
- **Don't make comparative-age claims about Modrić/Messi/Neymar/KDB without checking Ronaldo first.** Ronaldo is 41; everyone else is younger. "Oldest X" claims default to him.

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

1. **Phone:** load https://finalchapterfc.com, click into a player, open the LEGENDS dropdown (and on desktop the TOURNAMENT dropdown → 4 secondary pages)
2. **Countdown** is ticking and the day count matches `(2026-06-11T19:00:00Z − Now())`
3. **Per-player MatchCountdown** renders "Next up · …" above each schedule
4. **Records in Play** cards show with the gold top stripe
4b. **Status strip** opens each player page with `WORLD CUP 2026` + the editorial line (e.g. "In the hunt.") + stage track, NOT a Q&A box; `/status` lists all 5 with the correct alive/out sort
5. **OG preview (site-level):** paste `finalchapterfc.com` into iMessage → gold "The Final Chapter" 1200×630 card shows
6. **OG preview (per-player):** paste `finalchapterfc.com/player/messi` into iMessage → personalized Messi card with "3 from Klose" hook shows
7. **`Add to Home Screen`** on iOS → gold "F" icon, not a screenshot thumbnail
8. **Analytics dashboard** (Vercel project → Analytics tab): page views appearing within 1–2 min of a real visit (use mobile data / incognito if ad-blocker is suspected)
9. **`/robots.txt` and `/sitemap.xml`** return reasonable content (curl them or browse directly)
10. **Search Console** (whenever set up): no new structured-data errors on JSON-LD

## Verifying stats after editing `data/players.js`

This is important enough to repeat. After ANY content change in `data/players.js`, run the consistency check (see "Stat data integrity" section above). The page-level rendering uses `worldCups.length - 1` for the "WORLD CUPS" stat, which is independent from the `worldCupApps`/`worldCupGoals`/`worldCupAssists` totals. They MUST agree, or one of them is wrong.
