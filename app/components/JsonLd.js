"use client";

import { useEffect } from "react";

/**
 * Renders a JSON-LD <script> exactly once.
 *
 * The script IS server-rendered (it ships in the static HTML, which crawlers read
 * on first pass). The problem this solves: on production, React 19 re-inserts the
 * inline `<script type="application/ld+json">` during client hydration, leaving a
 * DUPLICATE node in the live DOM — Google's Rich Results Test flagged this as
 * "Duplicate field FAQPage". The duplication did not reproduce on a local build, so
 * a source-only change wasn't enough.
 *
 * Fix: tag each script with a stable `data-jsonld` id and, on mount, remove every
 * copy past the first. Result — present in SSR HTML, exactly one node after hydration.
 */
export default function JsonLd({ id, data }) {
  const json = data ? JSON.stringify(data) : null;

  useEffect(() => {
    if (!json) return;
    const tags = document.querySelectorAll(`script[data-jsonld="${id}"]`);
    for (let i = 1; i < tags.length; i += 1) tags[i].remove();
  }, [id, json]);

  if (!json) return null;

  return (
    <script
      type="application/ld+json"
      data-jsonld={id}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
