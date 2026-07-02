"use client";

import { useState, useEffect } from "react";
import { tournament, stageIndex } from "../../data/players";

// The "Who they could face" projection panel on /road-to-the-final. It ships
// server-rendered as a pot-SEEDING projection, then on mount fetches ESPN's free
// APIs (CORS:*, no key — same source as LiveGroupTable) and narrows to reality:
//   • group finished  → replace the seed chips with the real winner/runner-up.
//   • legend's own group decided → collapse the two "if win / if 2nd" branches.
//   • legend's NEXT knockout opponent is set (ESPN lists e.g. "Brazil v Norway
//     — round-of-16" once the feeding R32 is played) → show that ONE confirmed
//     opponent instead of the seed candidates.
// Any fetch/parse error keeps the static projection — it can never break.

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

// our group letter → [{ name, flag }] + a flat name→{name,flag} lookup (so a
// resolved opponent from any group keeps our flag).
const GROUP_TEAMS = {};
const ALL_TEAMS = [];
for (const g of tournament.groups) {
  GROUP_TEAMS[g.id] = g.teams.map((t) => ({ name: t.name, flag: t.flag }));
  for (const t of g.teams) ALL_TEAMS.push({ name: t.name, flag: t.flag });
}
function teamWithFlag(name) {
  const ours = ALL_TEAMS.find((t) => sameTeam(t.name, name));
  return ours ? { name: ours.name, flag: ours.flag } : { name, flag: "" };
}

// Shared caches (60s) so the up-to-5 lanes share ONE request each.
function makeCache(url) {
  let c = { at: 0, data: null, inflight: null };
  return () => {
    const now = Date.now();
    if (c.data && now - c.at < 60000) return Promise.resolve(c.data);
    if (c.inflight) return c.inflight;
    c.inflight = fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        c = { at: Date.now(), data: j, inflight: null };
        return j;
      })
      .catch(() => {
        c.inflight = null;
        return null;
      });
    return c.inflight;
  };
}
const getStandings = makeCache(
  "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings"
);
function scoreboardUrl() {
  const day = (o) =>
    new Date(Date.now() + o * 864e5).toISOString().slice(0, 10).replace(/-/g, "");
  return `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${day(
    -2
  )}-${day(12)}`;
}
const getScoreboard = makeCache(scoreboardUrl());

// Walk the standings JSON → { letter: { complete, winner, runnerUp } }.
function resolveGroups(json) {
  const out = {};
  const groups = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (typeof n.name === "string" && /^Group [A-L]$/.test(n.name) && n.standings?.entries) {
      groups.push(n);
    } else {
      for (const k in n) walk(n[k]);
    }
  };
  walk(json);
  for (const grp of groups) {
    const letter = grp.name.split(" ")[1];
    const stat = (e, name) => {
      const s = (e.stats || []).find((x) => x.name === name);
      return s ? Number(s.value) : 0;
    };
    const entries = grp.standings.entries
      .map((e) => ({
        name: e.team?.displayName || "?",
        rank: stat(e, "rank"),
        played: stat(e, "gamesPlayed"),
      }))
      .sort((a, b) => (a.rank || 99) - (b.rank || 99));
    const complete = entries.length === 4 && entries.every((e) => e.played >= 3);
    const toOurs = (espnName) => ({ ...teamWithFlag(espnName), grp: letter });
    out[letter] = {
      complete,
      winner: entries[0] ? toOurs(entries[0].name) : null,
      runnerUp: entries[1] ? toOurs(entries[1].name) : null,
    };
  }
  return out;
}

// The nation's NEXT upcoming fixture with a REAL opponent (ESPN lists these once
// the feeding games resolve; placeholder slots read "Round of 32 X Winner"). →
// { name, flag } or null.
function resolveNextOpponent(sb, country) {
  const now = Date.now();
  let best = null;
  for (const e of sb.events || []) {
    if (e.status?.type?.state !== "pre") continue;
    const names = (e.competitions?.[0]?.competitors || []).map((c) => c.team?.displayName);
    if (!names.some((n) => sameTeam(n, country))) continue;
    const opp = names.find((n) => !sameTeam(n, country)) || "";
    if (!opp || /winner|round of/i.test(opp)) continue; // placeholder slot
    const ko = new Date(e.date).getTime();
    if (!Number.isFinite(ko)) continue;
    if (!best || ko < best.ko) best = { ko, opp };
  }
  return best ? teamWithFlag(best.opp) : null;
}

