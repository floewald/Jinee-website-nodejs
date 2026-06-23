import { RefObject, useEffect } from "react";
import {
  applyRevealProgress,
  settleScrollLinkedReveal,
} from "@/lib/reveal-helpers";
import {
  REVEAL_OFFSET_PX,
  REVEAL_PROGRESS_ENTRY_OFFSET_PX,
  REVEAL_PROGRESS_SETTLE_OFFSET_PX,
  REVEAL_START_OPACITY,
} from "@/lib/reveal-config";
import { getRevealProgressFromRect } from "@/lib/reveal-progress";
import {
  getRevealState,
  shouldSettleImmediatelyFromElement,
} from "@/lib/reveal-state";

interface ScrollLinkedRevealOptions {
  entryOffsetPx?: number;
  settleOffsetPx?: number;
  offsetPx?: number;
  startOpacity?: number;
  resetKey?: string;
}

export function useScrollLinkedReveal(
  ref: RefObject<Element | null>,
  selector: string,
  options: ScrollLinkedRevealOptions = {}
) {
  const entryOffsetPx = options.entryOffsetPx ?? REVEAL_PROGRESS_ENTRY_OFFSET_PX;
  const settleOffsetPx = options.settleOffsetPx ?? REVEAL_PROGRESS_SETTLE_OFFSET_PX;
  const offsetPx = options.offsetPx ?? REVEAL_OFFSET_PX;
  const startOpacity = options.startOpacity ?? REVEAL_START_OPACITY;
  const resetKey = options.resetKey;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(selector))
      .filter((item) => getRevealState(item) === "eligible");
    if (items.length === 0) return;

    const active = new Set<HTMLElement>();
    let rafId = 0;

    const tick = () => {
      active.forEach((item) => {
        if (getRevealState(item) !== "eligible") {
          active.delete(item);
          observer.unobserve(item);
          return;
        }

        const rect = item.getBoundingClientRect();
        const progress = getRevealProgressFromRect({
          top: rect.top,
          bottom: rect.bottom,
          viewportHeight: window.innerHeight,
          entryOffsetPx,
          settleOffsetPx,
        });

        applyRevealProgress(item, progress, offsetPx, startOpacity);

        if (progress >= 1) {
          settleScrollLinkedReveal(item);
          active.delete(item);
          observer.unobserve(item);
        }
      });
    };

    const scheduleTick = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        tick();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = entry.target as HTMLElement;

          if (getRevealState(item) !== "eligible") {
            active.delete(item);
            observer.unobserve(item);
            return;
          }

          if (shouldSettleImmediatelyFromElement(item)) {
            settleScrollLinkedReveal(item);
            active.delete(item);
            observer.unobserve(item);
            return;
          }

          if (entry.isIntersecting) {
            active.add(item);
            scheduleTick();
            return;
          }

          active.delete(item);
        });
      },
      {
        threshold: 0,
        rootMargin: `${entryOffsetPx}px 48px ${entryOffsetPx}px 48px`,
      }
    );

    items.forEach((item) => observer.observe(item));
    window.addEventListener("scroll", scheduleTick, { passive: true });
    window.addEventListener("resize", scheduleTick);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      window.removeEventListener("scroll", scheduleTick);
      window.removeEventListener("resize", scheduleTick);
    };
  }, [ref, selector, entryOffsetPx, settleOffsetPx, offsetPx, startOpacity, resetKey]);
}
