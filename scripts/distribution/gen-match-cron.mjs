#!/usr/bin/env node
// Generate GitHub Actions cron lines clustered around each upcoming legend
// match's post-full-time window. GitHub heavily throttles flat scheduled crons
// on quiet public repos (we saw every-10-min collapse to every ~2-3h), so
// instead of spraying runs all day we CONCENTRATE a few attempts right after
// each match ends — the time when a result is actually ready. The detector's
// 120-min gate + the agent's "is it final?" check make any too-early attempt a
// harmless no-op.
//
// Run this whenever the schedule changes (e.g. knockout fixtures get kickoff
// times) and paste the output into the `schedule:` block of
// .github/workflows/match-results.yml, keeping the sparse safety-net cron.
//
//   node scripts/distribution/gen-match-cron.mjs

const mod = await import(new URL("../../data/players.js", import.meta.url));
const players = mod.players || [];

// Minutes after kickoff to attempt. Spread across the WHOLE match, not just
// after full time: GitHub honors only a fraction of scheduled triggers, so
// more attempts spanning the game = better odds it honors one in the recording
// window. The first three (+5 right after kickoff, +55 mid-game, +95 late) are
// heartbeat no-ops — the detector's 120-min gate won't let the agent record an
// in-progress match — but they're extra trigger chances and confirm the cron
// is live that day. Recording happens at +125 onward (just past the gate),
// out to ~FT+100 so a throttled-early cluster still gets caught before the
// 6-hourly safety net. Knockouts run longer; regenerate with later tail times.
const ATTEMPTS_MIN = [5, 55, 125, 165, 215];

const now = Date.now();
const lines = new Map(); // cron string -> earliest match label (for a comment)
for (const p of players) {
  for (const m of p.wc2026?.matches || []) {
    if (!m.kickoffUtc || m.result) continue; // only matches still needing a result
    const ko = new Date(m.kickoffUtc).getTime();
    for (const mins of ATTEMPTS_MIN) {
      const t = new Date(ko + mins * 60000);
      if (t.getTime() < now) continue; // already past — would never fire again
      const cron = `${t.getUTCMinutes()} ${t.getUTCHours()} ${t.getUTCDate()} ${t.getUTCMonth() + 1} *`;
      if (!lines.has(cron)) lines.set(cron, `${p.country} v ${m.opponent}`);
    }
  }
}

// Sort by month, day, hour, minute so the block reads chronologically.
const sorted = [...lines.entries()].sort((a, b) => {
  const pa = a[0].split(" ").map(Number), pb = b[0].split(" ").map(Number);
  return pa[3] - pb[3] || pa[2] - pb[2] || pa[1] - pb[1] || pa[0] - pb[0];
});

console.log(`    # --- match-window attempts (generated ${new Date(now).toISOString().slice(0, 16)}Z; regenerate via gen-match-cron.mjs) ---`);
for (const [cron, label] of sorted) {
  console.log(`    - cron: "${cron}" # ${label}`);
}
console.log(`    # ${sorted.length} attempts across ${new Set([...lines.keys()].map((c) => c.split(" ").slice(2).join("/"))).size} time slots`);
