import { RefObject, useEffect } from "react";
import {
  applyBidirectionalRevealProgress,
  applyRevealProgress,
  REVEAL_LAYOUT_INVALIDATED_EVENT,
  settleScrollLinkedReveal,
} from "@/lib/reveal-helpers";
import {
  clearRevealDebugSnapshot,
  isRevealDebugEnabled,
  setRevealDebugSnapshot,
} from "@/lib/reveal-debug";
import {
  REVEAL_OFFSET_PX,
  REVEAL_PROGRESS_ENTRY_OFFSET_PX,
  REVEAL_PROGRESS_SETTLE_OFFSET_PX,
  REVEAL_START_OPACITY,
} from "@/lib/reveal-config";
import {
  getRevealExitProgressFromTop,
  getRevealProgressFromRect,
  isInRevealExitBand,
} from "@/lib/reveal-progress";
import {
  getRevealLayoutMetrics,
  getRevealState,
  isActuallyVisibleInViewport,
  shouldSettleImmediatelyFromElement,
} from "@/lib/reveal-state";

interface ScrollLinkedRevealOptions {
  entryOffsetPx?: number;
  settleOffsetPx?: number;
  offsetPx?: number;
  startOpacity?: number;
  exitGateMode?: "top" | "top-and-visible-ratio";
  exitStartPx?: number;
  exitRangePx?: number;
  exitOffsetPx?: number;
  exitEndOpacity?: number;
  exitMaskMaxStartPercent?: number;
  exitHysteresisPx?: number;
  exitVisibleRatioThreshold?: number;
  exitVisibleRatioThresholdPortrait?: number;
  exitVisibleRatioThresholdLandscape?: number;
  exitVisibleRatioHysteresis?: number;
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
  const exitGateMode = options.exitGateMode ?? "top-and-visible-ratio";
  const exitStartPx = options.exitStartPx;
  const exitRangePx = options.exitRangePx ?? 0;
  const exitOffsetPx = options.exitOffsetPx ?? 0;
  const exitEndOpacity = options.exitEndOpacity;
  const exitMaskMaxStartPercent = options.exitMaskMaxStartPercent;
  const exitHysteresisPx = options.exitHysteresisPx ?? 0;
  const exitVisibleRatioThreshold = options.exitVisibleRatioThreshold;
  const exitVisibleRatioThresholdPortrait = options.exitVisibleRatioThresholdPortrait;
  const exitVisibleRatioThresholdLandscape = options.exitVisibleRatioThresholdLandscape;
  const exitVisibleRatioHysteresis = options.exitVisibleRatioHysteresis ?? 0;
  const resetKey = options.resetKey;
  const enableExitMotion = typeof exitStartPx === "number" && exitRangePx > 0;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const revealDebugEnabled = isRevealDebugEnabled();

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
    const exitBandStates = new WeakMap<HTMLElement, boolean>();
    const exitAnchorTops = new WeakMap<HTMLElement, number>();
    const intersectionRatios = new WeakMap<HTMLElement, number>();
    const entryLockedItems = new WeakSet<HTMLElement>();
    const stableDocumentTops = new WeakMap<HTMLElement, number>();
    const stableHeights = new WeakMap<HTMLElement, number>();
    const stableWidths = new WeakMap<HTMLElement, number>();
    let rafId = 0;
    let exitMotionArmed = !enableExitMotion;
    let exitMotionPending = false;
    let lastScrollY = window.scrollY;

