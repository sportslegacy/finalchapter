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
  layout.js              # root metadata (OG, Twitter, metadataBase) + <Analytics/>
  page.js                # homepage (hero, tournament, legends grid, cities)
  not-found.js           # branded 404
  globals.css            # all styles + CSS variables (--accent-gold, etc.)
  icon.svg               # favicon — static SVG, gold "F" on dark
  apple-icon.js          # 180×180 PNG for iOS home screen, generated via next/og
  opengraph-image.js     # 1200×630 PNG OG card, generated at build via next/og
  twitter-image.js       # re-exports opengraph-image
  player/[id]/page.js    # per-player detail page (SSG'd for all 5 ids)
  components/
    Nav.js               # header w/ hamburger drawer + LEGENDS dropdown
    Countdown.js         # site-wide ticker to the tournament opener
    MatchCountdown.js    # per-player ticker to their first group match (handles TBD)
    HashScroll.js        # smooth-scroll for /#section links
    ShareCard.js         # canvas-generated downloadable cards on player pages
  lib/navigate-to-section.js
data/players.js          # all content
scripts/test-nav.mjs     # playwright test for nav dropdown widths
.claude/launch.json      # for Claude Preview MCP — points at `npm run dev` on :3000
```

### Player page section order

(See `app/player/[id]/page.js`.)

1. Profile hero (flag, name, country/position/age, quote, stats)
2. **Final Chapter pull-quote** — gold pill + serif italic, sets thematic anchor
3. **Match Countdown** — "Next up · Country vs Opponent · in X days Y hours"
4. Group Stage Schedule — group badge, storyline, 3 match cards
5. **Records in Play** — 3-card milestone grid ("3 from Klose", "Sixth WC", etc.)
6. Career Timeline ("Every Chapter") — one card per past World Cup + a 2026 "future" card
7. Bio + career honors tags
8. ShareCard (canvas download)
9. Prev/next player nav, footer

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

### Stale player content to refresh as 2026 approaches

`data/players.js` is the only file to touch for content. Things that may drift:
- `clubAtTournament` (Modrić → AC Milan, KDB → Napoli — already updated for 2025 transfers)
- `wc2026.matches[*].time` / `kickoffUtc` — FIFA will lock in TBD times closer to tournament
- `worldCups[*].apps/goals/assists` for the 2026 entry — currently `null`, fill post-tournament

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

- **Real editorial photo per player** — single biggest UX upgrade. Use Wikipedia public-domain or commission. `next/image` already supported.
- **`robots.txt` / `sitemap.xml`** — Next.js can auto-generate via `app/robots.js` + `app/sitemap.js` (~15 lines each).
- **Per-player OG images** — currently all share the site-level OG card. Easy with `app/player/[id]/opengraph-image.js`.
- **JSON-LD `SportsEvent` structured data** — rich Google snippets for "World Cup 2026" queries.
- **`error.js` boundary** — pure static + no API means basically nothing to crash, but it's polite.
- **A11y audit** — Lighthouse pass; spot-check contrast tweaks.
- **PWA manifest beyond `apple-icon`** — service worker / offline play.

## Quick checks after any deploy

1. **Phone:** load https://finalchapterfc.com, click into a player, open the LEGENDS dropdown
2. **Countdown** is ticking and the day count matches `(2026-06-11T19:00:00Z − Now())`
3. **Per-player MatchCountdown** renders "Next up · …" above each schedule
4. **Records in Play** cards show with the gold top stripe
5. **OG preview:** paste URL into iMessage → gold "The Final Chapter" 1200×630 card shows
6. **`Add to Home Screen`** on iOS → gold "F" icon, not a screenshot thumbnail
7. **Analytics dashboard** (Vercel project → Analytics tab): page views appearing within 1–2 min of a real visit (use mobile data / incognito if ad-blocker is suspected)
