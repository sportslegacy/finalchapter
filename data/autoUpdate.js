// Freshness signal for the autonomous match-result updater.
//
// The CI workflow's commit step rewrites this file on EVERY real result push
// (and only then — see .github/workflows/match-results.yml). So a fresh value
// here proves the whole chain actually reached the live site:
//   cron-job.org -> workflow_dispatch -> agent edit -> push -> Vercel deploy.
// If it's stale a while after a match finished, a run may have "triggered" but
// no real update was applied (the exact past failure mode) — go check the run
// log + cron-job.org History. Surfaced on /status as the "results auto-updated"
// line via app/components/AgoTime.js.
export const autoUpdate = { updatedAt: "2026-06-20T05:05:00.000Z" };
