#!/usr/bin/env node
// Detector for the server-side match-result auto-updater (.github/workflows/
// match-results.yml). Lists legend group matches that have ALREADY kicked off
// (kickoffUtc in the past) but still have NO `result` — i.e. results the live
// site is missing. The CI workflow runs this first and only spends Claude
// tokens when this reports something pending, so the frequent cron is cheap.
//
// Usage:
//   node scripts/distribution/pending-results.mjs           # human-readable list
//   node scripts/distribution/pending-results.mjs --json    # JSON array (for tooling)
//   node scripts/distribution/pending-results.mjs --count   # bare integer (CI gate)
//
// Mirrors discover.mjs's dynamic-import of data/players.js (proven to work; the
// data file is ESM-syntax in a CommonJS package, so it needs Node 22+'s ESM
// detection — the workflow pins node-version 22).

const mod = await import(new URL("../../data/players.js", import.meta.url));
const players = mod.players || [];

const now = Date.now();
const pending = [];
for (const p of players) {
  const matches = p.wc2026?.matches || [];
  matches.forEach((m, i) => {
    if (!m.kickoffUtc) return;            // TBD kickoff — can't know if it's been played
    if (m.result) return;                 // already recorded
    if (new Date(m.kickoffUtc).getTime() > now) return; // not kicked off yet
    pending.push({
      player: p.id,
      name: p.name,
      country: p.country,
      opponent: m.opponent,
      date: m.date,
      kickoffUtc: m.kickoffUtc,
      matchIndex: i,
    });
  });
}

if (process.argv.includes("--count")) {
  process.stdout.write(String(pending.length));
} else if (process.argv.includes("--json")) {
  console.log(JSON.stringify(pending, null, 2));
} else if (!pending.length) {
  console.log("No pending results — every kicked-off legend match already has a result.");
} else {
  console.log(`${pending.length} legend match(es) need a result recorded:`);
  for (const m of pending) {
    console.log(`  - ${m.name}: ${m.country} vs ${m.opponent} (${m.date}, kickoff ${m.kickoffUtc})`);
  }
}
