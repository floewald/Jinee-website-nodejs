import { RefObject, useEffect } from "react";
import {
  applyRevealProgress,
  settleScrollLinkedReveal,
} from "@/lib/reveal-helpers";
import { getRevealProgressFromRect } from "@/lib/reveal-progress";
import { shouldSettleImmediatelyFromElement } from "@/lib/reveal-state";

interface ScrollLinkedRevealOptions {
  entryOffsetPx?: number;
  settleOffsetPx?: number;
  offsetPx?: number;
  startOpacity?: number;
}

export function useScrollLinkedReveal(
  ref: RefObject<Element | null>,
  selector: string,
  options: ScrollLinkedRevealOptions = {}
) {
  const entryOffsetPx = options.entryOffsetPx ?? 120;
  const settleOffsetPx = options.settleOffsetPx ?? 24;
  const offsetPx = options.offsetPx ?? 32;
  const startOpacity = options.startOpacity ?? 0.2;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (items.length === 0) return;

    const active = new Set<HTMLElement>();
    let rafId = 0;

    const tick = () => {
      active.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const progress = getRevealProgressFromRect({
          top: rect.top,
          bottom: rect.bottom,
          viewportHeight: window.innerHeight,
          entryOffsetPx,
          settleOffsetPx,
        });

        applyRevealProgress(item, progress, offsetPx, startOpacity);

        if (progress >= 1 || shouldSettleImmediatelyFromElement(item)) {
          settleScrollLinkedReveal(item);
          active.delete(item);
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
  }, [ref, selector, entryOffsetPx, settleOffsetPx, offsetPx, startOpacity]);
}
