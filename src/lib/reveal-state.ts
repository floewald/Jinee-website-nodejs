import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_SIDE_BUFFER_PX,
  REVEAL_VISIBLE_THRESHOLD_PX,
} from "@/lib/reveal-config";
import { shouldSettleImmediately } from "@/lib/reveal-progress";

export type RevealState = "eligible" | "animating" | "animated" | "settled";
const CSS_REVEAL_TRANSLATE_Y = "--reveal-translate-y";

export interface RevealBandOptions {
  bottomBufferPx?: number;
  sideBufferPx?: number;
}

export interface RevealLayoutMetrics {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

interface RevealRectSnapshot {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
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

function getRevealTranslateY(item: HTMLElement) {
  const rawValue = item.style.getPropertyValue(CSS_REVEAL_TRANSLATE_Y);
  const translateY = Number.parseFloat(rawValue);

  return Number.isFinite(translateY) ? translateY : 0;
}

function getPreferredRevealRect(item: HTMLElement): RevealRectSnapshot {
  const rects = Array.from(item.getClientRects());
  const fallbackRect = item.getBoundingClientRect();
  const dominantRect = rects.reduce<RevealRectSnapshot | null>((best, rect) => {
    const currentArea = rect.width * rect.height;
    const bestArea = best ? best.width * best.height : -1;
    if (currentArea <= bestArea) {
      return best;
    }

    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  }, null);

  if (dominantRect) {
    const width = item.offsetWidth > 0 ? item.offsetWidth : dominantRect.width;
    const height = item.offsetHeight > 0 ? item.offsetHeight : dominantRect.height;

    return {
      top: dominantRect.top,
      bottom: dominantRect.top + height,
      left: dominantRect.left,
      right: dominantRect.left + width,
      width,
      height,
    };
  }

  return {
    top: fallbackRect.top,
    bottom: fallbackRect.bottom,
    left: fallbackRect.left,
    right: fallbackRect.right,
    width: fallbackRect.width,
    height: fallbackRect.height,
  };
}

export function getRevealLayoutMetrics(item: HTMLElement): RevealLayoutMetrics {
  const rect = getPreferredRevealRect(item);
  const translateY = getRevealTranslateY(item);

  return {
    top: rect.top - translateY,
    bottom: rect.top - translateY + rect.height,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height,
  };
}

export function isActuallyVisibleInViewport(item: HTMLElement) {
  const rect = getRevealLayoutMetrics(item);
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, window.innerHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  return (
    visibleHeight > REVEAL_VISIBLE_THRESHOLD_PX &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

export function shouldSettleImmediatelyFromElement(item: HTMLElement) {
  const rect = getRevealLayoutMetrics(item);

  return shouldSettleImmediately({
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  });
}

export function isInPreEntryBand(
  item: HTMLElement,
  options: RevealBandOptions = {}
) {
  const rect = getRevealLayoutMetrics(item);
  const bottomBufferPx = options.bottomBufferPx ?? REVEAL_BOTTOM_BUFFER_PX;
  const sideBufferPx = options.sideBufferPx ?? REVEAL_SIDE_BUFFER_PX;

  return (
    rect.top < window.innerHeight + bottomBufferPx &&
    rect.bottom > -bottomBufferPx &&
    rect.left < window.innerWidth + sideBufferPx &&
    rect.right > -sideBufferPx
  );
}
