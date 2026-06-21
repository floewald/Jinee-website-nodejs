import { RefObject, useEffect } from "react";
import {
  GALLERY_REVEAL_RESCAN_DELAY_MS,
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
import { revealElement, settleRevealElement } from "@/lib/reveal-helpers";
import { getRevealState, isActuallyVisibleInViewport } from "@/lib/reveal-state";

function collectGalleryItems(container: Element, selector: string) {
  const items = new Set<HTMLElement>();

  container.querySelectorAll<Element>(selector).forEach((element) => {
    const item = element.closest(".gallery-item");
    if (item instanceof HTMLElement) {
      items.add(item);
    }
  });

  return Array.from(items);
}

/**
 * Fail-open gallery motion.
 *
 * Galleries stay visible by default. The observer owns entry animation for
 * still-eligible items, while image/load/resize recovery only settles tiles
 * that are already visibly in-frame so slow scroll never fades them back in.
 */
export function useLoadedGalleryReveal(
  ref: RefObject<Element | null>,
  selector = ".gallery-item img",
  revealKey = "default"
) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const galleryItems = collectGalleryItems(container, selector);
    if (galleryItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const item = entry.target as HTMLElement;
          revealElement(item);
          observer.unobserve(item);
        });
      },
      {
        threshold: 0,
        rootMargin: `${REVEAL_BOTTOM_BUFFER_PX}px ${REVEAL_SIDE_BUFFER_PX}px ${REVEAL_BOTTOM_BUFFER_PX}px ${REVEAL_SIDE_BUFFER_PX}px`,
      }
    );

    const observeEligibleItems = () => {
      galleryItems.forEach((item) => {
        if (getRevealState(item) !== "eligible") return;
        observer.observe(item);
      });
    };

    const settleVisibleItems = () => {
      container.querySelectorAll<HTMLImageElement>(selector).forEach((img) => {
        if (!img.complete) return;
        const item = img.closest(".gallery-item");
        if (!(item instanceof HTMLElement)) return;
        if (!isActuallyVisibleInViewport(item)) return;
        settleRevealElement(item);
        observer.unobserve(item);
      });
    };

    observeEligibleItems();
    settleVisibleItems();

    const timeoutId = window.setTimeout(
      settleVisibleItems,
      GALLERY_REVEAL_RESCAN_DELAY_MS
    );
    window.addEventListener("load", settleVisibleItems);
    window.addEventListener("resize", settleVisibleItems);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
      window.removeEventListener("load", settleVisibleItems);
      window.removeEventListener("resize", settleVisibleItems);
    };
  }, [ref, selector, revealKey]);
}
