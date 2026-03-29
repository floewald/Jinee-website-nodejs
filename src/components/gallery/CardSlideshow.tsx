"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSwipe } from "@/hooks/useSwipe";
import { SLIDESHOW_CYCLE_MS, SLIDESHOW_JITTER_MS } from "@/lib/constants";

import type { SlideshowImage } from "@/lib/gallery-images";

interface CardSlideshowProps {
  images: SlideshowImage[];
  alt: string;
  /**
   * Accepted for backward compatibility; no longer used.
   * Timing is now randomised per card via a useState lazy initializer.
   */
  cardIndex?: number;
}

export default function CardSlideshow({ images, alt }: CardSlideshowProps) {
  const [idx, setIdx] = useState(0);
  const [portraitFlags, setPortraitFlags] = useState<boolean[]>(() =>
    Array(images.length).fill(false)
  );
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
    const nextSrc = images[(idx + 1) % images.length].src;
    const img = new window.Image();
    img.src = nextSrc;
  }, [idx, images]);

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>, i: number) {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth) {
      setPortraitFlags((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
    }
  }

  return (
    <div className="card-slideshow" {...swipeHandlers}>
      {images.map((image, i) => {
        const isPortrait = portraitFlags[i];
        return (
          <div
            key={image.src}
            className={`card-slideshow__slide${i === idx ? " card-slideshow__slide--active" : ""}${isPortrait ? " card-slideshow__slide--portrait" : ""}`}
          >
            {isPortrait && (
              <>
                <div
                  className="card-slideshow__bg"
                  style={{ backgroundImage: `url("${image.src}")` }}
                  aria-hidden="true"
                />
                <div className="card-slideshow__bg-overlay" aria-hidden="true" />
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
              onLoad={(e) => handleLoad(e, i)}
            />
          </div>
        );
      })}
    </div>
  );
}
