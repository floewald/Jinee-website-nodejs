import { useState, useEffect, RefObject } from "react";

export interface UseIntersectionOptions extends IntersectionObserverInit {
  /**
   * When true the observer disconnects after the first intersection,
   * and `isIntersecting` stays true even if the element scrolls out again.
   */
  once?: boolean;
}

/**
 * Returns true when the referenced element has entered the viewport.
 * Useful for triggering lazy-load animations or deferred image loading.
 */
export function useIntersection(
  ref: RefObject<Element | null>,
  options: UseIntersectionOptions = {}
): boolean {
  const { once = false, ...observerInit } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (once) observer.disconnect();
      } else if (!once) {
        setIsIntersecting(false);
      }
    }, observerInit);

    observer.observe(el);
    return () => observer.disconnect();
    // observerInit is spread from options — stringify avoids stale reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, once, JSON.stringify(observerInit)]);

  return isIntersecting;
}
