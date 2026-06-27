"use client";

import { useState, useEffect } from "react";

// Live group standings for a legend's group. Renders the static `fallback`
// table (agent-maintained, in the HTML for SEO / no-JS / instant paint), then
// on mount fetches ESPN's free standings API (CORS: *, no key) and updates to
// the CURRENT table — so the standing is never stale between the legend's own
// matches. Any fetch/parse error keeps the fallback, so it can't break.

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
        const teams = grp.standings.entries
          .map((e) => ({
            name: e.team?.displayName || "?",
            played: stat(e, "gamesPlayed"),
            points: stat(e, "points"),
            gd: stat(e, "pointDifferential"),
            rank: stat(e, "rank"),
          }))
          // ESPN's `rank` already encodes the full FIFA tiebreaker chain
          // (pts → GD → goals scored → head-to-head → fair play → draw of lots),
          // so trust it for ordering and keep pts/GD only as a fallback if rank
          // is ever missing. Re-deriving pts→GD ourselves silently inverts
          // 2nd/3rd (and the "advancing" marker) on a goals-scored tiebreak —
          // exactly the tense final-round case visitors open the page to check.
          .sort(
            (a, b) =>
              (a.rank || 99) - (b.rank || 99) ||
              b.points - a.points ||
              b.gd - a.gd
          );
        if (teams.length && !cancelled) setTable({ asOf: "live", teams });
      } catch {
        /* keep the static fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [group]);

  if (!table?.teams?.length) return null;
  const live = table.asOf === "live";

  return (
    <div className="group-standings">
      <div className="group-standings-head">
        <span>Group {group} standings</span>
        <span className={`group-standings-asof${live ? " is-live" : ""}`}>
          {live ? <span className="gs-live-dot" aria-hidden="true" /> : null}
          {live ? "current" : `as of ${table.asOf}`}
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
        Top 2 advance &middot; best third-place sides also qualify
      </p>
    </div>
  );
}
