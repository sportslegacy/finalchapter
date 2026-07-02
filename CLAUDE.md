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
  road-to-the-final/page.js       # "Road to the Final" — each legend's knockout path drawn as a single straight left-to-right lane (5 lanes), so one nation's route is readable (a symmetric bracket tree isn't). Lit nodes derive from wc2026.status; opponent/score labels from optional wc2026.knockout[]. SportsEvent + FAQPage JSON-LD (roadFaqs: knockout-journey-specific Q&As, scoped to NOT cannibalize the format page). Sorted alive-first/deepest (mirrors /status)
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
4. **Knockout Run** (LEADS once the legend advances) — a schedule section shown only for legends in the knockouts (`curIdx >= 1`, added 2026-06-27, user-flagged "group stage is over, replace with knockout?" then "move knockout up"). We DON'T replace the group section (it's their qualifying record) — we ADD this and, for an advanced legend, render it ABOVE the group section (the knockout run is the "now"; group is history). Renders each `wc2026.knockout[]` game as a match card (stage label + opponent + W/D/L + score + scorers, reusing `.match-item`/`.match-result`) as they're recorded, plus a `statusStatement` line + a "Follow {country}'s road to the final →" link to `/road-to-the-final` (which has the full projected path). Empty `knockout[]` ⇒ just the stage line + road link (ready for the R32).
4b. Group Stage — group badge, `LiveGroupTable` standings, storyline, 3 match cards. A played match (one with a `result`) renders a W/D/L badge + score + scorers (`.match-result`, `outcome-w/d/l` colors); unplayed matches fall back to date/venue. **Once the legend advances (`curIdx >= 1`), the heading drops "Schedule" → just "Group Stage"** (these are results now, not upcoming) and it sits BELOW the Knockout Run. Still "Group Stage Schedule" while they're in the group.
5. **Records in Play** — 3-card milestone grid ("3 from Klose", "Sixth WC", etc.). NOTE: this is STATIC pre-tournament editorial (`milestonesAtStake` in `data/players.js`) — it can go stale mid-tournament (e.g. Messi's "3 from Klose" card once he's already broken the record). Not currently auto-updated; a known gap.
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
    groupTable: { asOf, teams: [{ name, played, points }] },        // OPTIONAL — live group standings shown on the player page (ranked, legend's nation highlighted, top-2 marked "advancing"). teams ORDERED by current position (winner first); `name` must match groupTeams spelling. The match-result agent refreshes it when it records that legend's result + sets asOf to a "Mon DD" date. CAVEAT: only refreshes on the LEGEND's matches, so it lags when OTHER group teams play in between — the "as of <date>" label owns that. Group-stage only (moot once knockouts start).
    status: { stage, alive, note },                                // LIVE status — single source of truth. stage ∈ STAGE_ORDER (group→…→champion) or "eliminated"; alive=false ⇒ out. Drives the player status strip, the /status hub, the dynamic <title>, and FAQ JSON-LD. note = short opener/next-match line.
    matches: [{ opponent, date, time, kickoffUtc, venue, city,
                result: { outcome, score, scorers, legendGoals, legendAssists, legendOut } }],  // first match's kickoffUtc drives the countdown; null when TBD. result OPTIONAL — add per played game: outcome "W"|"D"|"L" (legend's nation POV), score "own-opp", scorers (legend first, optional). Absent ⇒ card shows date/venue. legendGoals + legendAssists (ints, omit if 0) + legendOut (true only if the legend didn't feature) are the STRUCTURED tally feeding the 2026 "so far" goals/assists/apps line + the live hero totals (`tournament2026Tally`). legendAssists comes from ESPN's match summary ("Assisted by <legend>") — same source as goals. apps = played games minus legendOut ones, so set legendOut:true when he's injured/benched or apps overcounts (Neymar trap).
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

#### Status-change propagation checklist (update ALL of these — user-flagged 2026-06-27)

A status/result change fans out to MANY surfaces; updating some but not all reads as broken (the user has flagged this twice — the road projection kept showing all four Group-H teams after H finished, then both "if win/2nd" branches after Brazil had won). The rule: **`wc2026.status.stage` is the single source of truth, and every surface below DERIVES from it — when you change status handling, or add a status-dependent surface, walk this whole list and confirm each reflects the change.** Most are automatic; the gaps were always a surface using a STATIC assumption instead of the live truth.

Driven by `wc2026.status.stage` / `alive` (flip it → all of these move):
1. **`/status` hub** — `rank()` sort + card stage label + `latestResultLabel` "Last:" line.
2. **Player page status strip** — `statusStatement(player)`.
3. **Player `<title>` + meta description** — `statusHeadline(player)` (answer-led).
4. **Player FAQ JSON-LD** — `statusHeadline` Q&A (`buildFaqJsonLd`).
5. **`/road-to-the-final` lane** — `playerRoad(player)` lights nodes off `stageIndex(status.stage)`.
6. **`/road-to-the-final` "Who they could face"** — `RoadProjLive`: branch collapse (own group decided) + round window (drop rounds already played, off `status.stage`).
7. **Homepage hero** — `Countdown`'s `nextLegendMatch` (all group games recorded → "knockout rounds underway").
8. **2026 "so far" tally** — `tournament2026Tally` (spans `matches[]` + `knockout[]`).
9. **sitemap lastmod + per-page `dateModified`** — `playerUpdatedAt(player)`.

Depends on a GROUP RESULT or another nation's progress (NOT in our data for non-legend groups): **use the live ESPN client pattern** (`LiveGroupTable` / `RoadProjLive` / `LiveNow`), NEVER static pot-seeding — static seeding is exactly what went stale. The agent maintains `groupTable` for the 5 legend groups only; everything broader comes from ESPN client-side.

### The match-result update loop (operational recipe — proven 2026-06-13)

The P0 tournament workflow. The user pings after a legend's nation plays ("Brazil played" / a score); ~5 min per game. Steps that worked for the first one (Brazil 1-1 Morocco):

