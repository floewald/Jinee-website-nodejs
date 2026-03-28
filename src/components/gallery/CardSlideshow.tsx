"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSwipe } from "@/hooks/useSwipe";
import type { SlideshowImage } from "@/lib/gallery-images";

interface CardSlideshowProps {
  images: SlideshowImage[];
  alt: string;
}

// Module-level counter for stagger offsets.
// We multiply by a prime (997) that is coprime with the 4000 ms cycle, so
// every card gets a distinct offset — no two cards share a phase until 4000
// instances have been created.  This eliminates the "pairs changing together"
// problem that a 3-bucket strategy would cause for ≥4 visible cards.
let instanceCounter = 0;
const CYCLE_MS = 4000;
const PRIME_STEP = 997; // gcd(997, 4000) === 1  →  4000 unique offsets

export default function CardSlideshow({ images, alt }: CardSlideshowProps) {
  const [idx, setIdx] = useState(0);
  const [portraitFlags, setPortraitFlags] = useState<boolean[]>(() =>
    Array(images.length).fill(false)
  );
  // Capture the stagger offset once on mount via a ref so it never changes.
  const delay = useRef((instanceCounter++ * PRIME_STEP) % CYCLE_MS);

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
      }, CYCLE_MS);
    }, delay.current);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [images.length]);

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
