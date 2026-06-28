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

    // Reduced-motion users keep the fail-open default (CSS `--reveal-opacity`
    // resolves to 1): content is fully visible and static, no scroll-linked
    // motion is ever applied.
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const initialItems = Array.from(root.querySelectorAll<HTMLElement>(selector))
      .filter((item) => getRevealState(item) === "eligible");
    if (initialItems.length === 0) return;

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

    const observeItem = (item: HTMLElement) => {
      // `observe` is idempotent, so re-observing a surviving node is safe.
      if (getRevealState(item) === "eligible") {
        observer.observe(item);
      }
    };

    const observeWithin = (node: Node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches(selector)) observeItem(node);
      node
        .querySelectorAll<HTMLElement>(selector)
        .forEach((item) => observeItem(item));
    };

    initialItems.forEach(observeItem);

    // Layout libraries such as react-masonry-css render the default column
    // count first, then recreate (not just reorder) tiles when they recalculate
    // columns for the real viewport on mount. Tiles created by that second pass
    // are brand-new DOM nodes that the initial `observe` pass never saw, so they
    // would never reveal. Watch the subtree and observe any eligible tile that
    // appears later. Fail-open: if MutationObserver is unavailable the base CSS
    // still resolves `--reveal-opacity` to 1.
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver === "function") {
      mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach(observeWithin);
        });
      });
      mutationObserver.observe(root, { childList: true, subtree: true });
    }

    window.addEventListener("scroll", scheduleTick, { passive: true });
    window.addEventListener("resize", scheduleTick);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("scroll", scheduleTick);
      window.removeEventListener("resize", scheduleTick);
    };
  }, [ref, selector, entryOffsetPx, settleOffsetPx, offsetPx, startOpacity, resetKey]);
}
