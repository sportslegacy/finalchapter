"use client";

import { useState, useEffect } from "react";

// Renders a human "X ago" for an ISO timestamp. Mounted-gated: the server
// render + first client render both show the plain date (deterministic, so no
// React #418), then it swaps to a live relative time after mount. Used for the
// "results auto-updated" freshness line on /status.
export default function AgoTime({ iso }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const t = new Date(iso).getTime();
  if (now === null || Number.isNaN(t)) {
    return <>{iso.slice(0, 16).replace("T", " ")} UTC</>;
  }

  const min = Math.max(0, Math.round((now - t) / 60000));
  const rel =
    min < 1 ? "just now"
    : min < 60 ? `${min} min ago`
    : min < 1440 ? `${Math.round(min / 60)}h ago`
    : `${Math.round(min / 1440)}d ago`;

  return <span title={new Date(iso).toUTCString()}>{rel}</span>;
}
