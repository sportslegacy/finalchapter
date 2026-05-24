"use client";

import { useState, useEffect } from "react";
import { tournament } from "../../data/players";

const KICKOFF = new Date(tournament.openingMatch.kickoffUtc);

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = KICKOFF - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-bar">
      <div className="countdown-inner">
        <span className="countdown-label">
          Until opening match · {tournament.openingMatch.teams}
        </span>
        <div className="countdown-units">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="countdown-unit">
              <div className="countdown-value">
                {String(value).padStart(2, "0")}
              </div>
              <div className="countdown-unit-label">{unit}</div>
            </div>
          ))}
        </div>
        <span className="countdown-meta">
          11 June 2026 · 13:00 Mexico City (15:00 ET)
        </span>
      </div>
    </div>
  );
}
