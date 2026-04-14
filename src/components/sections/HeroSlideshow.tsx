"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { css, cx } from "@/styled-system/css";

const heroSectionStyle = css({
  position: "relative",
  width: "100%",
  overflow: "hidden",
  padding: 0,
  margin: 0,
  height: "var(--hero-height)",
});

const heroSlide = css({
  position: "absolute",
  inset: 0,
  opacity: 0,
  transition: "opacity 0.9s ease-in-out",
});

const heroSlideActive = css({ opacity: 1 });

const heroSlideWhiteBg = css({ backgroundColor: "#ffffff" });

const heroBgBlur = css({
  position: "absolute",
  inset: "-8%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "blur(28px)",
  opacity: 0.85,
  zIndex: 0,
});

const heroImgStyle = css({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

const heroImgContain = css({
  objectFit: "contain",
  position: "relative",
  zIndex: 1,
});

export interface HeroSlide {
  src: string;
  alt: string;
  /**
   * CSS object-position for cover mode, e.g. "center 30%" (default: "center").
   * 0% = top, 50% = center, 100% = bottom.
   * Has no effect in blur/white modes.
   */
  objectPosition?: string;
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
    <section className={cx(heroSectionStyle, "hero-section")} aria-label="Hero slideshow">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={cx(
            heroSlide,
            "hero-slide",
            i === current && heroSlideActive,
            i === current && "hero-slide--active",
            fit === "white" && heroSlideWhiteBg,
            fit === "white" && "hero-slide--white-bg",
          )}
          aria-hidden={i !== current}
        >
          {fit === "blur" && (
            <div
              className={cx(heroBgBlur, "hero-slide__bg-blur")}
              style={{ backgroundImage: `url("${slide.src}")` }}
              aria-hidden="true"
            />
          )}
          <Image
            src={slide.src}
            alt={slide.alt}
            width={1600}
            height={900}
            priority={i === 0}
            loading="eager"
            className={cx(
              heroImgStyle,
              "hero-img",
              fit !== "cover" && heroImgContain,
              fit !== "cover" && "hero-img--contain",
            )}
            style={fit === "cover" && slide.objectPosition
              ? { objectPosition: slide.objectPosition }
              : undefined}
            unoptimized
          />
        </div>
      ))}
    </section>
  );
}
