"use client";

import { useEffect } from "react";
import { animateScrollTo } from "@/lib/scroll-config";

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
      animateScrollTo(window.scrollY, targetY);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