1. **Get the result, verify against ≥2 sources.** Reddit is blocked for the fetcher, but ESPN/FIFA/news pages work. Note: ESPN's match page is cached ~15 min — a single fetch can show a stale minute ("86'") long after full time. Cross-check FIFA match-centre title + a match report; reason from elapsed time since kickoff (>~115 min ⇒ FT) when sources disagree. Sources can differ on a scorer's MINUTE (Saibari 17' vs 21') — doesn't matter, our card shows only the legend's nation scorer line, not opponent minutes.
2. **Edit `data/players.js`:** add `result: { outcome, score, scorers, legendGoals, legendOut }` to the played match (outcome from the LEGEND'S nation POV: W/D/L; score "own-opp"; scorers a short string; `legendGoals` = the legend's own goals that game, omit if 0; `legendOut: true` ONLY if he didn't feature — this keeps the 2026 "so far" timeline tally accurate, esp. apps). **If the legend didn't play** (e.g. Neymar out injured), still record the team result, put the actual scorer + an out-note in `scorers` (we used `"Vinícius Júnior 32′ · Neymar out (calf)"`), and set `legendOut: true`. Update `status.note` to point at the next match / situation. Flip `status.stage`/`alive` only at group resolution or a knockout exit.
3. **The cascade is automatic from those two edits** — no other files: schedule card shows the W/D/L badge + score + FT + scorers; player `MatchCountdown` advances to the next unplayed game; homepage hero bar advances to the next legend match; `/status` shows "Last: D 1-1 v Morocco" (`latestResultLabel`).
4. **Verify before push:** stat-integrity check (Check 1 — should stay OK; a 2026 result does NOT change the `worldCupGoals/Apps` totals, which exclude the 2026 entry), `npm run build`, and a quick Claude-Preview DOM check of the played card + the three downstream surfaces. Then commit + push; confirm in prod with `curl … | grep <scorer>`.
5. **CSS guard already in place:** `.match-result-score` is `white-space: nowrap` and `.match-result` is `flex-shrink: 0` (commit `7e7f348`) so a score never wraps to two lines in the narrow mobile column. Don't remove.

**What this loop does for traffic (be honest about the mechanism):** the update is NOT an acquisition tool on its own — almost nobody is watching the site waiting for it. It pays off two ways: (a) **retention** — it's the only thing that makes "come back after the next match" real, converting one-time hits into repeat sessions over five weeks (watch pages/visit); (b) **distribution ammunition** — a fresh result is a news-pegged reason to post that day ("Brazil drew while Neymar watched — here's what's still at stake"), which is what actually earns the click. SEO freshness is real but NARROW: we won't outrank ESPN for "Brazil Morocco result", but the legend long-tail ("is Neymar playing the World Cup", "did Neymar play vs Morocco") is the question-cluster we already rank ~7 for, and Google rewards freshness there. The mistake is updating and NOT distributing the peg — the highest-traffic version is *legend plays → update site → post the fresh angle on their national sub*.

### Server-side match-result auto-updater (GitHub Actions) — runs the loop without anyone's Mac

Built 2026-06-14, made fully reliable 2026-06-20. Runs the result loop without anyone's laptop. **`.github/workflows/match-results.yml`** + **`scripts/distribution/pending-results.mjs`**. The architecture took several iterations (each failure mode is a gotcha — don't reintroduce):

