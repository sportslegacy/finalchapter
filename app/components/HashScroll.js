"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHash() {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    if (!window.location.hash) return;

    // Retry across a longer window: when arriving from a player page the
    // homepage mounts with a tall hero + still-loading images, so a single
    // early scroll lands short (or Next's scroll-to-top overrides it). Re-run
    // as layout settles so we end on the target section, not the page top.
    const delays = [0, 80, 200, 400, 700, 1000];
    const timers = delays.map((d) => window.setTimeout(scrollToHash, d));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    const onHashChange = () => scrollToHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  return null;
}
