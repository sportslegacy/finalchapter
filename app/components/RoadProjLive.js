"use client";

import { useState, useEffect } from "react";
import { tournament } from "../../data/players";

// The "Who they could face" projection panel on /road-to-the-final. It ships
// server-rendered as a pot-SEEDING projection (every team of a single group as a
// possible R32 opponent; the top/2nd seed for later-round group slots). Then on
// mount it fetches ESPN's free standings API (CORS:*, no key — same source as
// LiveGroupTable) and, for any group that has ACTUALLY FINISHED, narrows the
// chips to the real qualifier (winner / runner-up by ESPN's tiebreak-aware
// rank). So once Group H is decided, "Runner-up · Group H" stops showing all
// four teams and shows the one real side. Any fetch/parse error keeps the static
// projection — it can never break the page.

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

// our group letter → [{ name, flag }] (so a resolved qualifier keeps our flag).
const GROUP_TEAMS = {};
for (const g of tournament.groups) {
  GROUP_TEAMS[g.id] = g.teams.map((t) => ({ name: t.name, flag: t.flag }));
}

// Shared standings cache (60s) so the up-to-5 lanes share ONE ESPN request.
let _cache = { at: 0, data: null, inflight: null };
function getStandings() {
  const now = Date.now();
  if (_cache.data && now - _cache.at < 60000) return Promise.resolve(_cache.data);
  if (_cache.inflight) return _cache.inflight;
  _cache.inflight = fetch(
    "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings",
    { cache: "no-store" }
  )
    .then((r) => r.json())
    .then((j) => {
      _cache = { at: Date.now(), data: j, inflight: null };
      return j;
    })
    .catch(() => {
      _cache.inflight = null;
      return null;
    });
  return _cache.inflight;
}

// Walk the standings JSON → { letter: { complete, winner, runnerUp } }, where
// winner/runnerUp are OUR { name, flag, grp } (matched from ESPN's rank order).
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
    const toOurs = (espnName) => {
      const ours = (GROUP_TEAMS[letter] || []).find((t) => sameTeam(t.name, espnName));
      return ours
        ? { name: ours.name, flag: ours.flag, grp: letter }
        : { name: espnName, flag: "", grp: letter };
    };
    out[letter] = {
      complete,
      winner: entries[0] ? toOurs(entries[0].name) : null,
      runnerUp: entries[1] ? toOurs(entries[1].name) : null,
    };
  }
  return out;
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
                <span className="proj-round-seed">
                  {r.stage === "r32" ? r.posLabel : r.primaryPos}
                </span>
                {` · Group ${
                  r.stage === "r32" ? r.groups.join("/") : r.primaryGroups.join("/")
                }`}
                {r.hasThirds ? (
                  <span className="proj-or3rd">or a 3rd-place side</span>
                ) : null}
              </span>
              <span className="proj-teams">
                {r.teams.map((t, i) => (
                  <span
                    key={`${t.grp}-${i}`}
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

export default function RoadProjLive({ proj, country }) {
  const [resolved, setResolved] = useState(null); // letter → {complete, winner, runnerUp}

  useEffect(() => {
    let cancelled = false;
    getStandings().then((j) => {
      if (cancelled || !j) return;
      try {
        setResolved(resolveGroups(j));
      } catch {
        /* keep the static projection */
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Replace projected chips with the real qualifier wherever a group is decided.
  const narrow = (round) => {
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
    // Later rounds: per-group seed → actual qualifier (winner/runner-up) where
    // that group is decided; keep the seed for groups still in progress.
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

  return (
    <div className="road-proj">
      <div className="road-proj-head">
        Who they could face
        <span>
          {" "}
          &middot; projected by seeding; the real qualifiers fill in as each group
          finishes
        </span>
      </div>
      <div className="road-proj-branches">
        <ProjBranch
          title={`If ${country} win Group ${proj.group}`}
          rounds={proj.win.map(narrow)}
        />
        <ProjBranch
          title={`If they finish 2nd in Group ${proj.group}`}
          rounds={proj.runnerUp.map(narrow)}
        />
      </div>
    </div>
  );
}