    const tick = () => {
      active.forEach((item) => {
        if (getRevealState(item) !== "eligible") {
          active.delete(item);
          observer.unobserve(item);
          return;
        }

        const rawRect = item.getBoundingClientRect();
        const measuredRect = getRevealLayoutMetrics(item);
        const measuredTranslateY = rawRect.top - measuredRect.top;
        if (Math.abs(measuredTranslateY) < 0.5) {
          stableDocumentTops.set(item, measuredRect.top + window.scrollY);
          stableHeights.set(item, measuredRect.height);
          stableWidths.set(item, measuredRect.width);
        }

        const stableDocumentTop = stableDocumentTops.get(item);
        const layoutHeight = stableHeights.get(item) ?? measuredRect.height;
        const layoutWidth = stableWidths.get(item) ?? measuredRect.width;
        const layoutTop =
          typeof stableDocumentTop === "number"
            ? stableDocumentTop - window.scrollY
            : measuredRect.top;
        const layoutBottom = layoutTop + layoutHeight;
        const translateY = rawRect.top - layoutTop;
        const rect = {
          top: layoutTop,
          bottom: layoutBottom,
          left: measuredRect.left,
          right: measuredRect.right,
          width: layoutWidth,
          height: layoutHeight,
        };
        const visibleTop = Math.max(layoutTop, 0);
        const visibleBottom = Math.min(layoutBottom, window.innerHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibleRatio = layoutHeight > 0 ? visibleHeight / layoutHeight : 0;
        const isVisible = isActuallyVisibleInViewport(item);
        const intersectionRatio = intersectionRatios.get(item);
        const aspectMode = layoutHeight > layoutWidth ? "portrait" : "landscape";
        const itemExitVisibleRatioThreshold =
          exitGateMode === "top"
            ? undefined
            : aspectMode === "portrait"
              ? exitVisibleRatioThresholdPortrait ?? exitVisibleRatioThreshold
              : exitVisibleRatioThresholdLandscape ?? exitVisibleRatioThreshold;
        const progress = getRevealProgressFromRect({
          top: layoutTop,
          bottom: layoutBottom,
          viewportHeight: window.innerHeight,
          entryOffsetPx,
          settleOffsetPx,
        });
        if (!exitMotionArmed && isVisible) {
          entryLockedItems.add(item);
        }
        const entryProgress = entryLockedItems.has(item) ? 1 : progress;

        if (enableExitMotion) {
          if (!exitMotionArmed && entryLockedItems.has(item)) {
            applyBidirectionalRevealProgress(item, {
              entryProgress: 1,
              entryOffsetPx: offsetPx,
              startOpacity,
              exitProgress: 1,
              exitOffsetPx,
              exitEndOpacity,
              exitMaskMaxStartPercent,
            });
            setRevealDebugSnapshot(
              item,
              {
                phase: "tick",
                reason: "hold-visible-before-scroll",
                state: getRevealState(item),
                scrollY: window.scrollY,
                top: rect.top,
                bottom: rect.bottom,
                rawTop: rawRect.top,
                rawBottom: rawRect.bottom,
                translateY,
                visibleRatio,
                exitAnchorTop: exitStartPx,
                exitVisibleRatioThresholdUsed: itemExitVisibleRatioThreshold,
                aspectMode,
                entryProgress: 1,
                exitProgress: 1,
                visible: isVisible,
                entryLocked: true,
                active: active.has(item),
                intersectionRatio,
                armed: exitMotionArmed,
                pending: exitMotionPending,
                exiting: false,
                wasExiting: exitBandStates.get(item) ?? false,
              },
              revealDebugEnabled
            );
            return;
          }

          const wasExiting = exitBandStates.get(item) ?? false;
          const isExiting = exitMotionArmed
            ? isInRevealExitBand({
                top: rect.top,
                exitStartPx,
                exitHysteresisPx,
                exitVisibleRatio: visibleRatio,
                exitVisibleRatioThreshold: itemExitVisibleRatioThreshold,
                exitVisibleRatioHysteresis,
                wasExiting,
              })
            : false;
          if (isExiting && !wasExiting) {
            exitAnchorTops.set(item, rect.top);
          } else if (!isExiting) {
            exitAnchorTops.delete(item);
          }
          exitBandStates.set(item, isExiting);
          const exitAnchorTop = exitAnchorTops.get(item) ?? exitStartPx;
          const exitProgress = isExiting
            ? getRevealExitProgressFromTop({
                top: rect.top,
                exitStartPx: exitAnchorTop,
                exitRangePx,
              })
            : 1;

          applyBidirectionalRevealProgress(item, {
            entryProgress,
            entryOffsetPx: offsetPx,
            startOpacity,
            exitProgress,
            exitOffsetPx,
            exitEndOpacity,
            exitMaskMaxStartPercent,
          });
          setRevealDebugSnapshot(
            item,
            {
              phase: "tick",
              reason: isExiting
                ? "exit-band"
                : entryLockedItems.has(item)
                  ? "entry-locked-steady"
                  : "entry-or-steady",
              state: getRevealState(item),
              scrollY: window.scrollY,
              top: rect.top,
              bottom: rect.bottom,
              rawTop: rawRect.top,
              rawBottom: rawRect.bottom,
              translateY,
              visibleRatio,
              exitAnchorTop,
              exitVisibleRatioThresholdUsed: itemExitVisibleRatioThreshold,
              aspectMode,
              entryProgress,
              exitProgress,
              visible: isVisible,
              entryLocked: entryLockedItems.has(item),
              active: active.has(item),
              intersectionRatio,
              armed: exitMotionArmed,
              pending: exitMotionPending,
              exiting: isExiting,
              wasExiting,
            },
            revealDebugEnabled
          );
          return;
        }

        applyRevealProgress(item, progress, offsetPx, startOpacity);
        setRevealDebugSnapshot(
          item,
          {
            phase: "tick",
            reason: progress >= 1 ? "settle-ready" : "entry-only",
            state: getRevealState(item),
            scrollY: window.scrollY,
            top: rect.top,
            bottom: rect.bottom,
            rawTop: rawRect.top,
            rawBottom: rawRect.bottom,
            translateY,
            visibleRatio,
            exitAnchorTop: exitStartPx,
            exitVisibleRatioThresholdUsed: itemExitVisibleRatioThreshold,
            aspectMode,
            entryProgress: progress,
            exitProgress: 1,
            visible: isVisible,
            entryLocked: false,
            active: active.has(item),
            intersectionRatio,
            armed: exitMotionArmed,
            pending: exitMotionPending,
            exiting: false,
            wasExiting: false,
          },
          revealDebugEnabled
        );

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

    const refreshVisibleItems = () => {
      root.querySelectorAll<HTMLElement>(selector).forEach((item) => {
        if (getRevealState(item) !== "eligible") {
          return;
        }

        if (isActuallyVisibleInViewport(item)) {
          active.add(item);
        }
      });

      scheduleTick();
    };

    const armExitMotion = () => {
      if (exitMotionArmed) return;
      exitMotionArmed = true;
      scheduleTick();
    };

    const noteExitMotionIntent = () => {
      if (exitMotionArmed) return;
      exitMotionPending = true;
    };

    const noteExitMotionIntentFromKeyboard = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "PageDown" ||
        event.key === "PageUp" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        noteExitMotionIntent();
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (
        !exitMotionArmed &&
        exitMotionPending &&
        Math.abs(currentScrollY - lastScrollY) > 0.5
      ) {
        armExitMotion();
      }

      lastScrollY = currentScrollY;
      if (enableExitMotion) {
        refreshVisibleItems();
        return;
      }

      scheduleTick();
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

          if (enableExitMotion) {
            intersectionRatios.set(item, entry.intersectionRatio);
            if (entry.isIntersecting) {
              active.add(item);
              setRevealDebugSnapshot(
                item,
                {
                  phase: "observer",
                  reason: "enter",
                  state: getRevealState(item),
                  intersecting: true,
                  intersectionRatio: entry.intersectionRatio,
                  active: true,
                  armed: exitMotionArmed,
                  pending: exitMotionPending,
                },
                revealDebugEnabled
              );
              scheduleTick();
              return;
            }

            active.delete(item);
            setRevealDebugSnapshot(
              item,
                {
                  phase: "observer",
                  reason: "leave",
                  state: getRevealState(item),
                  intersecting: false,
                  intersectionRatio: entry.intersectionRatio,
                  active: false,
                  armed: exitMotionArmed,
                  pending: exitMotionPending,
              },
              revealDebugEnabled
            );
            return;
          }

          if (shouldSettleImmediatelyFromElement(item)) {
            settleScrollLinkedReveal(item);
            active.delete(item);
            observer.unobserve(item);
            return;
          }

          intersectionRatios.set(item, entry.intersectionRatio);
          if (entry.isIntersecting) {
            active.add(item);
            setRevealDebugSnapshot(
              item,
              {
                phase: "observer",
                reason: "enter",
                state: getRevealState(item),
                intersecting: true,
                intersectionRatio: entry.intersectionRatio,
                active: true,
                armed: exitMotionArmed,
                pending: exitMotionPending,
              },
              revealDebugEnabled
            );
            scheduleTick();
            return;
          }

          active.delete(item);
          setRevealDebugSnapshot(
            item,
            {
              phase: "observer",
              reason: "leave",
              state: getRevealState(item),
              intersecting: false,
              intersectionRatio: entry.intersectionRatio,
              active: false,
              armed: exitMotionArmed,
              pending: exitMotionPending,
            },
            revealDebugEnabled
          );
        });
      },
      {
        threshold: 0,
        rootMargin: `${Math.max(entryOffsetPx, exitRangePx)}px 48px ${entryOffsetPx}px 48px`,
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
    refreshVisibleItems();

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

    window.addEventListener("wheel", noteExitMotionIntent, { passive: true });
    window.addEventListener("touchmove", noteExitMotionIntent, { passive: true });
    window.addEventListener("keydown", noteExitMotionIntentFromKeyboard);
    window.addEventListener(REVEAL_LAYOUT_INVALIDATED_EVENT, refreshVisibleItems);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", scheduleTick);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      if (revealDebugEnabled) {
        root
          .querySelectorAll<HTMLElement>(selector)
          .forEach((item) => clearRevealDebugSnapshot(item));
      }
      observer.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("wheel", noteExitMotionIntent);
      window.removeEventListener("touchmove", noteExitMotionIntent);
      window.removeEventListener("keydown", noteExitMotionIntentFromKeyboard);
      window.removeEventListener(REVEAL_LAYOUT_INVALIDATED_EVENT, refreshVisibleItems);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", scheduleTick);
    };
  }, [
    ref,
    selector,
    entryOffsetPx,
    settleOffsetPx,
    offsetPx,
    startOpacity,
    exitGateMode,
    exitStartPx,
    exitRangePx,
    exitOffsetPx,
    exitEndOpacity,
    exitMaskMaxStartPercent,
    exitHysteresisPx,
    exitVisibleRatioThreshold,
    exitVisibleRatioThresholdPortrait,
    exitVisibleRatioThresholdLandscape,
    exitVisibleRatioHysteresis,
    enableExitMotion,
    resetKey,
  ]);
}
