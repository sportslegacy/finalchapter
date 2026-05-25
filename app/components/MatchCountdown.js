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

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

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
