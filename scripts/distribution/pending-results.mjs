#!/usr/bin/env node
// Detector for the server-side match-result auto-updater (.github/workflows/
// match-results.yml). Emits two kinds of pending work:
//
//   • GROUP    — a wc2026.matches[] entry that kicked off >120min ago with no
//                `result` yet (precise: group fixtures carry kickoffUtc).
//   • KNOCKOUT — an ALIVE legend who is past the group stage and whose nation
//                ESPN's scoreboard shows has played a FINISHED game NEWER than
//                anything we've recorded. Knockout fixtures aren't pre-loaded
//                (the bracket only resolves once the groups finish), so we detect
//                them COUNTRY-BASED from ESPN's free public scoreboard — the same
//                approach as the on-page LiveNow component — needing zero
//                per-round fixture data.
//
// The CI workflow runs this first and only spends Claude tokens when something is
// pending, so the frequent cron stays cheap.
//
// Usage:
//   node scripts/distribution/pending-results.mjs           # human-readable list
//   node scripts/distribution/pending-results.mjs --json    # JSON array (for tooling)
//   node scripts/distribution/pending-results.mjs --count   # bare integer (CI gate)
//
// Dynamic-imports data/players.js (ESM-syntax in a CommonJS package → needs Node
// 22+; the workflow pins node-version 22).

const mod = await import(new URL("../../data/players.js", import.meta.url));
const players = mod.players || [];

const now = Date.now();
// A match is only "ready to record" this many ms after kickoff — a group game is
// over by ~120 min (90 + half-time + stoppage). If a cron fires while a long game
// is in its dying minutes, the agent's own "is it final?" check skips it, so 120
// is safe. Knockouts run longer (extra time + pens) but ESPN's state==="post" is
// the real "finished" signal for those; this is a secondary guard.
const FINISHED_AFTER_MS = 120 * 60 * 1000;

const pending = [];

// --- GROUP detection (proven; unchanged) ---------------------------------
for (const p of players) {
  const matches = p.wc2026?.matches || [];
  matches.forEach((m, i) => {
    if (!m.kickoffUtc) return; // TBD kickoff — can't know if it's been played
    if (m.result) return; // already recorded
    if (new Date(m.kickoffUtc).getTime() + FINISHED_AFTER_MS > now) return; // not finished
    pending.push({
      type: "group",
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

// --- KNOCKOUT detection (ESPN, country-based) ----------------------------
// A genuinely new knockout round is DAYS after the last recorded game, so an
// ESPN kickoff must beat our latest-recorded by this margin to count as new —
// far above any minor mismatch between ESPN's listed kickoff and our stored one,
// so an already-recorded game can never be re-flagged.
const NEW_ROUND_MARGIN_MS = 18 * 60 * 60 * 1000;

function canon(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\bdr\b/g, " ")
    .replace(/[^a-z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}
function sameTeam(a, b) {
  const ca = canon(a);
  const cb = canon(b);
  return !!ca && !!cb && (ca === cb || ca.includes(cb) || cb.includes(ca));
}

// One scoreboard fetch over the last ~8 days → the FINISHED World Cup games.
// Returns null on ANY failure, so knockout detection just stays dormant that run
// (the next cron retries) — it can never crash the detector or block the group
// path.
async function espnFinishedGames() {
  const day = (ms) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, "");
  const range = `${day(now - 8 * 864e5)}-${day(now + 864e5)}`;
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${range}`
    );
    const j = await res.json();
    const games = [];
    for (const e of j.events || []) {
      if (e.status?.type?.state !== "post") continue; // finished only
      const names = (e.competitions?.[0]?.competitors || [])
        .map((c) => c.team?.displayName)
        .filter(Boolean);
      const kickoff = new Date(e.date).getTime();
      if (!Number.isFinite(kickoff) || names.length < 2) continue;
      games.push({ names, kickoff, date: e.date });
    }
    return games;
  } catch {
    return null;
  }
}

const espnGames = await espnFinishedGames();
if (espnGames) {
  for (const p of players) {
    const st = p.wc2026?.status || { stage: "group", alive: true };
    const alive =
      st.alive !== false && st.stage !== "champion" && st.stage !== "eliminated";
    if (!alive) continue;
    const matches = p.wc2026?.matches || [];
    // Only look for knockout games once the legend is PAST the group stage
    // (all group fixtures recorded) — group games are handled precisely above.
    const groupDone = matches.length > 0 && matches.every((m) => m.result);
    if (!groupDone) continue;

    const ko = p.wc2026?.knockout || [];
    const recorded = [
      ...matches
        .filter((m) => m.result && m.kickoffUtc)
        .map((m) => new Date(m.kickoffUtc).getTime()),
      ...ko.filter((k) => k.kickoffUtc).map((k) => new Date(k.kickoffUtc).getTime()),
    ];
    const recordedLatest = recorded.length ? Math.max(...recorded) : 0;

    const candidate = espnGames
      .filter((g) => g.names.some((n) => sameTeam(n, p.country)))
      .filter((g) => g.kickoff > recordedLatest + NEW_ROUND_MARGIN_MS)
      .filter((g) => now - g.kickoff > FINISHED_AFTER_MS)
      .sort((a, b) => b.kickoff - a.kickoff)[0];
    if (!candidate) continue;

    const opponent =
      candidate.names.find((n) => !sameTeam(n, p.country)) || "TBD";
    pending.push({
      type: "knockout",
      player: p.id,
      name: p.name,
      country: p.country,
      stage: st.stage, // the round they're IN = the round they just played
      opponent,
      kickoffUtc: candidate.date,
    });
  }
}

// --- output --------------------------------------------------------------
if (process.argv.includes("--count")) {
  process.stdout.write(String(pending.length));
} else if (process.argv.includes("--json")) {
  console.log(JSON.stringify(pending, null, 2));
} else if (!pending.length) {
  console.log("No pending results — every kicked-off legend match already has a result.");
} else {
  console.log(`${pending.length} legend match(es) need a result recorded:`);
  for (const m of pending) {
    const tag = m.type === "knockout" ? `[KNOCKOUT ${m.stage}] ` : "";
    console.log(`  - ${tag}${m.name}: ${m.country} vs ${m.opponent} (kickoff ${m.kickoffUtc})`);
  }
}
