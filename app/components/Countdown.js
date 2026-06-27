"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { players } from "../../data/players";
import { useServerOffset } from "../lib/useServerOffset";
import LiveNow from "./LiveNow";

// Pre-tournament this bar counted down to the opening match. Now that the
// tournament is live it counts down to the NEXT LEGEND MATCH: the earliest
// unplayed group game (no `result`) across all five players. Result-driven,
// not clock-driven — the same post-match result edit that updates the
// schedule cards advances this bar on the next deploy, and build HTML always
// matches the client's first hydration pass (no React #418).
//
// Three states:
//   1. upcoming  -> ticking countdown to the next legend kickoff
//   2. kicked off (client clock passes target before the result is pushed)
//      -> "underway" line linking /status   [mounted-gate: post-hydration only]
//   3. all group games have results (knockouts) -> road-to-the-final line
function nextLegendMatch() {
  let best = null;
  for (const p of players) {
    const m = p.wc2026.matches.find((x) => !x.result && x.kickoffUtc);
    if (m && (!best || new Date(m.kickoffUtc) < new Date(best.m.kickoffUtc))) {
      best = { p, m };
    }
  }
  return best;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// Format "2026-06-13" without Date() so no timezone can shift the day.
function fmtDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export default function Countdown() {
  const next = nextLegendMatch();
  const target = next ? new Date(next.m.kickoffUtc) : null;
  // Correct for a wrong device clock by anchoring "now" to the server's time.
  const offset = useServerOffset();

  function getTimeLeft() {
    if (!target) return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = target - (Date.now() + offset);
    if (diff <= 0) return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      ended: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft());
  // The structural swap to the "underway" view must only happen after mount —
  // the first client render has to match the build-time HTML structure.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setTimeLeft(getTimeLeft());
    tick(); // recompute immediately on mount
    const timer = setInterval(tick, 1000);
    // Mobile browsers (iOS Safari especially) suspend a backgrounded tab's
    // setInterval and can restore the page from bfcache with a FROZEN value —
    // so the countdown would show a stale time until the timer resumes. Force
    // a recompute the moment the page becomes visible again, and on bfcache
    // restore (pageshow), so it always self-corrects to real time.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", tick);
    };
    // Re-run when the server offset arrives so the displayed time immediately
    // jumps to the corrected value.
  }, [offset]);

  // All group games played — knockout rounds in progress.
  if (!next) {
    return (
      <div className="countdown-bar">
        <div className="countdown-inner">
          <span className="countdown-label">The knockout rounds are underway</span>
          <span className="countdown-meta">
            <Link href="/road-to-the-final">Follow the road to the final →</Link>
          </span>
        </div>
      </div>
    );
  }

  const matchup = `${next.p.country} vs ${next.m.opponent}`;

  // Kickoff has passed but the result isn't in the data yet — match underway.
  // Show the live score (polled from ESPN) right in the hero; if ESPN has no
  // live data yet (client clock slightly ahead of real kickoff) LiveNow
  // renders null and the label + link carry it.
  if (mounted && timeLeft.ended) {
    return (
      <div className="countdown-bar">
        <div className="countdown-inner">
          <span className="countdown-label">
            {next.p.countryFlag} {matchup} · underway
          </span>
          <LiveNow country={next.p.country} showFinal />
          <span className="countdown-meta">
            <Link href="/status">See who&apos;s still standing →</Link>
          </span>
        </div>
      </div>
    );
  }

  const { ended, ...units } = timeLeft;

  return (
    <div className="countdown-bar">
      <div className="countdown-inner">
        <span className="countdown-label">
          Next legend in action · {next.p.countryFlag} {matchup}
        </span>
        <div className="countdown-units">
          {Object.entries(units).map(([unit, value]) => (
            <div key={unit} className="countdown-unit">
              {/* Show a placeholder until the client computes the value. The
                  page is statically generated + edge-cached, so baking a real
                  number into the HTML means every refresh briefly shows that
                  STALE build-time value (a "larger number" that then ticks
                  down). Rendering "--" on the server + first client render
                  keeps them identical (no hydration mismatch) and guarantees
                  the digits a visitor sees are always live, never cached. */}
              <div className="countdown-value">
                {mounted ? String(value).padStart(2, "0") : "--"}
              </div>
              <div className="countdown-unit-label">{unit}</div>
            </div>
          ))}
        </div>
        <span className="countdown-meta">
          {fmtDate(next.m.date)} · {next.m.time} · {next.m.venue}
        </span>
      </div>
    </div>
  );
}
