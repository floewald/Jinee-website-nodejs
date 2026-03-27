"use client";

import { useEffect } from "react";
import { SCROLL_DURATION_MS } from "@/lib/scroll-config";

/** ease-in-out-quad */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Intercepts all in-page anchor-link clicks (href="#...") and
 * replaces the browser's native instant/smooth jump with a JS-driven
 * animation whose duration is set in src/lib/scroll-config.ts.
 *
 * Renders nothing — purely a behaviour hook added to the root layout.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Header height used as scroll offset (must match --anchor-offset in CSS)
    const OFFSET = 80;

    function animateScroll(from: number, to: number, duration: number) {
      const startTime = performance.now();

      function step(now: number) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutQuad(t);
        window.scrollTo(0, from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    function handleClick(e: MouseEvent) {
      const link = (e.target as Element).closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!link) return;

      const hash = link.getAttribute("href")!;
      const id = hash.slice(1);
      if (!id) return; // bare "#" → scroll to top

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const targetY =
        target.getBoundingClientRect().top + window.scrollY - OFFSET;
      animateScroll(window.scrollY, targetY, SCROLL_DURATION_MS);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
