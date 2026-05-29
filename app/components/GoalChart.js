"use client";

import { useEffect, useRef, useState } from "react";

// Compact "goals by World Cup" bar chart for the career timeline. One bar per
// tournament, height proportional to goals scored; the 2026 entry (goals null)
// renders as a dashed "?" placeholder. Bars grow from zero when scrolled into
// view, mirroring the CountUp stat animation. Reduced-motion aware.
export default function GoalChart({ worldCups }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const startedRef = useRef(false);

  const scored = worldCups
    .filter((w) => w.goals != null)
    .map((w) => w.goals);
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
        const isFuture = wc.goals == null;
        const pct = isFuture ? 0 : (wc.goals / maxGoals) * 100;
        const height = !shown
          ? "0%"
          : isFuture
            ? "14%"
            : `${Math.max(pct, 5)}%`;
        return (
          <div className="goal-bar-col" key={wc.year}>
            <div className="goal-bar-value">{isFuture ? "?" : wc.goals}</div>
            <div className="goal-bar-track">
              <div
                className={`goal-bar-fill${isFuture ? " future" : ""}`}
                style={{ height }}
              />
            </div>
            <div className="goal-bar-year">{`'${String(wc.year).slice(2)}`}</div>
          </div>
        );
      })}
    </div>
  );
}
