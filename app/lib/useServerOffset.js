"use client";

import { useState, useEffect } from "react";

// Countdowns must not trust the visitor's device clock for an absolute time —
// a phone whose clock is wrong (we saw one ~2h behind real time) makes the
// countdown read hours off. This hook fetches the server's real UTC once on
// mount (from the HTTP `date` response header) and returns the offset in ms to
// ADD to the device clock: offset = serverNow - deviceNow. Components compute
// `kickoff - (Date.now() + offset)` so the countdown is correct regardless of
// the device clock. Falls back to 0 (device clock) if the probe fails — never
// worse than before.
export function useServerOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t0 = Date.now();
        // Same-origin HEAD, no-store -> a fresh response whose `date` header is
        // the server's current UTC. CDNs set `date` to serve-time even on cache
        // hits, so this works on our static deploy.
        const res = await fetch("/", { method: "HEAD", cache: "no-store" });
        const t1 = Date.now();
        const header = res.headers.get("date");
        const serverMs = header ? new Date(header).getTime() : NaN;
        if (cancelled || Number.isNaN(serverMs)) return;
        // Best estimate of the device clock at the instant the server stamped
        // the response: midpoint of the round trip.
        const deviceMidFlight = t0 + (t1 - t0) / 2;
        const next = serverMs - deviceMidFlight;
        // The `date` header is second-resolution, so |offset| < 2s is just
        // rounding noise — treat as 0 to avoid a pointless 1s correction.
        if (!cancelled) setOffset(Math.abs(next) < 2000 ? 0 : next);
      } catch {
        /* network/probe failed — keep offset 0, i.e. the device clock */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return offset;
}
