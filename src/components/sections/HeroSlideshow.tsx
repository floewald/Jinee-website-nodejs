"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroSlideshowProps {
  slides: HeroSlide[];
  /** Milliseconds each slide is shown. Default: 4000 */
  intervalMs?: number;
}

export default function HeroSlideshow({
  slides,
  intervalMs = 4000,
}: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    timer.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slides.length, intervalMs]);

  if (slides.length === 0) return null;

  return (
    <section className="hero-section" aria-label="Hero slideshow">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`hero-slide${i === current ? " hero-slide--active" : ""}`}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            width={1600}
            height={900}
            priority={i === 0}
            className="hero-img"
            unoptimized
          />
        </div>
      ))}
    </section>
  );
}
