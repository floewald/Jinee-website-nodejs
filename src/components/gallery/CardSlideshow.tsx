"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface CardSlideshowProps {
  images: string[];
  alt: string;
}

export default function CardSlideshow({ images, alt }: CardSlideshowProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
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
