"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { css, cx } from "@/styled-system/css";
import { useSwipe } from "@/hooks/useSwipe";
import { SLIDESHOW_CYCLE_MS, SLIDESHOW_JITTER_MS } from "@/lib/constants";

import type { SlideshowImage } from "@/lib/gallery-images";

const slideshowRoot = css({
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  background: "#f5f5f5",
});

const slideBase = css({
  position: "absolute",
  inset: "0",
  opacity: 0,
  transition: "opacity 0.5s ease",
  background: "transparent",
  isolation: "isolate",
});

const slideActive = css({ opacity: 1 });

const blurBg = css({
  position: "absolute",
  inset: "-12%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "blur(14px)",
  zIndex: 0,
});

const blurOverlay = css({
  position: "absolute",
  inset: "0",
  background: "rgba(0, 0, 0, 0.4)",
  zIndex: 1,
});

interface CardSlideshowProps {
  images: SlideshowImage[];
  alt: string;
  /**
   * Accepted for backward compatibility; no longer used.
   * Timing is now randomised per card via a useState lazy initializer.
   */
  cardIndex?: number;
}

function getRenderedSlideIndices(total: number, activeIndex: number): number[] {
  if (total <= 3) return Array.from({ length: total }, (_, i) => i);

  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;
  return [prevIndex, activeIndex, nextIndex];
}

export default function CardSlideshow({ images, alt }: CardSlideshowProps) {
  const [idx, setIdx] = useState(0);
  const [portraitBySrc, setPortraitBySrc] = useState<Record<string, boolean>>({});
  // Lazy initializer runs exactly once (not on re-renders) — safe to use
  // Math.random() here. Each card gets its own random interval and start
  // delay so no two cards ever stay in sync.
  const [timing] = useState(() => {
    const intervalMs = SLIDESHOW_CYCLE_MS + Math.random() * SLIDESHOW_JITTER_MS;
    return { intervalMs, delayMs: Math.random() * intervalMs };
  });

  const next = () => setIdx((prev) => (prev + 1) % images.length);
  const prev = () => setIdx((prev) => (prev - 1 + images.length) % images.length);
  const { handlers: swipeHandlers } = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });

  const markPortraitFlag = useCallback((src: string, width: number, height: number) => {
    if (width <= 0 || height <= width) return;
    setPortraitBySrc((prev) => {
      if (prev[src]) return prev;
      return { ...prev, [src]: true };
    });
  }, []);

  const activeIndex = images.length === 0 ? 0 : idx % images.length;

  useEffect(() => {
    if (images.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    // Inline advance to avoid adding `next` to the dependency array
    // (which would re-subscribe the timer every render).
    const advance = () => setIdx((prev) => (prev + 1) % images.length);

    const timeoutId = setTimeout(() => {
      advance();
      intervalId = setInterval(advance, timing.intervalMs);
    }, timing.delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [images.length, timing.intervalMs, timing.delayMs]);

  // Preload the next image whenever the active index changes so it is already
  // in the browser cache before the slide transition fires.
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIndex = (activeIndex + 1) % images.length;
    const nextSrc = images[nextIndex].src;
    const img = new window.Image();
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      if (images[nextIndex]?.src !== nextSrc) return;
      markPortraitFlag(nextSrc, img.naturalWidth, img.naturalHeight);
    };
    img.src = nextSrc;

    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [activeIndex, images, markPortraitFlag]);

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>, src: string) {
    const img = e.currentTarget;
    markPortraitFlag(src, img.naturalWidth, img.naturalHeight);
  }

  return (
    <div className={cx(slideshowRoot, "card-slideshow")} {...swipeHandlers}>
      {getRenderedSlideIndices(images.length, activeIndex).map((i) => {
        const image = images[i];
        const isPortrait = portraitBySrc[image.src];
        const active = i === activeIndex;
        return (
          <div
            key={image.src}
            className={cx(
              slideBase,
              active && slideActive,
              "card-slideshow__slide",
              active && "card-slideshow__slide--active",
              isPortrait && "card-slideshow__slide--portrait",
            )}
          >
            {isPortrait && (
              <>
                <div
                  className={cx(blurBg, "card-slideshow__bg")}
                  style={{ backgroundImage: `url("${image.src}")` }}
                  aria-hidden="true"
                />
                <div className={cx(blurOverlay, "card-slideshow__bg-overlay")} aria-hidden="true" />
              </>
            )}
            <Image
              src={image.src}
              alt={i === 0 ? alt : ""}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="project-card__img"
              style={{
                objectFit: isPortrait ? "contain" : "cover",
                zIndex: isPortrait ? 2 : undefined,
              }}
              unoptimized
              {...(image.blur ? { placeholder: "blur" as const, blurDataURL: image.blur } : {})}
              onLoad={(e) => handleLoad(e, image.src)}
            />
          </div>
        );
      })}
    </div>
  );
}
