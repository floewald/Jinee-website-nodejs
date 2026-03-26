import { useRef } from "react";

export interface UseSwipeOptions {
  /** Called when a leftward swipe exceeds the threshold */
  onSwipeLeft?: () => void;
  /** Called when a rightward swipe exceeds the threshold */
  onSwipeRight?: () => void;
  /** Minimum horizontal pixel distance to register as a swipe (default: 50) */
  threshold?: number;
}

export interface UseSwipeReturn {
  /** Spread these props onto the element you want to detect swipes on */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

/**
 * Detect horizontal touch swipes on an element.
 * Only fires if the horizontal delta dominates the vertical delta.
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: UseSwipeOptions): UseSwipeReturn {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null || startY.current === null) return;
    const dx = startX.current - e.changedTouches[0].clientX;
    const dy = startY.current - e.changedTouches[0].clientY;

    // Ignore if vertical movement dominates
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx >= threshold) {
      onSwipeLeft?.();
    } else if (dx <= -threshold) {
      onSwipeRight?.();
    }

    startX.current = null;
    startY.current = null;
  }

  return { handlers: { onTouchStart, onTouchEnd } };
}
