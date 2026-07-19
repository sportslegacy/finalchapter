# The Final Chapter

A static [Next.js](https://nextjs.org) tribute site for five footballers — **Messi, Ronaldo, Modrić, Neymar, De Bruyne** — playing their final World Cup at the 2026 FIFA tournament (USA · Canada · Mexico).

**Live:** [finalchapterfc.com](https://finalchapterfc.com) (archived — see status below)

---

## ⚠️ Project status: wound down (July 2026)

This project was **wound down after the 2026 World Cup**. It never found meaningful, sustained traffic (~19 visitors/day baseline; the spikes were single-Reddit-comment events with 90%+ bounce that evaporated the next day).

The build was solid — a fast static site with live match-result automation, structured data, and an honest data-driven distribution playbook. The **distribution thesis** was the failure:

> A great build cannot save a bad distribution thesis. The topic was **time-boxed** (a one-month event; SEO compounds over months), **saturated by incumbents** who own every high-intent surface (ESPN + Google's live-score box), and reachable only through **one fragile channel** (Reddit — which permabanned the posting account the day before kickoff).

**📄 Read the full retrospective and learnings → [`POSTMORTEM.md`](POSTMORTEM.md)**

The automation (GitHub Actions match-result updater + external cron trigger) has been disabled; the site remains live as a free static archive.

---

## Stack

- **Next.js** App Router, React 19 — fully static export (no DB, no API routes, no SSR)
- Deployed on **Vercel** (Hobby / free); auto-deploys on push to `main`
- Content lives in [`data/players.js`](data/players.js) — single source of truth
- See [`CLAUDE.md`](CLAUDE.md) for the complete architecture, gotchas, and distribution playbook

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static production build
```
