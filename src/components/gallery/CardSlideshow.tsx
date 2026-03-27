"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface CardSlideshowProps {
  images: string[];
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

  useEffect(() => {
    if (images.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      setIdx((prev) => (prev + 1) % images.length);
      intervalId = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
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
    <div className="card-slideshow">
      {images.map((src, i) => {
        const isPortrait = portraitFlags[i];
        return (
          <div
            key={src}
            className={`card-slideshow__slide${i === idx ? " card-slideshow__slide--active" : ""}${isPortrait ? " card-slideshow__slide--portrait" : ""}`}
          >
            {isPortrait && (
              <div
                className="card-slideshow__bg"
                style={{ backgroundImage: `url(${src})` }}
                aria-hidden="true"
              />
            )}
            <Image
              src={src}
              alt={i === 0 ? alt : ""}
              fill
              className="project-card__img"
              style={{ objectFit: isPortrait ? "contain" : "cover" }}
              unoptimized
              onLoad={(e) => handleLoad(e, i)}
            />
          </div>
        );
      })}
    </div>
  );
}
