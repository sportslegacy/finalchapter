"use client";

import { useEffect, useRef, useState } from "react";

// Compact "goals by World Cup" bar chart for the career timeline. One bar per
// tournament, height proportional to goals scored. The 2026 entry uses the LIVE
// tally (`soFar`) once games are played — a real bar with a dashed OPEN TOP to
// signal it's still growing; before kickoff (soFar null) it's the dashed "?"
// placeholder. Bars grow from zero when scrolled into view. Reduced-motion aware.
export default function GoalChart({ worldCups, soFar = null }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const startedRef = useRef(false);

  // Goals for a tournament — the 2026 entry pulls from the live tally.
  const goalsFor = (wc) => (wc.year === 2026 ? soFar : wc.goals);
  const scored = worldCups.map(goalsFor).filter((g) => g != null);
  const maxGoals = Math.max(...scored, 1);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const node = ref.current;
    if (prefersReduced || !node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            setShown(true);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="goal-chart" ref={ref} aria-hidden="true">
      {worldCups.map((wc) => {
        const g = goalsFor(wc);
        const placeholder = g == null; // 2026 before any game (soFar null)
        const soFarBar = wc.year === 2026 && !placeholder; // live, in-progress
        const pct = placeholder ? 0 : (g / maxGoals) * 100;
        const height = !shown
          ? "0%"
          : placeholder
            ? "14%"
            : `${Math.max(pct, 5)}%`;
        return (
          <div className="goal-bar-col" key={wc.year}>
            <div className="goal-bar-value">{placeholder ? "?" : g}</div>
            <div className="goal-bar-track">
              <div
                className={`goal-bar-fill${placeholder ? " future" : soFarBar ? " sofar" : ""}`}
                style={{ height }}
              />
            </div>
            <div className="goal-bar-year">
              {`'${String(wc.year).slice(2)}`}
              {soFarBar ? <span className="goal-bar-sofar"> so far</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
