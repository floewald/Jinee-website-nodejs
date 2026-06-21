import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_SIDE_BUFFER_PX,
  REVEAL_VISIBLE_THRESHOLD_PX,
} from "@/lib/reveal-config";

export type RevealState = "eligible" | "animating" | "animated" | "settled";

export interface RevealBandOptions {
  bottomBufferPx?: number;
  sideBufferPx?: number;
}

function isTypedRevealState(value: string | undefined): value is Exclude<RevealState, "eligible"> {
  return (
    value === "animating" ||
    value === "animated" ||
    value === "settled"
  );
}

export function getRevealState(item: HTMLElement): RevealState {
  const typedState = item.dataset.revealState;
  if (isTypedRevealState(typedState)) {
    return typedState;
  }

  if (item.dataset.revealAnimated === "true") {
    return "animated";
  }

  return "eligible";
}

export function markRevealAnimating(item: HTMLElement) {
  if (getRevealState(item) !== "eligible") {
    return false;
  }

  item.dataset.revealState = "animating";
  return true;
}

export function markRevealAnimated(item: HTMLElement) {
  item.dataset.revealState = "animated";
  item.dataset.revealAnimated = "true";
}

export function markRevealSettled(item: HTMLElement) {
  item.dataset.revealState = "settled";
  item.dataset.revealAnimated = "true";
}

export function isActuallyVisibleInViewport(item: HTMLElement) {
  const rect = item.getBoundingClientRect();
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, window.innerHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  return (
    visibleHeight > REVEAL_VISIBLE_THRESHOLD_PX &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

export function isInPreEntryBand(
  item: HTMLElement,
  options: RevealBandOptions = {}
) {
  const rect = item.getBoundingClientRect();
  const bottomBufferPx = options.bottomBufferPx ?? REVEAL_BOTTOM_BUFFER_PX;
  const sideBufferPx = options.sideBufferPx ?? REVEAL_SIDE_BUFFER_PX;

  return (
    rect.top < window.innerHeight + bottomBufferPx &&
    rect.bottom > -bottomBufferPx &&
    rect.left < window.innerWidth + sideBufferPx &&
    rect.right > -sideBufferPx
  );
}