function ProjBranch({ title, rounds }) {
  return (
    <div className="proj-branch">
      <div className="proj-branch-title">{title}</div>
      <ol className="proj-rounds">
        {rounds.slice(0, 3).map((r) => (
          <li key={r.stage} className="proj-round">
            <span className="proj-round-stage">{r.short}</span>
            <span className="proj-round-body">
              <span className="proj-round-pos">
                {r.confirmed ? (
                  <span className="proj-round-seed">Confirmed</span>
                ) : (
                  <>
                    <span className="proj-round-seed">
                      {r.stage === "r32" ? r.posLabel : r.primaryPos}
                    </span>
                    {` · Group ${
                      r.stage === "r32" ? r.groups.join("/") : r.primaryGroups.join("/")
                    }`}
                    {r.hasThirds ? (
                      <span className="proj-or3rd">or a 3rd-place side</span>
                    ) : null}
                  </>
                )}
              </span>
              <span className="proj-teams">
                {r.teams.map((t, i) => (
                  <span
                    key={`${t.grp || "x"}-${i}`}
                    className={`proj-team${t.resolved ? " is-resolved" : ""}`}
                  >
                    <span className="proj-team-flag" aria-hidden="true">
                      {t.flag}
                    </span>
                    {t.name}
                  </span>
                ))}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Only R32/R16/QF are namable — SF/Final fan out across half the draw.
const NAMABLE = ["r32", "r16", "qf"];

export default function RoadProjLive({ proj, country, currentStage }) {
  const [resolved, setResolved] = useState(null); // letter → {complete, winner, runnerUp}
  const [nextOpp, setNextOpp] = useState(null); // confirmed next-round opponent {name, flag}

  // Show only rounds the legend HASN'T played yet — once they advance past R32,
  // drop the round(s) already played. Deterministic from the prop, so it's
  // identical server + first-client render (no hydration mismatch).
  const curIdx = stageIndex(currentStage || "group");
  const visible = (rounds) =>
    rounds.filter((r) => NAMABLE.includes(r.stage) && stageIndex(r.stage) >= curIdx);

  useEffect(() => {
    let cancelled = false;
    getStandings().then((j) => {
      if (!cancelled && j) {
        try {
          setResolved(resolveGroups(j));
        } catch {
          /* keep static projection */
        }
      }
    });
    // Only bother with the fixture lookup once the legend is in the knockouts.
    if (curIdx >= 1) {
      getScoreboard().then((sb) => {
        if (!cancelled && sb) {
          try {
            setNextOpp(resolveNextOpponent(sb, country));
          } catch {
            /* no confirmed opponent */
          }
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [country, curIdx]);

  const narrow = (round) => {
    // The legend's NEXT round (== their current stage) — if ESPN already knows
    // the real opponent (feeding games played), show that ONE team, confirmed.
    if (nextOpp && stageIndex(round.stage) === curIdx) {
      return { ...round, confirmed: true, teams: [{ ...nextOpp, resolved: true }] };
    }
    if (!resolved) return round;
    // R32: a single concrete group → show the one actual qualifier.
    if (round.single && round.groups?.length === 1) {
      const r = resolved[round.groups[0]];
      if (r?.complete) {
        const team =
          round.posLabel === "Winner"
            ? r.winner
            : round.posLabel === "Runner-up"
            ? r.runnerUp
            : null;
        if (team) return { ...round, teams: [{ ...team, resolved: true }] };
      }
      return round;
    }
    // Later rounds: per-group seed → actual qualifier where that group is decided.
    if (round.primaryGroups?.length) {
      const teams = round.primaryGroups.map((letter, i) => {
        const r = resolved[letter];
        if (r?.complete) {
          const team = round.primaryPos === "Winner" ? r.winner : r.runnerUp;
          if (team) return { ...team, resolved: true };
        }
        return round.teams[i];
      });
      return { ...round, teams };
    }
    return round;
  };

  // Once the legend's OWN group is decided, collapse the two "if win / if 2nd"
  // branches to the one that actually happened.
  const own = resolved?.[proj.group];
  let only = null;
  if (own?.complete) {
    if (own.winner && sameTeam(country, own.winner.name)) only = "win";
    else if (own.runnerUp && sameTeam(country, own.runnerUp.name)) only = "runnerUp";
  }

  const branches = [];
  if (only === null || only === "win") {
    branches.push(
      <ProjBranch
        key="win"
        title={
          only ? `${country} won Group ${proj.group}` : `If ${country} win Group ${proj.group}`
        }
        rounds={visible(proj.win).map(narrow)}
      />
    );
  }
  if (only === null || only === "runnerUp") {
    branches.push(
      <ProjBranch
        key="ru"
        title={
          only
            ? `${country} finished 2nd in Group ${proj.group}`
            : `If they finish 2nd in Group ${proj.group}`
        }
        rounds={visible(proj.runnerUp).map(narrow)}
      />
    );
  }

  return (
    <div className="road-proj">
      <div className="road-proj-head">
        Who they could face
        <span>
          {" "}
          &middot; projected by seeding; real opponents fill in as groups finish
          and knockout games are played
        </span>
      </div>
      <div className={`road-proj-branches${branches.length === 1 ? " is-single" : ""}`}>
        {branches}
      </div>
    </div>
  );
}
