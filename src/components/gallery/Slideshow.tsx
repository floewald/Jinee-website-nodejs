"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { css, cx } from "@/styled-system/css";
import { useSwipe } from "@/hooks/useSwipe";
import type { GalleryImage } from "./Lightbox";

const slideshowStyle = css({
  position: "relative",
  width: "100%",
  overflow: "hidden",
});

const trackStyle = css({
  display: "flex",
  width: "100%",
});

const slideStyle = css({
  flex: "0 0 100%",
  minWidth: "100%",
});

const imgStyle = css({
  width: "100%",
  height: "auto",
  display: "block",
  objectFit: "cover",
  aspectRatio: "16 / 9",
});

const btnStyle = css({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "none",
  padding: "8px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  zIndex: 2,
  "@media (max-width: 600px)": {
    padding: "10px 12px",
    fontSize: "1.1rem",
  },
});

const prevStyle = css({ left: "8px" });
const nextStyle = css({ right: "8px" });

const dotsStyle = css({
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: "12px",
  display: "flex",
  gap: "6px",
  zIndex: 3,
});

const dotStyle = css({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.35)",
  cursor: "pointer",
  padding: "0",
});

const dotActiveStyle = css({ background: "#fff" });

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
    <div className={slideshowStyle} aria-label="Image slideshow">
      {/* track */}
      <div className={trackStyle} {...swipeHandlers}>
        <div className={slideStyle}>
          <Image
            src={current.src}
            alt={current.alt}
            width={800}
            height={534}
            className={imgStyle}
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
            className={cx(btnStyle, prevStyle)}
            onClick={prev}
            aria-label="Previous slide"
          >
            ◀
          </button>

          <button
            className={cx(btnStyle, nextStyle)}
            onClick={next}
            aria-label="Next slide"
          >
            ▶
          </button>

          {/* dots */}
          <div className={dotsStyle} aria-label="Slideshow navigation">
            {images.map((_, i) => (
              <button
                key={i}
                className={cx(dotStyle, i === index && dotActiveStyle)}
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
