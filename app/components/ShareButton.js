"use client";

import { useState } from "react";

// Small share control for the /status hub. Uses the Web Share API on mobile
// (native share sheet → the OG card does the selling) and falls back to
// copy-to-clipboard on desktop. Renders a stable label until interaction, so
// it's hydration-safe.
export default function ShareButton({
  url,
  title,
  text,
  label = "Share who's still standing →",
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — no-op
    }
  }

  return (
    <button type="button" className="status-share-btn" onClick={onShare}>
      {copied ? "Link copied ✓" : label}
    </button>
  );
}
