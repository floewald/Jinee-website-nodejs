"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSwipe } from "@/hooks/useSwipe";
import type { GalleryImage } from "./Lightbox";

// useSwipe is only used for its handlers — no ref needed

interface SlideshowProps {
  images: GalleryImage[];
  /** Enable auto-play (default: true) */
  autoplay?: boolean;
  /** Auto-play interval in ms (default: 4000) */
  interval?: number;
}

export default function Slideshow({
  images,
  autoplay = true,
  interval = 4000,
}: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex((i + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-play
  useEffect(() => {
    if (!autoplay || images.length < 2) return;
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, interval, next, images.length]);

  // Swipe
  const { handlers: swipeHandlers } = useSwipe({
    onSwipeLeft: next,
    onSwipeRight: prev,
  });

  if (images.length === 0) return null;

  const current = images[index];

  return (
    <div className="slideshow" aria-label="Image slideshow">
      {/* track */}
      <div className="slideshow__track" {...swipeHandlers}>
        <div className="slideshow__slide">
          <Image
            src={current.src}
            alt={current.alt}
            width={800}
            height={534}
            className="slideshow__img"
            style={{ width: "100%", height: "auto" }}
            unoptimized
            priority={index === 0}
            {...(current.blur ? { placeholder: "blur" as const, blurDataURL: current.blur } : {})}
          />
        </div>
      </div>

      {/* controls */}
      {images.length > 1 && (
        <>
          <button
            className="slideshow__btn slideshow__prev"
            onClick={prev}
            aria-label="Previous slide"
          >
            ◀
          </button>

          <button
            className="slideshow__btn slideshow__next"
            onClick={next}
            aria-label="Next slide"
          >
            ▶
          </button>

          {/* dots */}
          <div className="slideshow__dots" aria-label="Slideshow navigation">
            {images.map((_, i) => (
              <button
                key={i}
                className={`slideshow__dot${i === index ? " slideshow__dot--active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
