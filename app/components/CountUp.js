"use client";

import { useEffect, useRef, useState } from "react";

// Animated count-up for the big profile stat numbers. Counts from 0 to
// `value` once the element scrolls into view. Respects reduced-motion and
// degrades to the final number if IntersectionObserver isn't available.
export default function CountUp({ value, className, duration = 900 }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || target === 0) {
      setDisplay(target);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setDisplay(target);
      return;
    }

    setDisplay(0);

    let raf;
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(eased * target));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            run();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <div ref={ref} className={className}>
      {display}
    </div>
  );
}
