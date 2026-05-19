import { RefObject, useEffect } from "react";
import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_DURATION_MS,
  REVEAL_EASING,
  REVEAL_OFFSET_PX,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
import { animateRevealElement } from "@/lib/reveal-helpers";

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
    const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (items.length === 0) return;

    const scanVisibleItems = () => {
      items.forEach((item) => {
        if (isWithinRevealRange(item.getBoundingClientRect(), resolvedOptions)) {
          animateRevealElement(item, resolvedOptions);
        }
      });
    };

    scanVisibleItems();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateRevealElement(entry.target as HTMLElement, resolvedOptions);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0,
        rootMargin: `0px ${resolvedOptions.sideBufferPx}px ${resolvedOptions.bottomBufferPx}px ${resolvedOptions.sideBufferPx}px`,
      }
    );

    items.forEach((item) => {
      if (item.dataset.revealAnimated === "true") return;
      observer.observe(item);
    });

    const rescanTimeouts = [
      window.setTimeout(scanVisibleItems, 180),
      window.setTimeout(scanVisibleItems, 600),
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
