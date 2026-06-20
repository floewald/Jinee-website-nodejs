import { RefObject, useEffect } from "react";
import {
  GALLERY_REVEAL_RESCAN_DELAY_MS,
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
import { isElementWithinRevealRange } from "@/lib/reveal-helpers";

function markGalleryItemRevealed(item: HTMLElement) {
  if (item.dataset.revealAnimated === "true") return;
  item.dataset.revealAnimated = "true";
}

/**
 * Fail-open gallery motion.
 *
 * Galleries stay visible by default. We intentionally avoid slide/fade WAAPI
 * motion here because late observer/image timing on slow scroll can apply
 * transform/opacity after the tile is already being watched, which reads as
 * a flicker or re-appearance.
 */
export function useLoadedGalleryReveal(ref: RefObject<Element | null>, selector = ".gallery-item img") {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const animateLoadedItems = () => {
      container.querySelectorAll<HTMLImageElement>(selector).forEach((img) => {
        if (!img.complete) return;
        const item = img.closest(".gallery-item");
        if (!(item instanceof HTMLElement)) return;
        if (!isElementWithinRevealRange(item)) return;
        markGalleryItemRevealed(item);
      });
    };

    const galleryItems = Array.from(
      container.querySelectorAll<HTMLElement>(".gallery-item")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          markGalleryItemRevealed(entry.target as HTMLElement);
          observer.unobserve(entry.target);
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
