"use client";

import { useEffect } from "react";

/**
 * Removes duplicate JSON-LD <script> tags on mount.
 *
 * React 19 re-inserts inline `<script type="application/ld+json">` during client
 * hydration on production, leaving two identical copies in the live DOM (Google's
 * Rich Results Test flagged this as "Duplicate field FAQPage"). This component
 * renders NOTHING — so it can never cause a hydration mismatch itself — and on
 * mount it removes every ld+json script whose content it has already seen,
 * keeping exactly one of each.
 */
export default function JsonLdDedupe() {
  useEffect(() => {
    const seen = new Set();
    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((el) => {
        const key = el.textContent;
        if (seen.has(key)) el.remove();
        else seen.add(key);
      });
  }, []);

  return null;
}
