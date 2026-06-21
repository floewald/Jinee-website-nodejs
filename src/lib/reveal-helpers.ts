import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_DURATION_MS,
  REVEAL_EASING,
  REVEAL_OFFSET_PX,
  REVEAL_START_OPACITY,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
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
