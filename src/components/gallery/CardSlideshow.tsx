"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface CardSlideshowProps {
  images: string[];
  alt: string;
}

// Module-level counter: each card instance gets a different stagger bucket
// (0 ms, ~1.3 s, ~2.6 s, ~3.9 s, then wraps). This avoids calling Math.random
// during render and produces a stable, evenly-distributed stagger.
let instanceCounter = 0;
const STAGGER_STEP = 1333; // ms  (4000 / 3 ≈ 1333)
const NUM_BUCKETS = 3;

export default function CardSlideshow({ images, alt }: CardSlideshowProps) {
  const [idx, setIdx] = useState(0);
  // Capture the stagger offset once on mount via a ref so it never changes.
  const delay = useRef((instanceCounter++ % NUM_BUCKETS) * STAGGER_STEP);

  useEffect(() => {
    if (images.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      setIdx((prev) => (prev + 1) % images.length);
      intervalId = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
      }, 4000);
    }, delay.current);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [images.length]);

  return (
    <div className="card-slideshow">
      {images.map((src, i) => (
        <div
          key={src}
          className={`card-slideshow__slide${i === idx ? " card-slideshow__slide--active" : ""}`}
        >
          <Image
            src={src}
            alt={i === 0 ? alt : ""}
            fill
            className="project-card__img"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
