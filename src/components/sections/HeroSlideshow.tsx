"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface HeroSlide {
  src: string;
  alt: string;
}

export type HeroFit = "cover" | "blur" | "white";

interface HeroSlideshowProps {
  slides: HeroSlide[];
  /** Milliseconds each slide is shown. Default: 4000 */
  intervalMs?: number;
  /**
   * How to handle images that don't fill the hero area:
   * - "cover" (default): crops to fill — works best for landscape images
   * - "blur": blurred background behind contained image — best for portrait/mixed
   * - "white": white background behind contained image
   */
  fit?: HeroFit;
}

export default function HeroSlideshow({
  slides,
  intervalMs = 4000,
  fit = "cover",
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
          className={[
            "hero-slide",
            i === current ? "hero-slide--active" : "",
            fit === "white" ? "hero-slide--white-bg" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden={i !== current}
        >
          {fit === "blur" && (
            <div
              className="hero-slide__bg-blur"
              style={{ backgroundImage: `url(${slide.src})` }}
              aria-hidden="true"
            />
          )}
          <Image
            src={slide.src}
            alt={slide.alt}
            width={1600}
            height={900}
            priority={i === 0}
            className={`hero-img${fit !== "cover" ? " hero-img--contain" : ""}`}
            unoptimized
          />
        </div>
      ))}
    </section>
  );
}
