import { REVEAL_DURATION_MS, REVEAL_EASING, REVEAL_OFFSET_PX } from "@/lib/reveal-config";

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

  if (typeof item.animate !== "function") return;

  item.animate(
    [
      { opacity: 0.86, transform: `translateY(${options?.offsetPx ?? REVEAL_OFFSET_PX}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ],
    {
      duration: options?.durationMs ?? REVEAL_DURATION_MS,
      easing: options?.easing ?? REVEAL_EASING,
      fill: "both",
    }
  );
}
