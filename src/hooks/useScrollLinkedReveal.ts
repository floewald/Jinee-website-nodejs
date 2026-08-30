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
  debugLabel?: string;
  exitGateMode?: "top" | "top-and-visible-ratio";
  exitAnchorMode?: "current-top" | "configured-start";
  exitAnchorModePortrait?: "current-top" | "configured-start";
  exitAnchorModeLandscape?: "current-top" | "configured-start";
  exitStartPx?: number;
  exitRangePx?: number;
  exitOffsetPx?: number;
  exitEndOpacity?: number;
  exitEndOpacityPortrait?: number;
  exitEndOpacityLandscape?: number;
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
  const MAX_STABLE_LAYOUT_DRIFT_PX = 120;
  const entryOffsetPx = options.entryOffsetPx ?? REVEAL_PROGRESS_ENTRY_OFFSET_PX;
  const settleOffsetPx = options.settleOffsetPx ?? REVEAL_PROGRESS_SETTLE_OFFSET_PX;
  const offsetPx = options.offsetPx ?? REVEAL_OFFSET_PX;
  const startOpacity = options.startOpacity ?? REVEAL_START_OPACITY;
  const debugLabel = options.debugLabel;
  const exitGateMode = options.exitGateMode ?? "top-and-visible-ratio";
  const exitAnchorMode = options.exitAnchorMode ?? "current-top";
  const exitAnchorModePortrait = options.exitAnchorModePortrait;
  const exitAnchorModeLandscape = options.exitAnchorModeLandscape;
  const exitStartPx = options.exitStartPx;
  const exitRangePx = options.exitRangePx ?? 0;
  const exitOffsetPx = options.exitOffsetPx ?? 0;
  const exitEndOpacity = options.exitEndOpacity;
  const exitEndOpacityPortrait = options.exitEndOpacityPortrait;
  const exitEndOpacityLandscape = options.exitEndOpacityLandscape;
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
    const getVisualDebugState = (
      entryProgress: number,
      exitProgress: number,
      resolvedExitEndOpacity: number,
      resolvedExitMaskMaxStartPercent: number
    ) => {
      const resolvedEntryProgress = Math.min(1, Math.max(0, entryProgress));
      const resolvedExitProgress = Math.min(1, Math.max(0, exitProgress));
      const entryOpacity = startOpacity + (1 - startOpacity) * resolvedEntryProgress;
      const exitOpacity =
        resolvedExitEndOpacity + (1 - resolvedExitEndOpacity) * resolvedExitProgress;

      return {
        computedOpacity: Math.min(entryOpacity, exitOpacity),
        exitMaskStartPercent:
          resolvedExitMaskMaxStartPercent * (1 - resolvedExitProgress),
      };
    };

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

    const clearStableLayoutMetrics = (item: HTMLElement) => {
      stableDocumentTops.delete(item);
      stableHeights.delete(item);
      stableWidths.delete(item);
      exitAnchorTops.delete(item);
      exitBandStates.delete(item);
    };

    const clearStableLayoutMetricsWithinRoot = () => {
      root
        .querySelectorAll<HTMLElement>(selector)
        .forEach((item) => clearStableLayoutMetrics(item));
    };

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

        let stableDocumentTop = stableDocumentTops.get(item);
        let layoutHeight = stableHeights.get(item) ?? measuredRect.height;
        let layoutWidth = stableWidths.get(item) ?? measuredRect.width;
        let layoutTop =
          typeof stableDocumentTop === "number"
            ? stableDocumentTop - window.scrollY
            : measuredRect.top;
        if (
          typeof stableDocumentTop === "number" &&
          Math.abs(rawRect.top - layoutTop) > MAX_STABLE_LAYOUT_DRIFT_PX
        ) {
          stableDocumentTop = measuredRect.top + window.scrollY;
          layoutTop = measuredRect.top;
          layoutHeight = measuredRect.height;
          layoutWidth = measuredRect.width;
          stableDocumentTops.set(item, stableDocumentTop);
          stableHeights.set(item, layoutHeight);
          stableWidths.set(item, layoutWidth);
          exitAnchorTops.delete(item);
          exitBandStates.delete(item);
        }
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
        const itemExitAnchorMode =
          aspectMode === "portrait"
            ? exitAnchorModePortrait ?? exitAnchorMode
            : exitAnchorModeLandscape ?? exitAnchorMode;
        const itemExitVisibleRatioThreshold =
          exitGateMode === "top"
            ? undefined
            : aspectMode === "portrait"
              ? exitVisibleRatioThresholdPortrait ?? exitVisibleRatioThreshold
              : exitVisibleRatioThresholdLandscape ?? exitVisibleRatioThreshold;
        const itemExitEndOpacity =
          aspectMode === "portrait"
            ? exitEndOpacityPortrait ?? exitEndOpacity ?? startOpacity
            : exitEndOpacityLandscape ?? exitEndOpacity ?? startOpacity;
        const itemExitMaskMaxStartPercent = exitMaskMaxStartPercent ?? 0;
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
              exitEndOpacity: itemExitEndOpacity,
              exitMaskMaxStartPercent: itemExitMaskMaxStartPercent,
            });
            setRevealDebugSnapshot(
              item,
              {
                phase: "tick",
                reason: "hold-visible-before-scroll",
                surfaceLabel: debugLabel,
                state: getRevealState(item),
                scrollY: window.scrollY,
                top: rect.top,
                bottom: rect.bottom,
                rawTop: rawRect.top,
                rawBottom: rawRect.bottom,
                translateY,
                ...getVisualDebugState(
                  1,
                  1,
                  itemExitEndOpacity,
                  itemExitMaskMaxStartPercent
                ),
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
          const shouldAnchorExitFromCurrentTop = itemExitAnchorMode === "current-top";
          if (shouldAnchorExitFromCurrentTop && isExiting && !wasExiting) {
            exitAnchorTops.set(item, rect.top);
          } else if (!isExiting || !shouldAnchorExitFromCurrentTop) {
            exitAnchorTops.delete(item);
          }
          exitBandStates.set(item, isExiting);
          const exitAnchorTop = shouldAnchorExitFromCurrentTop
            ? exitAnchorTops.get(item) ?? exitStartPx
            : exitStartPx;
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
            exitEndOpacity: itemExitEndOpacity,
            exitMaskMaxStartPercent: itemExitMaskMaxStartPercent,
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
              surfaceLabel: debugLabel,
              state: getRevealState(item),
              scrollY: window.scrollY,
              top: rect.top,
              bottom: rect.bottom,
              rawTop: rawRect.top,
              rawBottom: rawRect.bottom,
              translateY,
              ...getVisualDebugState(
                entryProgress,
                exitProgress,
                itemExitEndOpacity,
                itemExitMaskMaxStartPercent
              ),
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
            surfaceLabel: debugLabel,
            state: getRevealState(item),
            scrollY: window.scrollY,
            top: rect.top,
            bottom: rect.bottom,
            rawTop: rawRect.top,
            rawBottom: rawRect.bottom,
            translateY,
            ...getVisualDebugState(
              progress,
              1,
              itemExitEndOpacity,
              itemExitMaskMaxStartPercent
            ),
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

    const handleLayoutInvalidated = () => {
      clearStableLayoutMetricsWithinRoot();
      refreshVisibleItems();
    };

    // A card can move after its own geometry was cached: fonts may swap in,
    // images can finish decoding, and back/forward navigation can restore a
    // page at a different scroll position. Start from fresh layout metrics in
    // all of those cases rather than letting an old position drive opacity.
    const handlePageShown = () => {
      handleLayoutInvalidated();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleLayoutInvalidated();
      }
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
                  surfaceLabel: debugLabel,
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
                  surfaceLabel: debugLabel,
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
                surfaceLabel: debugLabel,
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
              surfaceLabel: debugLabel,
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

    // Transforms applied by this hook do not trigger ResizeObserver, but a
    // genuine resize does. Treat it as a layout invalidation so cached document
    // positions never survive a responsive reflow or late content sizing.
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(() => {
        handleLayoutInvalidated();
      });
      resizeObserver.observe(root);
      initialItems.forEach((item) => resizeObserver?.observe(item));
    }

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
          mutation.addedNodes.forEach((node) => {
            observeWithin(node);
            if (node instanceof HTMLElement && (node.matches(selector) || node.querySelector(selector))) {
              if (node.matches(selector)) {
                resizeObserver?.observe(node);
              }
              node
                .querySelectorAll<HTMLElement>(selector)
                .forEach((item) => resizeObserver?.observe(item));
              handleLayoutInvalidated();
            }
          });
        });
      });
      mutationObserver.observe(root, { childList: true, subtree: true });
    }

    let disposed = false;
    void document.fonts?.ready.then(() => {
      if (!disposed) {
        handleLayoutInvalidated();
      }
    });

    window.addEventListener("wheel", noteExitMotionIntent, { passive: true });
    window.addEventListener("touchmove", noteExitMotionIntent, { passive: true });
    // Scrollbar drags do not dispatch wheel or touch events. A pointer press
    // makes their following scroll eligible to arm exit motion as well.
    window.addEventListener("pointerdown", noteExitMotionIntent, { passive: true });
    window.addEventListener("mousedown", noteExitMotionIntent, { passive: true });
    window.addEventListener("keydown", noteExitMotionIntentFromKeyboard);
    window.addEventListener(REVEAL_LAYOUT_INVALIDATED_EVENT, handleLayoutInvalidated);
    window.addEventListener("load", handlePageShown);
    window.addEventListener("pageshow", handlePageShown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleLayoutInvalidated);

    return () => {
      disposed = true;
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
      resizeObserver?.disconnect();
      window.removeEventListener("wheel", noteExitMotionIntent);
      window.removeEventListener("touchmove", noteExitMotionIntent);
      window.removeEventListener("pointerdown", noteExitMotionIntent);
      window.removeEventListener("mousedown", noteExitMotionIntent);
      window.removeEventListener("keydown", noteExitMotionIntentFromKeyboard);
      window.removeEventListener(REVEAL_LAYOUT_INVALIDATED_EVENT, handleLayoutInvalidated);
      window.removeEventListener("load", handlePageShown);
      window.removeEventListener("pageshow", handlePageShown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleLayoutInvalidated);
    };
  }, [
    ref,
    selector,
    entryOffsetPx,
    settleOffsetPx,
    offsetPx,
    startOpacity,
    debugLabel,
    exitGateMode,
    exitAnchorMode,
    exitAnchorModePortrait,
    exitAnchorModeLandscape,
    exitStartPx,
    exitRangePx,
    exitOffsetPx,
    exitEndOpacity,
    exitEndOpacityPortrait,
    exitEndOpacityLandscape,
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
