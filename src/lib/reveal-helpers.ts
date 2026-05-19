import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_DURATION_MS,
  REVEAL_EASING,
  REVEAL_OFFSET_PX,
  REVEAL_SIDE_BUFFER_PX,
  REVEAL_START_OPACITY,
} from "@/lib/reveal-config";

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

export function animateRevealElement(
  item: HTMLElement,
  options?: {
    durationMs?: number;
    offsetPx?: number;
    easing?: string;
  }
) {
  if (item.dataset.revealAnimated === "true") return;
      item.dataset.revealAnimated = "true";

  // Fail-open rule: content is already visible in base CSS/HTML. Animation is
  // only polish. If WAAPI is unavailable or timing is odd, users still see the item.
  if (prefersReducedMotion() || typeof item.animate !== "function") return;

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
