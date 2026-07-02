"use client";

import { useState, useEffect } from "react";
import { getScoreboard, resolveNextOpponent } from "./espnNext";

// Caption for the lane's CURRENT knockout node: shows "vs <opponent>" as soon as
// ESPN sets the fixture — before the game is played + recorded in knockout[] — so
// the lane track stays in step with the projection panel below (both resolve the
// same next opponent). Renders the server-provided `fallback` (the round-date
// placeholder) until ESPN has a real opponent, so SSR + first client render match
// (no hydration mismatch) and any fetch error just keeps the fallback.
export default function RoadNextOpp({ country, fallback }) {
  const [opp, setOpp] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getScoreboard().then((sb) => {
      if (cancelled || !sb) return;
      const o = resolveNextOpponent(sb, country);
      if (o && !cancelled) setOpp(o.name);
    });
    return () => {
      cancelled = true;
    };
  }, [country]);
  return <>{opp ? `vs ${opp}` : fallback}</>;
}
