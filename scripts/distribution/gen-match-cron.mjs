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

// Minutes after kickoff to attempt. First at the 120-min gate (≈ full time for
// a group game), then spread out to ~FT+95 so that even if GitHub honors only
// one of the cluster, it lands within ~1.5h of the final whistle. Knockouts
// run longer — the later attempts still catch them once they're final.
const ATTEMPTS_MIN = [120, 145, 175, 215];

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
