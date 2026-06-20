import { RefObject, useEffect } from "react";
import {
  GALLERY_REVEAL_RESCAN_DELAY_MS,
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_OFFSET_PX,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";
import {
  isElementWithinRevealRange,
  revealElement,
} from "@/lib/reveal-helpers";

/**
 * Fail-open gallery motion.
 *
 * Galleries stay visible by default; the observer only adds near-viewport
 * motion polish. Now that homepage collage items reserve intrinsic height,
 * the gallery can use the same viewport-entry reveal model as project cards
 * without depending on image load timing.
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
        revealElement(item);
      });
    };

    const galleryItems = Array.from(
      container.querySelectorAll<HTMLElement>(".gallery-item")
    );

    // Reveal on viewport entry regardless of image load state. Tiles now
    // reserve their intrinsic height (committed dimensions in index-config.json),
    // so the layout no longer settles late on Safari and the previous
    // image-load gate — which suppressed the slide-in once the lazy image
    // finished on a slow connection — is no longer needed. The
    // already-visible guard in revealElement still prevents animating tiles
    // that are on-screen, so this can't reintroduce the late-flicker glitch.
    const entryBufferPx = Math.max(REVEAL_BOTTOM_BUFFER_PX, REVEAL_OFFSET_PX);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealElement(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0,
        // Trigger while the tile is still just offscreen so the translateY
        // start state is applied out of view and the motion reads as a clean
        // slide-in (mirrors useProgressiveReveal).
        rootMargin: `${entryBufferPx}px ${REVEAL_SIDE_BUFFER_PX}px ${entryBufferPx}px ${REVEAL_SIDE_BUFFER_PX}px`,
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
