import { RefObject, useEffect } from "react";
import {
  GALLERY_REVEAL_RESCAN_DELAY_MS,
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
import {
  animateRevealElement,
  hasUserScrolledSinceLoad,
  isElementWithinRevealRange,
} from "@/lib/reveal-helpers";

/**
 * Fail-open gallery motion.
 *
 * Galleries should not depend on viewport observers for visibility because
 * masonry/CSS-column layout and image decode can settle late on Mobile Safari.
 * Instead, content stays visible by default and tiles animate only when their
 * image is already loaded.
 */
export function useLoadedGalleryReveal(ref: RefObject<Element | null>, selector = ".gallery-item img") {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const animateLoadedItems = () => {
      const revealOptions = hasUserScrolledSinceLoad() ? undefined : { offsetPx: 0 };

      container.querySelectorAll<HTMLImageElement>(selector).forEach((img) => {
        if (!img.complete) return;
        const item = img.closest(".gallery-item");
        if (!(item instanceof HTMLElement)) return;
        if (!isElementWithinRevealRange(item)) return;
        animateRevealElement(item, revealOptions);
      });
    };

    const galleryItems = Array.from(
      container.querySelectorAll<HTMLElement>(".gallery-item")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const revealOptions = hasUserScrolledSinceLoad() ? undefined : { offsetPx: 0 };

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const item = entry.target as HTMLElement;
          const img = item.querySelector<HTMLImageElement>("img");
          if (img?.complete) animateRevealElement(item, revealOptions);
        });
      },
      {
        threshold: 0,
        rootMargin: `${REVEAL_BOTTOM_BUFFER_PX}px ${REVEAL_SIDE_BUFFER_PX}px ${REVEAL_BOTTOM_BUFFER_PX}px ${REVEAL_SIDE_BUFFER_PX}px`,
      }
    );

    galleryItems.forEach((item) => observer.observe(item));
    animateLoadedItems();
    const timeoutId = window.setTimeout(animateLoadedItems, GALLERY_REVEAL_RESCAN_DELAY_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [ref, selector]);
}
