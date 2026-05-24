# Final Chapter — project notes for Claude

Static Next.js fan site celebrating five legends playing their final World Cup at the first 48-team FIFA tournament (USA · Canada · Mexico, 11 Jun – 19 Jul 2026).

**Players:** Lionel Messi, Cristiano Ronaldo, Luka Modrić, Neymar Jr, Kevin De Bruyne.

## Live

- **Production:** https://finalchapterfc.com (and www.finalchapterfc.com)
- **Vercel preview alias:** https://finalchapter.vercel.app
- **Vercel project:** `finalchapter` under `starwindmoonclouds-projects`
- **GitHub:** https://github.com/sportslegacy/finalchapter (public, `main`)
- **Hosting plan:** Vercel Hobby (free). 100GB bandwidth/mo ceiling; plenty of headroom.

## Stack

- **Next.js 16.2.6** App Router, React 19, Turbopack
- **No DB, no API routes, no SSR.** Every route is static (`○`) or SSG (`●` for `/player/[id]`).
- Fonts: Playfair Display (serif) + Inter (sans), via Google Fonts CDN
- Styles: a single `app/globals.css` + one CSS module (`app/page.module.css`)
- Content lives in **`data/players.js`** — single source of truth for the 5 players and tournament data

## How to ship a change

```bash
# 1. self-test
npm run build                   # must compile clean — no skipping
# 2. for UI changes, render & eyeball
npm run dev                     # then open http://localhost:3000 in a small viewport
# 3. commit + push → auto-deploys
git add <files>
git commit -m "..."
git push                        # Vercel deploys on push to main in ~30s
```

**Auto-deploy is live.** Every push to `main` triggers a production build at Vercel. No `vercel --prod` needed unless GitHub is down.

To force a manual deploy: `vercel --prod` from the repo root (Vercel CLI is `npm i -g vercel`, logged in as `starwindmooncloud`).

## File layout

```
app/
  layout.js              # root metadata (OG, Twitter, metadataBase)
  page.js                # homepage (hero, tournament, legends grid, cities)
  not-found.js           # branded 404
  globals.css            # all styles + CSS variables (--accent-gold, etc.)
  icon.svg               # favicon — static SVG, gold "F" on dark
  apple-icon.js          # 180×180 PNG for iOS home screen, generated via next/og
  opengraph-image.js     # 1200×630 PNG OG card, generated at build via next/og
  twitter-image.js       # re-exports opengraph-image
  player/[id]/page.js    # per-player detail (SSG'd for all 5 ids)
  components/
    Nav.js               # header w/ hamburger drawer + LEGENDS dropdown
    Countdown.js         # ticks to opening match
    HashScroll.js        # smooth-scroll for /#section links
    ShareCard.js         # canvas-generated downloadable cards on player pages
  lib/navigate-to-section.js
data/players.js          # all content
scripts/test-nav.mjs     # playwright test for nav dropdown widths
```

## Brand tokens (in `app/globals.css`)

| Var | Value | Use |
|---|---|---|
| `--bg-primary` | `#0a0a0c` | page background |
| `--bg-secondary` | `#111116` | cards, drawer |
| `--accent-gold` | `#d4a853` | headlines, CTAs |
| `--accent-gold-dim` | `#a88535` | borders |
| `--accent-blue` | `#4a7bff` | links |
| `--text-primary` | `#f0f0f2` | body |
| `--text-secondary` | `#9a9ab0` | subdued |
| `--font-serif` | Playfair Display | h1/h2 |
| `--font-sans` | Inter | body, UI |

## Gotchas / lessons learned

### Opening-match kickoff time

`tournament.openingMatch.kickoffUtc` in `data/players.js` is **`2026-06-11T19:00:00.000Z`** — that's 13:00 Mexico City local / 15:00 ET. This is the **official** kickoff (Yahoo, Roadtrips, Wego, FOX all agree).

FIFA's homepage countdown widget appears to be running ~1 hour late (showing 20:00 UTC). **Don't "fix" the countdown to match FIFA's widget** — ours is correct, theirs is off.

### Nav dropdown chevron on narrow phones

At < 430px viewport, the `Tournament | Legends + chevron | Cities` row used to overflow and the chevron got pushed off-screen on iPhone 17 (393pt). Fix lives in `app/globals.css` — a `@media (max-width: 430px)` that hides Tournament and Cities inline (they're still in the hamburger drawer). Don't undo it.

### Next.js dev "N" indicator

Disabled via `devIndicators: false` in `next.config.mjs`. If a future Next release renames this, the badge will reappear in dev — re-check the config flag name.

### iOS UI changes need a pixel render

Per the global CLAUDE.md rule: `npm run dev` + headless build is not enough for UI changes. For UI changes, run the dev server, open in a real mobile viewport (iPhone 17 ≈ 393×852, iPhone SE ≈ 375×667 for the narrow edge case), and verify the change visually before pushing. Production deploys on push, so a broken UI lands instantly.

### `playwright` is installed for `scripts/test-nav.mjs`

The script is in `package-lock.json` already; if it's not installed locally: `npm i -D playwright && npx playwright install chromium`. Run it against `npm run dev` on `:3000` to verify nav widths.

## Domain / DNS (GoDaddy, current)

- Registrar: GoDaddy
- DNS records that matter:
  - `A    @     76.76.21.21`              → Vercel anycast
  - `CNAME www  cname.vercel-dns.com.`    → Vercel managed
- Other records (NS, SOA, `_domainconnect`, `_dmarc`) — leave alone
- **Don't reattach** GoDaddy's WebsiteBuilder to the domain — it silently overwrites the apex A record back to GoDaddy parking IPs

If SSL ever fails to auto-issue (Vercel's prober occasionally misses the DNS), force it: `vercel certs issue finalchapterfc.com www.finalchapterfc.com`.

## What's intentionally NOT done (post-MVP backlog)

- Analytics — no GA / Vercel Analytics / Plausible wired up
- `error.js` boundary — Next default is fine for now
- `robots.txt` / `sitemap.xml` — not blocking; 6-page site, Google finds it
- PWA manifest beyond `apple-icon` (no service worker, no offline)
- Per-player OG images — currently all share the same site-level OG card
- JSON-LD `SportsEvent` structured data — nice for rich Google snippets, not urgent
- `next/image` — there are no photo assets currently; if added later, optimize

## Quick checks after any deploy

1. Phone: load https://finalchapterfc.com, click into a player, open the LEGENDS dropdown
2. Countdown is ticking and matches `Today` minus 2026-06-11T19:00:00Z
3. Paste URL into iMessage → gold "The Final Chapter" 1200×630 OG card shows
4. `Add to Home Screen` on iOS → gold "F" icon, not a screenshot thumbnail
