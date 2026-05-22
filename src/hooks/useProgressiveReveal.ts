import { RefObject, useEffect } from "react";
import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_DURATION_MS,
  REVEAL_EASING,
  REVEAL_OFFSET_PX,
  REVEAL_RESCAN_LONG_MS,
  REVEAL_RESCAN_SHORT_MS,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
import { revealElement } from "@/lib/reveal-helpers";

export interface ProgressiveRevealOptions {
  bottomBufferPx?: number;
  sideBufferPx?: number;
  durationMs?: number;
  offsetPx?: number;
  easing?: string;
}

const DEFAULT_OPTIONS: Required<ProgressiveRevealOptions> = {
  bottomBufferPx: REVEAL_BOTTOM_BUFFER_PX,
  sideBufferPx: REVEAL_SIDE_BUFFER_PX,
  durationMs: REVEAL_DURATION_MS,
  offsetPx: REVEAL_OFFSET_PX,
  easing: REVEAL_EASING,
};

function isWithinRevealRange(
  rect: DOMRect,
  options: Required<ProgressiveRevealOptions>
) {
  return (
    rect.top < window.innerHeight + options.bottomBufferPx &&
    rect.bottom > -options.bottomBufferPx &&
    rect.left < window.innerWidth + options.sideBufferPx &&
    rect.right > -options.sideBufferPx
  );
}

export function useProgressiveReveal(
  ref: RefObject<Element | null>,
  selector: string,
  options: ProgressiveRevealOptions = {}
) {
  const bottomBufferPx = options.bottomBufferPx ?? DEFAULT_OPTIONS.bottomBufferPx;
  const sideBufferPx = options.sideBufferPx ?? DEFAULT_OPTIONS.sideBufferPx;
  const durationMs = options.durationMs ?? DEFAULT_OPTIONS.durationMs;
  const offsetPx = options.offsetPx ?? DEFAULT_OPTIONS.offsetPx;
  const easing = options.easing ?? DEFAULT_OPTIONS.easing;

  /**
   * Use for teaser content that should feel scroll-aware, not for core gallery
   * tiles. Teasers can animate on viewport entry; galleries need a load-aware
   * path because late image/layout settlement on Safari previously caused hidden
   * content bugs.
   */
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const resolvedOptions = {
      bottomBufferPx,
      sideBufferPx,
      durationMs,
      offsetPx,
      easing,
    };
    const observerEntryBufferPx = Math.max(
      resolvedOptions.bottomBufferPx,
      resolvedOptions.offsetPx
    );
    const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (items.length === 0) return;

    const scanVisibleItems = () => {
      // Hydration and late card thumbnail sizing can shift teaser geometry
      // after first paint. Re-scanning lets near-viewport cards still animate
      // without ever hiding content if early geometry was incomplete.
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (isWithinRevealRange(rect, resolvedOptions)) {
          revealElement(item, resolvedOptions);
        }
      });
    };

    scanVisibleItems();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealElement(entry.target as HTMLElement, resolvedOptions);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0,
        // Trigger entry reveal while the card is still offscreen so the
        // existing no-late-flicker guard does not suppress the motion.
        rootMargin: `${observerEntryBufferPx}px ${resolvedOptions.sideBufferPx}px ${observerEntryBufferPx}px ${resolvedOptions.sideBufferPx}px`,
      }
    );

    items.forEach((item) => {
      if (item.dataset.revealAnimated === "true") return;
      observer.observe(item);
    });

    // Short delayed passes catch late layout stabilization from image decode
    // and static-export hydration without turning reveal into a correctness gate.
    const rescanTimeouts = [
      window.setTimeout(scanVisibleItems, REVEAL_RESCAN_SHORT_MS),
      window.setTimeout(scanVisibleItems, REVEAL_RESCAN_LONG_MS),
    ];

    window.addEventListener("load", scanVisibleItems);
    window.addEventListener("resize", scanVisibleItems);

    return () => {
      observer.disconnect();
      rescanTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener("load", scanVisibleItems);
      window.removeEventListener("resize", scanVisibleItems);
    };
  }, [ref, selector, bottomBufferPx, sideBufferPx, durationMs, offsetPx, easing]);
}