- **Detector** (`pending-results.mjs`): emits two kinds of pending entries (each tagged with `type`). **GROUP** — a `wc2026.matches[]` entry whose `kickoffUtc + FINISHED_AFTER_MS` (120 min) is past but has no `result` (precise; group fixtures carry kickoffUtc). **KNOCKOUT** — for each ALIVE legend past the group stage (all group games recorded), it fetches ESPN's free scoreboard (country-based, like `LiveNow`) and flags the nation's most-recent FINISHED game whose kickoff beats our latest recorded game (across `matches[]` + `knockout[]` kickoffs) by an **18h margin** (so an already-recorded game can't re-flag despite a minor ESPN-vs-ours timestamp mismatch — rounds are days apart) and is >120 min old. This is how knockouts auto-update with **zero pre-loaded fixtures** (the bracket only resolves once groups finish). ESPN fetch failure → knockout detection silently dormant that run (returns null, never crashes, never blocks the group path). `--json` / `--count` modes. Dynamic-imports `data/players.js` (ESM-in-CJS-package → needs Node 22+; the workflow pins it). The 120-min gate + the agent's own "is it final?" check guard against in-progress games.
- **Agent step = the Claude CLI, NOT `claude-code-action`.** The action requires the **Claude GitHub App** installed on the repo (it does an app-token exchange and 401s "Claude Code is not installed on this repository" without it) — that's why every run failed for days. The workflow now does `npm install -g @anthropic-ai/claude-code` then `claude -p "$PROMPT" --bare --permission-mode bypassPermissions --allowedTools "Bash Read Edit Write WebFetch WebSearch" --max-budget-usd 5 --no-session-persistence`. `--bare` auths strictly via the `ANTHROPIC_API_KEY` secret (no GitHub App, no OIDC). The agent runs the match-result recipe (fetch+verify ≥2 sources, edit ONLY `data/players.js`, stat-check + build); it does NOT touch git.
- **Git is a separate deterministic step**, gated on `env.AUTO_PUSH == 'true'` (**currently `"true"` — live**). It re-runs `npm run build` as a publish gate (a broken edit fails the job, never deploys), commits ONLY `data/players.js` as `github-actions[bot]`, and pushes (auto-deploys via Vercel — bot pushes DO trigger the webhook; commit msg must NOT contain `[skip ci]`).
- **THE TRIGGER is external cron-job.org, NOT GitHub's scheduled cron.** GitHub deprioritizes scheduled cron on quiet public repos so hard it gapped **8h+** and silently missed whole matches — no cron design (dated, clustered, frequent) fixes it. The reliable timer lives outside GitHub: a **cron-job.org** job POSTs to the `workflow_dispatch` endpoint every 15 min (`https://api.github.com/repos/sportslegacy/finalchapter/actions/workflows/match-results.yml/dispatches`, body `{"ref":"main"}`, `Authorization: Bearer <fine-grained PAT, Actions:write>`), which GitHub honors **instantly**. The workflow keeps ONE `0 */6 * * *` GitHub-cron entry as a free best-effort backup only. **Proven end-to-end 2026-06-20:** cron-job.org test run → 204 → workflow_dispatch run → agent recorded Brazil 3-0 Haiti (incl. "Neymar out (calf)") correctly + pushed. If results stop updating, check cron-job.org's History first (is it firing / still 204?), then the latest run's log.
- **Secret:** repo secret `ANTHROPIC_API_KEY` (Settings → Secrets → Actions). Repo is public — the CLI never echoes the key.
- **Retired:** the Mac Claude scheduled tasks (`belgium-egypt-result-jun15`, `messi-algeria-result-jun16`) — they only ran while the app was open and missed matches; both disabled. The per-match dated GitHub crons + `gen-match-cron.mjs` are also superseded by cron-job.org (script left in repo but unused).

### Live in-match data layer (ESPN client-side) — `LiveNow` + `LiveGroupTable` (built 2026-06-26)

Complements the agent loop above: the agent records the **authoritative final** (~10–15 min after FT, with scorers/milestones/group flips), while this layer shows **live scores + current standings during and right after a match** straight from the browser. **Why it matters:** the site now stays current even when the agent is late — the exact cron timing that caused the "I check and it's not updated" pain is no longer load-bearing. Both pull **ESPN's free public API** (`site.api.espn.com/apis/.../fifa.world/...`), which sends `access-control-allow-origin: *` and needs **no key** → fetched **client-side**, so the site stays a **pure static export** with **zero added cost/runtime**. Both render **null on any fetch/parse error**, so a changed/broken ESPN API can NEVER break a page — it just goes dormant.

- **`app/components/LiveNow.js`** — live score, **country-based** ("is this nation playing right now?") rather than fixture-based, so it covers **group AND knockouts with zero per-round data** (no need to pre-load knockout opponents/kickoffs). **Only the legend's OWN nation is matched** (the 5 names map exactly to ESPN's `displayName`, verified); the opponent is whatever ESPN reports, so tricky opponent names (Côte d'Ivoire, Korea Republic…) can't break it. Mounted on the **player status banner** (alive only), **homepage hero** "underway" branch, and **/status** cards (alive only). Design rules that survived an adversarial review (don't revert):
  - **`showFinal` prop, default false → live-only.** Player/status pages show the score ONLY while `state==="in"`; the FT score there would just duplicate the recorded result (note + "Last:" + schedule card). **Only the hero passes `showFinal`** (it has no recorded-result line, and briefly bridges the FT→record gap).
  - **Shared module-level scoreboard cache** (25s TTL + in-flight dedup) collapses the up-to-5 instances on /status into ~one ESPN request per cycle.
  - **Date range is US-Eastern, anchored to the SERVER clock** (`useServerOffset`), queried ±1 day, so a wrong device clock or the ET/UTC day boundary can't hide a live game. EDT = UTC-4 for the whole tournament.
  - **Lifecycle:** one poll chain only (an `inFlight` re-entrancy guard stops a visibility-toggle-mid-poll from spawning a duplicate chain); polling **pauses when the tab is hidden** and **restarts on `visibilitychange` AND `pageshow`** (the latter is the only reliable bfcache signal on iOS Safari — mirrors `Countdown`/`MatchCountdown`). Adaptive interval: 30s while live, 90s idle.
  - **FT-grace:** a finished game lingers ~1.5h (window keyed off kickoff, `FT_GRACE_MS`) so the score doesn't vanish at the whistle; `state==="in"` is always authoritative for live-vs-final.
  - **a11y:** the score div is `role="status" aria-live="polite" aria-atomic="true"` so screen readers announce goals.
- **`app/components/LiveGroupTable.js`** — live group standings. Renders the static agent-maintained `wc2026.groupTable` as the **instant SSR/SEO fallback**, then on mount fetches ESPN's **standings** endpoint and swaps to the CURRENT table — so the standing is never stale between a legend's OWN matches (the static table only refreshed on those). **Sort by ESPN's own tiebreak-aware `rank` stat**, NOT a re-derived points→GD — re-deriving silently inverts 2nd/3rd (and the "advancing" marker) on a goals-scored tiebreak, exactly the tense final-round case visitors check. Replaces the old window-gated `LiveScore` component (deleted). **Live-match overlay (added 2026-06-27):** ESPN's standings count only COMPLETED games, so while a group match is in progress the table would ignore it (user-flagged: the top card showed "Argentina 2–0 Jordan 51'" but the rank still read P2/6). So LiveGroupTable ALSO fetches the scoreboard and folds any IN-PROGRESS group match into the table provisionally (played+1, points/GD by the live score), re-sorting by pts→GD (ESPN's `rank` is completed-games-only, can't be trusted mid-match). Handles the **final matchday's two simultaneous games** (overlays both). The indicator has THREE states: **red pulsing "LIVE"** (`.is-livegame`) when a group match is actually on (provisional table — the red is now correct, a match really is on) + a "Provisional — the live match is included" foot; **calm "current"** (`.is-live`, accent, static dot) when up to date with no match on; **"as of <date>"** for the static fallback. So the earlier "no red LIVE between matchdays" fix still holds — red LIVE only appears when a group game is genuinely in progress. (An actual in-progress *score* still lives in `LiveNow`; this is the standings reflecting it.)

### 2026 "so far" tally on the player timeline (`tournament2026Tally`)

The career-timeline 2026 ("Final Chapter") card shows a running **goals · assists · apps · so far** line (added 2026-06-26), so it doesn't look bare next to the past-WC cards mid-tournament. Derived by `tournament2026Tally(player)` in `data/players.js` from **per-match structured fields** — `result.legendGoals`, `result.legendAssists`, and `result.legendOut` (true if he didn't feature) — NOT by parsing the free-text `scorers` string (fragile: "De Bruyne hit the post" contains his name but is 0 goals) and NOT by a hardcoded total (goes stale). **apps = played games − legendOut games**, so Neymar reads **1 app** (one cameo) not 3 despite Brazil playing 3 — the documented apps-accuracy trap. **Assists ARE tracked** (changed 2026-06-27 — user-flagged "if we have goal number, why not assist from the same source"): they come from ESPN's match summary endpoint, which credits "Assisted by <name>" per goal — the SAME source as the goals — so tracking one but not the other was an inconsistency, not a real data gap. (The "murkiest stat" caveat is about CAREER aggregates where providers disagree over decades; per-game ESPN attribution is clean.) The `· so far` pill (`.timeline-stat-sofar`) flags it as a running, mid-tournament count. The match-result agent maintains `legendGoals`/`legendAssists`/`legendOut` per game (recipe + workflow prompt updated), so the tally stays fresh with zero extra maintenance.

### During-game SEO freshness layer (sitemap lastmod + answer-first stats + schema, built 2026-06-27)

**The honest mechanism (state it before "optimizing"):** the live ESPN score/standings are client-side → **invisible to crawlers**. So "during-game SEO" is NOT real-time — it's the **recorded-result freshness loop**: when the agent records a result and pushes, the new static HTML must (a) prompt Google/Bing to recrawl the changed pages fast, and (b) carry answer-first text on the legend long-tail question cluster ("is X still in / did X score / how many goals has X scored") — the ONLY lane we can win. We do NOT compete with ESPN / Google's live-score box on match head terms. SEO is the slow compounding secondary; Reddit is still ~80% of traffic and the biggest during-game lever is the non-SEO distribution peg (post the fresh angle on a national-team sub). Built from a grounded audit + adversarial-filter workflow; everything derives from existing data, is crawlable static HTML, and needs zero new maintenance. New `data/players.js` exports: `goalsSentence`, `tournamentEventStatus`, `playerUpdatedAt`. Non-revert rules:

- **`app/sitemap.js` lastmod is per-page from the REAL content clock, never `new Date()`.** home/`/status`/`/road` → `autoUpdate.updatedAt`; each player → `playerUpdatedAt(player)` (that player's OWN latest-result kickoff, so a one-legend push doesn't falsely re-stamp the other four); `/world-cup-2026-format` + `/world-cup-2026-groups` → a STATIC date (evergreen). The old uniform `new Date()` stamped all 9 identically and bumped on content-less builds, training Google to distrust the signal. Don't revert to a shared timestamp.
- **Answer-first "stats so far" block** on each player page (a server-rendered `<h2>` + sentence right under the status banner): `goalsSentence(player)` → "X has scored N goals in M appearances at the 2026 World Cup so far." (truthful 0-goal branch; singular "1 appearance"). The SAME sentence leads the meta **description** — gated on the TALLY existing, **NOT on `live`** (the hottest "how many goals" demand is group-stage when Messi/Ronaldo are scoring and `live` is false; gating on `live` is backwards) — and is added as a FAQ Q&A. Do NOT put it in the `<title>` (clips at ~60 chars). All 5 descriptions verified ≤160.
- **`tournamentEventStatus()`** drives all 6 SportsEvent `eventStatus` blocks (was hardcoded `EventScheduled` mid-tournament): derives EventInProgress now / EventCompleted after Jul 19 from the build date, self-expiring.
- **`dateModified`** on Person + SportsEvent: per-player (`playerUpdatedAt`) on player pages; `autoUpdate.updatedAt` on home/`/status` (honest there — they aggregate all 5). **BreadcrumbList** JSON-LD on player pages (a rich result Google still renders for ordinary sites; absolute URLs, middle node = real `/status`, never a `#fragment`).
- **IndexNow ping** appended to the push step in `match-results.yml` (Bing/Yandex only — **Google ignores IndexNow**; its recrawl is nudged by the sitemap lastmod instead). Key file `public/8d3f1a6c4b9e7205f3a8c1d6e0b94725.txt` (IndexNow keys are public by design). Best-effort `|| echo` — a non-2xx must never fail the deploy.
- **Deliberately NOT done** (workflow-rejected or marginal): no per-player `/stats` sub-route (would cannibalize the URL already ranking ~7); no per-match recap/live-score pages (ESPN head-term lane); dedicated OG cards for the 3 cardless tournament pages were deprioritized (marginal — Reddit comments render no card; only link-posts do).

### Road to the Final (`/road-to-the-final`) — lit by status, captioned by knockout[]

The five-lane knockout-path view (built 2026-06-06; the legends-lens alternative to a generic bracket — see backlog). Three rules so it stays accurate with near-zero maintenance:

1. **Lanes light from `wc2026.status.stage`, NOT from `wc2026.knockout[]`.** `playerRoad(player)` in `data/players.js` walks `ROAD_STAGES = ["group","r32","r16","qf","sf","final"]` and marks each node `reached` / `current` / `out` / `upcoming` purely off `stageIndex(status.stage)` (+ champion/eliminated). So advancing a legend is the SAME one-line `status.stage` edit that already drives `/status` and the player strip — no second source of truth.
2. **`wc2026.knockout[]` only supplies opponent/score captions.** Array of `{ stage, opponent, kickoffUtc, result }` (schema in `data/players.js`). As of 2026-06-27 the **autonomous loop fills this AND advances `status.stage` automatically** when a legend plays a knockout game — the detector finds the game on ESPN (country-based, no pre-loaded fixtures), and the agent appends the `knockout[]` entry + flips `status.stage` (advanced → next round; eliminated → `alive:false`). So the road lane (and `/status`, the player strip, the title) all update ~15 min after a knockout FT with zero manual work. The `kickoffUtc` on each entry is what lets the detector tell a new round from an already-recorded one. Absent round ⇒ the node shows the round-date placeholder ("from Jun 28"). Don't put group data here — the group node names the group from `wc2026.group`. Knockout `result`s also carry `legendGoals`/`legendOut`, so knockout goals/apps feed the 2026 "so far" tally (`tournament2026Tally`, `latestResultLabel`, `playerUpdatedAt` all span `matches[]` + `knockout[]`).
3. **Reached-pill background MUST stay opaque** (`color-mix(... 18%, var(--bg-card))`, NOT `..., transparent`). The connector line runs behind the pills; a transparent reached-pill lets the gold line bleed through the round label and reads as a strikethrough. Caught + fixed during build; don't revert to a transparent tint. Also: the 7-node track is tuned to fit a 375px mobile viewport (small pills/captions, `min-width:0`) — re-measure `scrollWidth<=clientWidth` if you change node sizing, or the Final + trophy get clipped (the whole point is seeing the WHOLE road).

Sorted alive-first/deepest (`rank()`, mirrors `/status`). `isChampion(player)` drives the trophy cap.

#### "Who they could face" — projected opponents per lane (added 2026-06-06)

After shipping the lanes the user asked for "more than this, also easy to tell who are the potential opponents." Each still-alive, pre-knockout lane now carries a **"Who they could face"** panel with **two branches** (win the group vs finish 2nd), each listing the **R32 / R16 / QF** projected opponents. Derived 100% from the fixed bracket + the group draw at render time — **zero ongoing maintenance**; once real names exist (`wc2026.knockout[]`), the lane nodes above already show them, and this panel is hidden anyway once the legend is out/deep.

**The panel NARROWS to real qualifiers as groups finish (added 2026-06-27, `app/components/RoadProjLive.js`).** The server still renders the pot-seeding projection (every team of a single R32 group; the top/2nd seed for later-round group slots) as the SSR/SEO fallback, but the panel is now a CLIENT component that on mount fetches ESPN's free standings (CORS:*, no key — same source as `LiveGroupTable`) and, for any group that has ACTUALLY FINISHED (all 4 played 3), replaces the projected chips with the real qualifier (winner/runner-up by ESPN's tiebreak-aware `rank`). So once Group H is decided, "Runner-up · Group H" shows the one real side (e.g. Cape Verde), not all four — the user-flagged bug ("group H is all done, why didn't you catch it"). Resolved chips get `.proj-team.is-resolved` (accent-colored + bold) so a confirmed team reads differently from the muted seed guesses; undecided groups keep the seed. Null-on-error (keeps the static projection), no hydration risk (first client render === SSR, narrows only after the fetch resolves). Verified live: Argentina's R32 narrowed Group H → Cape Verde, R16 → Australia/Egypt, QF → Switzerland (real B winner) + Portugal (K undecided, seed kept).

