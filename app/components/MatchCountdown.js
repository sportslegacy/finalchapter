"use client";

import { useEffect, useState } from "react";

// Compact countdown shown above each player's group schedule.
// Different from the sitewide <Countdown/> in two ways:
//   - small, inline-flavored (no big day/hour/minute/second tiles)
//   - handles TBD kickoff times (date-only countdown)
// Updates once per minute — no need for second-by-second ticking here.

export default function MatchCountdown({ match, country }) {
  const target = match.kickoffUtc
    ? new Date(match.kickoffUtc)
    : // For TBD kickoffs we still want a rough "X days until match day".
      // Anchor on the date at 00:00 ET (4 AM UTC) — a neutral mid-night.
      new Date(match.date + "T04:00:00.000Z");

  // Start as null so the server render and the first client render match
  // (rendering a time-relative string on both would mismatch -> React #418).
  const [now, setNow] = useState(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    // iOS Safari suspends background-tab timers / restores from bfcache with a
    // frozen value — recompute the instant the page is visible again so the
    // countdown never shows a stale time (same fix as the hero Countdown).
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", tick);
    };
  }, []);

  // Stable placeholder until mounted: team names only, no ticking value.
  if (now === null) {
    return (
      <div className="match-countdown">
        <span className="match-countdown-label">Next up</span>
        <span className="match-countdown-value">
          <strong>
            {country} vs {match.opponent}
          </strong>
        </span>
      </div>
    );
  }

  const diffMs = target - now;

  if (diffMs <= 0) {
    return (
      <div className="match-countdown">
        <span className="match-countdown-label">Next up</span>
        <span className="match-countdown-value">
          {country} vs {match.opponent} — in progress or completed
        </span>
      </div>
    );
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  // Different copy depending on whether time is confirmed
  const timeKnown = Boolean(match.kickoffUtc);

  const pieces = [];
  if (days > 0) pieces.push(`${days}d`);
  if (hours > 0 || days > 0) pieces.push(`${hours}h`);
  if (timeKnown) pieces.push(`${minutes}m`);

  return (
    <div className="match-countdown">
      <span className="match-countdown-label">Next up</span>
      <span className="match-countdown-value">
        <strong>
          {country} vs {match.opponent}
        </strong>
        <span className="match-countdown-sep">·</span>
        <span className="match-countdown-time">
          in {pieces.join(" ")}
          {!timeKnown ? " (kickoff TBD)" : ""}
        </span>
      </span>
    </div>
  );
}
