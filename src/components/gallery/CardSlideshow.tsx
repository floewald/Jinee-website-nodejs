"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSwipe } from "@/hooks/useSwipe";
import { SLIDESHOW_CYCLE_MS } from "@/lib/constants";

import type { SlideshowImage } from "@/lib/gallery-images";

interface CardSlideshowProps {
  images: SlideshowImage[];
  alt: string;
  /**
   * Position of this card in the grid (0-based).
   * Even cards advance immediately; odd cards are offset by half a cycle,
   * producing the checkerboard stagger: 0,2,4 → wait → 1,3,5 → repeat.
   */
  cardIndex: number;
}

export default function CardSlideshow({ images, alt, cardIndex }: CardSlideshowProps) {
  const [idx, setIdx] = useState(0);
  const [portraitFlags, setPortraitFlags] = useState<boolean[]>(() =>
    Array(images.length).fill(false)
  );
  // Odd-positioned cards wait half a cycle before their first advance so that
  // adjacent cards never change at the same time.
  const delay = useRef((cardIndex % 2) * (SLIDESHOW_CYCLE_MS / 2));

  const next = () => setIdx((prev) => (prev + 1) % images.length);
  const prev = () => setIdx((prev) => (prev - 1 + images.length) % images.length);
  const { handlers: swipeHandlers } = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });

  useEffect(() => {
    if (images.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      next();
      intervalId = setInterval(() => {
        next();
      }, SLIDESHOW_CYCLE_MS);
    }, delay.current);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [images.length]);

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