**It also RESOLVES the legend's next KNOCKOUT opponent from the fixtures (added 2026-06-27, user-flagged "norway already won").** Group narrowing alone got stale once the knockouts began — the R16 row still listed both seed candidates (e.g. Ivory Coast + Norway) even after Norway won their R32 and became Brazil's confirmed R16 opponent. So RoadProjLive ALSO fetches ESPN's scoreboard (a ±day window covering the knockout fixtures) and, for the legend's NEXT round (the round == their `status.stage` / `curIdx`), finds their upcoming fixture with a REAL opponent — ESPN lists e.g. "Brazil v Norway — round-of-16" once the feeding R32 resolves; a still-open slot reads "Round of 32 X Winner" and is skipped. That round then shows the ONE confirmed opponent with a "Confirmed" label (not the seed pos/group prose). Rounds BEYOND the next stay projections (their feeders haven't played). Verified live: Brazil R16 → Norway, Belgium R16 → United States, Argentina R32 → Cape Verde, Portugal R32 → Croatia (a Ronaldo-vs-Modrić collision), all "Confirmed".

**The lane TRACK node also resolves the upcoming opponent** (`app/components/RoadNextOpp.js`, added 2026-06-27): the CURRENT knockout node's caption shows "vs Norway" the moment ESPN sets the fixture — before the game is played/recorded in `knockout[]` — so the track and the projection panel stay in step (both resolve the same next opponent). All the ESPN client logic (standings + scoreboard fetch/cache, `resolveGroups`, `resolveNextOpponent`, `teamWithFlag`) now lives in ONE shared module **`app/components/espnNext.js`**, so RoadProjLive + RoadNextOpp make one standings + one scoreboard request per page (cached), and the lane falls back to the round-date placeholder on any error / open slot (SSR-safe, no hydration mismatch).

**How the whole knockout view stays timely (two layers):** (1) CLIENT, instant — `LiveNow` (live scores), `LiveGroupTable` (live standings), `RoadProjLive` + `RoadNextOpp` (real opponents from ESPN fixtures) update on every page load with no agent dependency. (2) AGENT, ~15 min post-game — the knockout-aware detector + agent record the authoritative `knockout[]` result and advance `status.stage` (confirmed live: it recorded Brazil 2-1 Japan and Belgium 3-2 Senegal (AET) and advanced both to the R16). So the site is current during/right after a game (client) and authoritative shortly after (agent); the agent's exact timing is no longer load-bearing.

**Once the legend's OWN group is decided, the panel collapses the two "if win / if 2nd" branches to the one that actually happened** (also added 2026-06-27, same component): RoadProjLive checks `resolved[proj.group]` against the legend's nation and, if their group is complete, renders ONLY the `win` branch (title "{country} won Group X") or the `runnerUp` branch ("{country} finished 2nd in Group X") — showing both is wrong once we know they won. The single branch goes full-width via `.road-proj-branches.is-single`. Undecided groups still show both. User-flagged ("brazil already won"). Verified: Brazil + Belgium (group winners) show one branch; Argentina/Portugal/Croatia (groups still playing) show both.

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

### MatchCountdown targets the next UNPLAYED match (not matches[0]) + TBD handling

Two behaviors, both load-bearing — don't revert:

1. **Targets the first match WITHOUT a `result`,** not `matches[0]` (changed 2026-06-12, commit `ae6a33a`). `app/player/[id]/page.js` does `player.wc2026.matches.find((m) => !m.result)` and feeds that to `<MatchCountdown>`. So adding a `result` to a played game auto-advances the on-page countdown to the next fixture — the SAME single edit that drives the status strip. Hidden once all three group games have results (knockout games aren't in `matches[]`). Before this, the countdown was pinned to game 1 and would read "in progress or completed" for the rest of the tournament after the opener.
2. **TBD kickoffs:** `kickoffUtc: null` → the component falls back to a date-only countdown ("23d 3h (kickoff TBD)") anchored at 04:00 UTC of that date. As of 2026-06-12 ALL 15 group fixtures have a verified `kickoffUtc` (no TBDs left); the fallback only matters again if a future knockout fixture is added before its time is published.

### Homepage hero Countdown retargets to the next legend match (tournament-live)

`app/components/Countdown.js` was rewritten 2026-06-13 (commit `61d16ab`). Pre-tournament it ticked to the opening match; once the opener passed it would have frozen at `00:00:00:00`. It now derives the **next legend match** = the earliest unplayed group game (no `result`) with a `kickoffUtc`, across all five players (`nextLegendMatch()`), and has three states:
1. **upcoming** → ticking countdown to that kickoff (label "Next legend in action · 🇧🇷 Brazil vs Morocco", with date/time/venue).
2. **kicked off** (client clock passes the target before the result is pushed) → "🇧🇷 Brazil vs Morocco · kicked off — See who's still standing →" linking `/status`. **Mounted-gated** (`mounted` state set in `useEffect`) so the build-time HTML matches the first client render — same #418-avoidance pattern as the rest; don't render the time-relative swap pre-mount.
3. **all group games have results** → "The knockout rounds are underway → Road to the Final."

Because it's result-driven, the same post-match `result` edit that updates the schedule card also advances this bar on the next deploy — no separate clock to maintain. The "kicked off" state was verified rendering live in prod during Brazil–Morocco. Don't revert it to the static opener countdown.

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
- `wc2026.matches[*].time` / `kickoffUtc` — all 15 group fixtures verified + filled as of 2026-06-12 (no TBDs). Add `kickoffUtc` for knockout fixtures as they're scheduled (June 28+)
- `worldCups[*].apps/goals/assists` for the 2026 entry — currently `null`, fill post-tournament
- `careerHonors` numbers (e.g. Ballons d'Or count) — verify on Wikipedia after any awards ceremony
- `worldCupGoals`/`worldCupAssists`/`worldCupApps` top-level totals MUST equal the sum of the per-WC entries. See "Stat data integrity" below.

### Stat data integrity — ALWAYS run the consistency check after editing `data/players.js`

We learned the hard way: it's easy to update a stat number in one place and not the other. The page renders count-of-past-WCs as `worldCups.length - 1`, which is independent from the top-level `worldCupApps` total. They can silently drift.

**The profile hero DISPLAYS the live career total = stored + 2026 (added 2026-06-27).** The stored `worldCupGoals`/`worldCupAssists`/`worldCupApps` fields stay PRE-2026 (sum of completed WCs — Check 1 below verifies exactly that, unchanged). But the hero stat boxes ADD the live `tournament2026Tally` so they reflect current reality, not a frozen pre-tournament record (user-flagged: "5 World Cups" while Ronaldo is playing his 6th, "8 goals" while he's on 10). So the hero shows `worldCupGoals + tally.goals` (Messi 13→**18**, matching his record-breaking note), `worldCupAssists + tally.assists` (Modrić 2→**3** off his Ghana assist), `worldCupApps + tally.apps`, and World Cups = `worldCups.length - 1 + (tally ? 1 : 0)` (he's appeared in 6). **All four now include 2026 from the same ESPN-verified source** — assists were folded in 2026-06-27 after the user rightly asked "if we have goal number, why not assist from the same source" (the omission was an inconsistency, not a real data gap). This is DISPLAY-only: the stored `worldCup*` fields + Check 1 are untouched, and the per-tournament breakdown still lives in the "so far" block + timeline.

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

**Assist counts are the murkiest stat — but only in CAREER AGGREGATE.** FIFA, Opta, StatsBomb, and Wikipedia frequently differ on what counts as an assist *across decades*, so don't chase perfect parity across providers for the stored pre-WC totals; as long as our per-WC entries sum to the page total, the page is internally consistent — that's the bar. **Per-GAME 2026 assists are NOT murky, though** — ESPN's match summary credits "Assisted by <name>" on each goal, so `result.legendAssists` is captured cleanly from the same feed as goals (don't reintroduce the "we can't track 2026 assists" reasoning — that was wrong, the user caught it 2026-06-27).

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
- ✅ **Match-result updates during the tournament** — ENGINE BUILT 2026-06-05, **LIVE LOOP RUNNING since 2026-06-13** (first result: Brazil 1-1 Morocco on Neymar's opener card, commit `7e7f348`). Add a `result: { outcome, score, scorers }` to the played match in `wc2026.matches[]` (schema above) — it renders on the schedule card + `/status`, auto-advances the player MatchCountdown + homepage hero bar, and updates `status.note`. Also flip `wc2026.status` as legends advance/exit. This is the manual returning-visitor loop (~5 min/game). See "The match-result update loop" operational recipe below.
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

## Session handoff — current state (last updated 2026-06-26, tournament LIVE — knockouts about to start)

Quick orientation for a fresh session. Details live in the gotchas + "three tournament SEO pages" section above.

**2026-06-26 session — live in-match data layer (the big one this week):**
- **Built the live ESPN data layer** — `LiveNow` (live scores, country-based → knockout-proof) + `LiveGroupTable` (live group standings). See the new **"Live in-match data layer"** gotcha for the full design + the non-revert rules. Both client-side off ESPN's free keyless CORS API → site stays static, zero cost, can't break a page (null on error). Commits `f895583` (first LiveScore), `5581af8` (live standings), `0ce6c36` (hero+status), **`9a8a203`** (knockout-proof `LiveNow` rewrite + adversarial-review hardening).
- **Why it was built:** the user's recurring pain was "I check during/after a match and nothing's updated" — the agent only records the FINAL ~10–15 min post-FT. The live layer fills that gap (live score during the game, current standings instantly at FT) and, crucially, **makes the agent's exact timing no longer load-bearing.**
- **Ran an adversarial-review workflow** (4 lenses × independent verification) on `LiveNow` before shipping → fixed 7 confirmed issues (standings `rank` sort, poll-chain re-entrancy + `pageshow`/bfcache, `showFinal` live-only gate to kill FT duplication, `aria-live`, NaN-date hardening, fade-in). No hydration/#418 risk (confirmed). All verified in Claude Preview against the live Belgium 5–1 New Zealand game.
- **Agent loop is healthy** — recorded Belgium 5–1 NZ and Brazil's group games autonomously; the earlier failures were the Anthropic Console **credit run-out**, not the cron/code. (Reminder: user should enable auto-reload on Console billing.)
- **Tournament state:** group stage finishing. Brazil (Neymar) + Belgium (KDB) already through to the **Round of 32**; Croatia/Portugal/Argentina play their group finales next (Croatia–Ghana, Portugal–Colombia, Argentina–Jordan). Knockouts start ~Jun 28 — `LiveNow` will cover them with no data work; the agent should start adding `wc2026.knockout[]` entries per round.

**2026-06-11 → 06-13 session — tournament opens, schedule fixed, first result loop fires:**

**2026-06-11 → 06-13 session — tournament opens, schedule fixed, first result loop fires:**
- **THE LIVE RESULT LOOP IS RUNNING.** First result pushed 2026-06-13: **Brazil 1-1 Morocco** (Saibari ~17–21', Vinícius Júnior 32') on Neymar's opener card — he sat out injured (calf), recorded as team-level `D 1-1` with scorers `"Vinícius Júnior 32′ · Neymar out (calf)"`, status note → Haiti return Jun 19 (commit `7e7f348`). See the new **"match-result update loop"** operational recipe. This is now the weekly P0; the user pings after each legend's game.
- **Schedule audited + corrected vs FIFA/Wikipedia (commit `ae6a33a`).** Real errors fixed, not just TBDs: KDB/Belgium–Egypt is **Jun 15** (was 16) at Lumen Field Seattle, Iran Jun 21 (was 22), venues were all TBD; Messi–Austria Jun 22 (was 21), Jordan Jun 27 (was 25); Ronaldo's three kickoffs filled; Neymar–Haiti 8:30pm ET. **All 15 group fixtures now have a verified `kickoffUtc`** (zero TBDs). Corrected match week: Jun 13 Neymar · **15 KDB** · 16 Messi · 17 Ronaldo+Modrić.
- **Homepage hero Countdown retargeted (commit `61d16ab`)** — was going to freeze at 00:00:00:00 once the opener kicked off; now counts down to the next legend match, shows a "kicked off · see who's still standing" state mid-match, falls back to a knockout line. Verified live in prod during Brazil–Morocco. See the new Countdown gotcha.
- **MatchCountdown now targets the first UNPLAYED match** (not `matches[0]`) so it auto-advances when a result is added — see updated gotcha.
- **discover.mjs adaptive backoff (commit `123cecb`)** — opener-day Reddit throttled every feed two runs straight (single requests still 200 → burst budget tightened); on a 429 the crawl now cools down 15s before the next feed + base inter-feed gap 1100→2200ms. The 06-12 run recovered (9 drafts). If a morning run still comes back all-throttled, next lever is cutting requests/run (drop global search or trim subs).
- **Still in the post-ban no-link cool-down** (started 06-10, ~5–7 days). Digest drafts still print URLs — STRIP the link line before posting this week; link-free participation only, esp. r/Canarinho before/around Brazil games.
- **NEXT match in the loop: Mon Jun 15, 3pm ET — Belgium vs Egypt (KDB plays).** Richer card than the Neymar-sat-out draw.

**2026-06-08 → 06-10 session — Neymar surge, r/soccer permaban, digest hardening:**
- **Neymar surge traced (06-08):** 208 visitors (+890%), 199 straight to `/player/neymar`, from the r/Justfuckmyshitup "haircut" comment (2,538 views, ~8% CTR). Week-4 learning logged: banter subs CAN convert with a curiosity hook + clickable `https://` deep-link. Same day, **Neymar declared 2026 his last World Cup** — strongest news peg the project has had.
- **r/soccer PERMABANNED the posting account (06-10)** after the Messi TIME100 linked reply. See the "r/soccer PERMABAN" playbook section: no evasion ever, megasubs are no-link territory, ~2–3 linked comments/week max, watch for domain shadow-filtering. `discover.mjs` now has `BANNED_SUB` (r/soccer filtered entirely) + `NO_LINK_SUB` (r/worldcup etc. → link-free drafts, labelled in digest/brief); r/Canarinho added to Neymar's curated subs.
- **Email capture: deliberately deferred** (traffic too cold/bouncy to convert; the status-update loop is the retention engine). Trigger to revisit: engaged multi-page traffic sustaining during opener week.
- **30-day analytics (06-09): 569 visitors / 1,281 views.** Baseline floor trending up (~20→50/day pre-spike). neymar 342 > ronaldo 98 > modric 69 > messi 55 > debruyne 38.
- **NEXT: the tournament starts June 11.** The whole returning-visitor loop = flip `wc2026.status` + add match `result`s after every legend's game (~5 min/game). User committed to this cadence.

**2026-06-07 session (cont.) — FAQ on /road-to-the-final:**
- Added a **knockout-journey FAQ** (4 Q&As in `roadFaqs`) + FAQPage JSON-LD to `/road-to-the-final`, matching the FAQ surface player/status/format pages already have (`/status` already had FAQPage — no change there). Deliberately scoped to PATH-specific intent (games-to-win=8, final date/venue, legend QF collisions Messi↔Ronaldo & Modrić↔Neymar verified from `projectedPaths`, how projections work) so it does NOT cannibalize `/world-cup-2026-format`, which owns the generic format/knockout FAQ. Reuses the `.faq-*` CSS. Visible section is the real value — Google deprecated FAQ rich results for non-gov/health sites in 2023, so the JSON-LD is for site-pattern consistency + indexable text, not a rich snippet.

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
- ~~**r/soccer (~1.2M)** is bigger but stricter~~ — **ACCOUNT PERMABANNED 2026-06-10, off-limits forever.** See "r/soccer permaban" section below; never touch it from any account (evasion = platform-wide ban risk)
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
- **r/soccer: PERMANENTLY BANNED (2026-06-10).** The posting account was permabanned for self-promo after the Messi TIME100 linked reply. `discover.mjs` hard-filters it (`BANNED_SUB` — never surfaces) and it's removed from every player's sub list. **NEVER post/comment there from any account** — see the permaban section below.

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

### What's actually working (data from week 4 — 2026-06-08): a circlejerk/jfmsu comment CONVERTED — refining the "views ≠ visits" rule

**The surge:** on 2026-06-08 Vercel showed a sudden spike — **208 visitors (+890%), 93% bounce, ~7–8am, 87% mobile / 44% Android**, with **199 of 208 landing directly on `/player/neymar`** (homepage only 7) and referrers `com.reddit.frontpage` (58) + `reddit.com` (32). Tracked to a single comment via the account's Comments tab: **r/Justfuckmyshitup "Neymar Jr world cup haircut" → 2,538 views, +6, 11h old** (the next-biggest, r/RealMadridFC UCL 1,043 views, is a Modrić/Ronaldo topic → would feed those pages, not Neymar, so eliminated by destination). ~199 visits / 2,538 views ≈ **~8% click-through** — strong.

**Why this MATTERS — it contradicts the week-3 "circlejerk/jfmsu = views-not-visits" rule, in a useful way.** The earlier jfmsu/banter comments that pulled views-but-zero-visits were **link-less** (or bare-domain dead links). This one converted because it did BOTH things right:
1. **It carried a full clickable `https://finalchapterfc.com/player/neymar` deep-link** (not a bare domain — bare domains die as gray text on the now-majority mobile app).
2. **The banter ended on a curiosity hook about his REAL 2026 story** — "that noodle cut from 2022 still gives me nightmares lol… wild thing is he's heading into 2026" — the joke is the bridge, the "heading into 2026" is the bait. People tapped to see *what's actually at stake in 2026*.

**Refined rule (supersedes the blanket "avoid jfmsu"):** circlejerk/jfmsu/banter subs CAN convert — but ONLY when the comment (a) ends on a genuine curiosity hook about the player's actual 2026 stakes, and (b) carries a full clickable `https://` deep-link. The structure that works is **banter hook → "but his real 2026 story is…" → deep-link**. Replicate the *formula*, not the sub: the same structure on an on-target national-team sub (r/Canarinho) should convert even harder because it stacks a warm audience on top of it. Link-less banter is still pure account-warming (karma only) — that part of the week-3 rule holds.

**Timing context:** Neymar publicly declared on 2026-06-08 that the 2026 World Cup will be **his last** (international-farewell / "Last Dance" in response to a FIFA post), as Brazil celebrated his squad inclusion ahead of the June 13 opener vs Morocco. The whole site IS "The Final Chapter," so this is the single strongest news peg the project has had — ride farewell/"last dance" threads on r/Canarinho while the news is live.

### r/soccer PERMABAN (2026-06-10) — the link-frequency ceiling is real

One day before the opener, **r/soccer permanently banned the posting account** ("your comment violates this community's rules" — the Messi TIME100 reply with the site link, from that morning's digest). A mod clicking the profile sees a comment history dense with `finalchapterfc.com` links → reads as a promo pattern → permaban on pattern, not on the single comment. We had a warning sign the week before: a r/worldcup comment was `[Removed by moderator]`. Rules now in force:

1. **NO evasion, ever.** The modmail carried the Reddit-admin warning: using another account in r/soccer = platform-wide ban risk. The account — and its old, still-converting comments — is worth more than any sub. If the account dies, ~80% of distribution dies with it.
2. **Megasubs are NO-LINK territory.** r/soccer is gone; r/worldcup was already removing linked comments. Policy: in big general-football subs, participate with **no URL at all** (visibility + account-warming only). The link belongs exclusively in small on-target subs where the account is a known regular (r/Canarinho, r/croatia, r/ACMilan) — which is also where conversion was always best.
3. **Ratio discipline (Reddit's ~9:1 guideline).** Most contributions must be genuine no-link comments; **~2–3 linked comments per WEEK, not per day.** It's the *history reading as a promo feed* that converts one mod click into a permaban.
4. **Watch for domain shadow-filtering — the real existential risk.** Periodically open a recent linked comment in a logged-out/incognito browser. If it's invisible logged-out while visible logged-in, Reddit's spam layer has learned the domain and every linked comment everywhere is silently dead → stop linking entirely and reassess.
5. **Appeal:** optional, one polite modmail max, never argue. Rated <20% given the history.

**`discover.mjs` changes (same date):** `BANNED_SUB` regex — r/soccer is filtered out entirely (can't reply there, so it never surfaces) and removed from every player's curated sub list; `NO_LINK_SUB` regex (r/worldcup, r/football, r/futbol) — drafts for these subs are generated **without a URL** (rule-4 override in the draft prompt) and labelled "⚠ NO-LINK sub" in the text digest, HTML, and editor's brief. Also added r/Canarinho to Neymar's curated subs (best converter; was only reachable via global search before).

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
