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

    scrollToHash();
    const t = window.setTimeout(scrollToHash, 100);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    const onHashChange = () => scrollToHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  return null;
}
