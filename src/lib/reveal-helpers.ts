import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_DURATION_MS,
  REVEAL_EASING,
  REVEAL_OFFSET_PX,
  REVEAL_SIDE_BUFFER_PX,
  REVEAL_START_OPACITY,
} from "@/lib/reveal-config";

const NO_LATE_FLICKER_VISIBLE_THRESHOLD_PX = 1;

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
  const rect = item.getBoundingClientRect();
  return (
    rect.top < window.innerHeight + REVEAL_BOTTOM_BUFFER_PX &&
    rect.bottom > -REVEAL_BOTTOM_BUFFER_PX &&
    rect.left < window.innerWidth + REVEAL_SIDE_BUFFER_PX &&
    rect.right > -REVEAL_SIDE_BUFFER_PX
  );
}

function getVisibleHeightInViewport(item: HTMLElement) {
  const rect = item.getBoundingClientRect();
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, window.innerHeight);
  return Math.max(0, visibleBottom - visibleTop);
}

export function animateRevealElement(
  item: HTMLElement,
  options?: RevealAnimationOptions,
) {
  if (item.dataset.revealAnimated === "true") return;
  item.dataset.revealAnimated = "true";

  // Fail-open rule: content is already visible in base CSS/HTML. Animation is
  // only polish. If WAAPI is unavailable or timing is odd, users still see the item.
  if (
    prefersReducedMotion() ||
    typeof item.animate !== "function" ||
    getVisibleHeightInViewport(item) > NO_LATE_FLICKER_VISIBLE_THRESHOLD_PX
  ) {
    return;
  }

  item.animate(
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
