"use client";

import { useState, useEffect } from "react";

// Live group standings for a legend's group. Renders the static `fallback`
// table (agent-maintained, in the HTML for SEO / no-JS / instant paint), then on
// mount fetches ESPN's free standings API (CORS: *, no key) and swaps to the
// CURRENT table. ESPN's standings only count COMPLETED games, so while a group
// match is in progress the table would otherwise ignore it (the bug: the top
// card shows "Argentina 2–0 Jordan, 51'" but the rank still reads P2). So we
// ALSO fetch the live scoreboard and fold any in-progress group match into the
// table provisionally — points/played/GD move with the live score, and the
// header flips to a red "LIVE" while a match is actually on. Any fetch/parse
// error keeps the last good table, so it can't break.

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

export default function LiveGroupTable({ group, country, fallback }) {
  const [table, setTable] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1. Standings — the base table (completed games only).
        const res = await fetch(
          "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings",
          { cache: "no-store" }
        );
        const j = await res.json();
        let grp = null;
        const walk = (n) => {
          if (!n || typeof n !== "object" || grp) return;
          if (n.name === "Group " + group && n.standings?.entries) grp = n;
          else for (const k in n) walk(n[k]);
        };
        walk(j);
        if (cancelled || !grp) return;
        const stat = (e, name) => {
          const s = (e.stats || []).find((x) => x.name === name);
          return s ? Number(s.value) : 0;
        };
        let teams = grp.standings.entries.map((e) => ({
          name: e.team?.displayName || "?",
          played: stat(e, "gamesPlayed"),
          points: stat(e, "points"),
          gd: stat(e, "pointDifferential"),
          rank: stat(e, "rank"),
        }));

        // 2. Scoreboard — fold in any IN-PROGRESS game in this group (the final
        // matchday plays both group games at once, so handle more than one).
        // Wrapped separately: if this fails we still show the completed-games
        // table, just without the live overlay.
        let liveGames = [];
        try {
          const day = (off) =>
            new Date(Date.now() + off * 864e5).toISOString().slice(0, 10).replace(/-/g, "");
          const sb = await fetch(
            "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=" +
              `${day(-1)}-${day(1)}`,
            { cache: "no-store" }
          ).then((r) => r.json());
          const names = teams.map((t) => t.name);
          for (const e of sb.events || []) {
            if (e.status?.type?.state !== "in") continue; // in-progress only
            const comps = e.competitions?.[0]?.competitors || [];
            if (comps.length !== 2) continue;
            const g = comps.map((c) => ({
              name: c.team?.displayName,
              score: Number(c.score) || 0,
            }));
            if (g.every((c) => names.some((gn) => sameTeam(gn, c.name)))) {
              liveGames.push(g);
            }
          }
        } catch {
          /* no live overlay this cycle */
        }

        const isLiveGame = liveGames.length > 0;
        if (isLiveGame) {
          // Provisionally apply each live game to its two teams.
          const adjust = (t, gf, ga) => ({
            ...t,
            played: t.played + 1,
            points: t.points + (gf > ga ? 3 : gf === ga ? 1 : 0),
            gd: t.gd + (gf - ga),
          });
          for (const [a, b] of liveGames) {
            teams = teams.map((t) => {
              if (sameTeam(t.name, a.name)) return adjust(t, a.score, b.score);
              if (sameTeam(t.name, b.name)) return adjust(t, b.score, a.score);
              return t;
            });
          }
          // ESPN's `rank` is computed from completed games only, so it can't be
          // trusted mid-match — provisionally re-sort by points then GD.
          teams.sort((a, b) => b.points - a.points || b.gd - a.gd);
        } else {
          // No live game → trust ESPN's tiebreak-aware rank (re-deriving pts→GD
          // ourselves silently inverts 2nd/3rd on a goals-scored tiebreak).
          teams.sort(
            (a, b) =>
              (a.rank || 99) - (b.rank || 99) || b.points - a.points || b.gd - a.gd
          );
        }
        if (teams.length && !cancelled) {
          setTable({ asOf: isLiveGame ? "livegame" : "live", teams });
        }
      } catch {
        /* keep the last good table (static fallback or a prior live read) */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [group]);

  if (!table?.teams?.length) return null;
  const livegame = table.asOf === "livegame"; // a group match is on now (provisional)
  const current = table.asOf === "live"; // up to date, no match in progress

  return (
    <div className="group-standings">
      <div className="group-standings-head">
        <span>Group {group} standings</span>
        <span
          className={`group-standings-asof${
            livegame ? " is-livegame" : current ? " is-live" : ""
          }`}
        >
          {livegame || current ? (
            <span className="gs-live-dot" aria-hidden="true" />
          ) : null}
          {livegame ? "LIVE" : current ? "current" : `as of ${table.asOf}`}
        </span>
      </div>
      <ol className="group-standings-list">
        <li className="group-standings-row is-header" aria-hidden="true">
          <span className="gs-pos" />
          <span className="gs-team">Team</span>
          <span className="gs-num">P</span>
          <span className="gs-num">Pts</span>
        </li>
        {table.teams.map((t, i) => {
          const isLegend = sameTeam(t.name, country);
          return (
            <li
              key={t.name}
              className={`group-standings-row${isLegend ? " is-legend" : ""}${
                i < 2 ? " is-advancing" : ""
              }`}
            >
              <span className="gs-pos">{i + 1}</span>
              <span className="gs-team">{t.name}</span>
              <span className="gs-num">{t.played}</span>
              <span className="gs-num gs-pts">{t.points}</span>
            </li>
          );
        })}
      </ol>
      <p className="group-standings-foot">
        {livegame ? "Provisional — the live match is included. " : ""}Top 2 advance
        &middot; best third-place sides also qualify
      </p>
    </div>
  );
}
