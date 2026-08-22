import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_DURATION_MS,
  REVEAL_EASING,
  REVEAL_OFFSET_PX,
  REVEAL_START_OPACITY,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
import { clampRevealProgress } from "@/lib/reveal-progress";
import {
  getRevealState,
  isActuallyVisibleInViewport,
  isInPreEntryBand,
  markRevealAnimated,
  markRevealAnimating,
  markRevealSettled,
} from "@/lib/reveal-state";

export interface RevealAnimationOptions {
  durationMs?: number;
  offsetPx?: number;
  easing?: string;
}

export const REVEAL_LAYOUT_INVALIDATED_EVENT = "reveal:layout-invalidated";

const CSS_REVEAL_PROGRESS = "--reveal-progress";
const CSS_REVEAL_OPACITY = "--reveal-opacity";
const CSS_REVEAL_TRANSLATE_Y = "--reveal-translate-y";
const CSS_REVEAL_EXIT_PROGRESS = "--reveal-exit-progress";
const CSS_REVEAL_EXIT_MASK_START = "--reveal-exit-mask-start";

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasUserScrolledSinceLoad() {
  return typeof window !== "undefined" && window.scrollY > 0;
}

export function isElementWithinRevealRange(item: HTMLElement) {
  return isInPreEntryBand(item, {
    bottomBufferPx: REVEAL_BOTTOM_BUFFER_PX,
    sideBufferPx: REVEAL_SIDE_BUFFER_PX,
  });
}

export function animateRevealElement(
  item: HTMLElement,
  options?: RevealAnimationOptions,
) {
  if (getRevealState(item) !== "eligible") return;

  // Fail-open rule: content is already visible in base CSS/HTML. Animation is
  // only polish. If WAAPI is unavailable or timing is odd, users still see the item.
  if (
    isActuallyVisibleInViewport(item) ||
    prefersReducedMotion() ||
    typeof item.animate !== "function"
  ) {
    markRevealSettled(item);
    return;
  }

  if (!markRevealAnimating(item)) return;

  const animation = item.animate(
    [
      {
        opacity: REVEAL_START_OPACITY,
        transform: `translateY(${options?.offsetPx ?? REVEAL_OFFSET_PX}px)`,
      },
      { opacity: 1, transform: "translateY(0)" },
    ],
    {
      duration: options?.durationMs ?? REVEAL_DURATION_MS,
      easing: options?.easing ?? REVEAL_EASING,
      fill: "both",
    }
  );

  if (!animation || typeof animation.finished?.then !== "function") {
    markRevealAnimated(item);
    return;
  }

  void animation.finished
    .then(() => {
      if (getRevealState(item) === "animating") {
        markRevealAnimated(item);
      }
    })
    .catch(() => {
      if (getRevealState(item) === "animating") {
        markRevealAnimated(item);
      }
    });
}

function getRevealOptionsForCurrentScroll(options?: RevealAnimationOptions) {
  if (hasUserScrolledSinceLoad()) {
    return options;
  }

  return {
    ...options,
    offsetPx: 0,
  };
}

export function revealElement(
  item: HTMLElement,
  options?: RevealAnimationOptions,
) {
  animateRevealElement(item, getRevealOptionsForCurrentScroll(options));
}

export function settleRevealElement(item: HTMLElement) {
  if (getRevealState(item) !== "eligible") return;
  markRevealSettled(item);
}

export function applyRevealProgress(
  item: HTMLElement,
  progress: number,
  offsetPx = REVEAL_OFFSET_PX,
  startOpacity = REVEAL_START_OPACITY
) {
  applyBidirectionalRevealProgress(item, {
    entryProgress: progress,
    entryOffsetPx: offsetPx,
    startOpacity,
  });
}

export function applyBidirectionalRevealProgress(
  item: HTMLElement,
  input: {
    entryProgress: number;
    entryOffsetPx?: number;
    startOpacity?: number;
    exitProgress?: number;
    exitOffsetPx?: number;
    exitEndOpacity?: number;
    exitMaskMaxStartPercent?: number;
  }
) {
  const entryProgress = clampRevealProgress(input.entryProgress);
  const exitProgress = clampRevealProgress(input.exitProgress ?? 1);
  const startOpacity = input.startOpacity ?? REVEAL_START_OPACITY;
  const exitEndOpacity = input.exitEndOpacity ?? startOpacity;
  const exitMaskMaxStartPercent = input.exitMaskMaxStartPercent ?? 0;
  const entryOpacity = startOpacity + (1 - startOpacity) * entryProgress;
  const exitOpacity = exitEndOpacity + (1 - exitEndOpacity) * exitProgress;
  const opacity = Math.min(entryOpacity, exitOpacity);
  const translateY =
    (input.entryOffsetPx ?? REVEAL_OFFSET_PX) * (1 - entryProgress) -
    (input.exitOffsetPx ?? 0) * (1 - exitProgress);
  const combinedProgress = Math.min(entryProgress, exitProgress);
  const exitMaskStartPercent = exitMaskMaxStartPercent * (1 - exitProgress);

  item.style.setProperty(CSS_REVEAL_PROGRESS, `${combinedProgress}`);
  item.style.setProperty(CSS_REVEAL_OPACITY, `${opacity}`);
  item.style.setProperty(CSS_REVEAL_TRANSLATE_Y, `${translateY}px`);
  item.style.setProperty(CSS_REVEAL_EXIT_PROGRESS, `${exitProgress}`);
  item.style.setProperty(CSS_REVEAL_EXIT_MASK_START, `${exitMaskStartPercent}%`);
}

export function settleScrollLinkedReveal(item: HTMLElement) {
  applyRevealProgress(item, 1, 0, 1);
  markRevealSettled(item);
}

export function showScrollLinkedReveal(item: HTMLElement) {
  applyRevealProgress(item, 1, 0, 1);
}

export function notifyRevealLayoutInvalidated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(REVEAL_LAYOUT_INVALIDATED_EVENT));
}
