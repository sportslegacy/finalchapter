"use client";

import { useState, useEffect } from "react";

// Live in-match score for a legend's CURRENT game, polled client-side from
// ESPN's free public scoreboard API (CORS: *, no key). Shows nothing until a
// match is actually in progress, then a live score + clock; at full time it
// shows the FT score until our agent records the authoritative result (with
// scorers etc.) ~10 min later — at which point the card shows that instead and
// this unmounts. Any fetch/parse error just renders null (card falls back to
// date/venue), so a broken/changed ESPN API can never break the page.

// Loose team-name match across our data <-> ESPN ("DR Congo" vs "Congo DR" etc.)
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

// ESPN dates by US Eastern, so a late-UTC kickoff lands on the previous ET day.
// Query the kickoff UTC date AND the day before as a range to always include it.
function espnDateRange(kickoffUtc) {
  const k = new Date(kickoffUtc).getTime();
  const day = (ms) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, "");
  return `${day(k - 86400000)}-${day(k)}`;
}

export default function LiveScore({ match, country }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!match?.kickoffUtc) return undefined;
    // Only poll around the match window (generous, to tolerate a skewed device
    // clock); ESPN's own status decides what actually renders.
    const ko = new Date(match.kickoffUtc).getTime();
    const now = Date.now();
    if (now < ko - 30 * 60000 || now > ko + 200 * 60000) return undefined;

    let cancelled = false;
    async function poll() {
      try {
        const url =
          "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=" +
          espnDateRange(match.kickoffUtc);
        const res = await fetch(url, { cache: "no-store" });
        const j = await res.json();
        const ev = (j.events || []).find((e) => {
          const names = (e.competitions?.[0]?.competitors || []).map(
            (c) => c.team?.displayName
          );
          return (
            names.some((n) => sameTeam(n, country)) &&
            names.some((n) => sameTeam(n, match.opponent))
          );
        });
        if (cancelled) return;
        const st = ev?.competitions?.[0] ? ev.status?.type || {} : {};
        if (!ev || st.state === "pre") {
          setInfo(null);
          return;
        }
        const comp = ev.competitions[0];
        const mine = comp.competitors.find((c) => sameTeam(c.team?.displayName, country));
        const opp = comp.competitors.find((c) => !sameTeam(c.team?.displayName, country));
        setInfo({
          live: st.state === "in",
          detail: st.shortDetail || ev.status?.displayClock || "",
          mine: Number(mine?.score ?? 0),
          opp: Number(opp?.score ?? 0),
        });
      } catch {
        /* leave prior state; card still shows date/venue */
      }
    }
    poll();
    const id = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [match?.kickoffUtc, match?.opponent, country]);

  if (!info) return null;
  return (
    <div className={`live-score${info.live ? " is-live" : ""}`}>
      <span className="live-score-tag">
        {info.live ? <span className="live-dot" aria-hidden="true" /> : null}
        {info.live ? `LIVE · ${info.detail}` : "FT"}
      </span>
      <span className="live-score-line">
        {country}{" "}
        <strong>
          {info.mine}&ndash;{info.opp}
        </strong>{" "}
        {match.opponent}
      </span>
    </div>
  );
}
