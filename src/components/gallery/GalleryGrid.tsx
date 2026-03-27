"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "./Lightbox";

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

export default function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  const [portraitFlags, setPortraitFlags] = useState<boolean[]>(() =>
    Array(images.length).fill(false)
  );

  if (images.length === 0) return null;

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>, index: number) {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth) {
      setPortraitFlags((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    }
  }

  return (
    <div className="project-gallery">
      {images.map((img, i) => (
        <button
          key={`${img.src}-${i}`}
          className={`gallery-item${portraitFlags[i] ? " gallery-item--portrait" : ""}`}
          onClick={() => onImageClick(i)}
          aria-label={`Open image: ${img.alt}`}
        >
          {portraitFlags[i] && (
            <div
              className="gallery-portrait-bg"
              style={{ backgroundImage: `url("${img.src}")` }}
              aria-hidden="true"
            />
          )}
          {portraitFlags[i] ? (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="gallery-img"
              style={{ objectFit: "contain", zIndex: 1 }}
              unoptimized
              onLoad={(e) => handleLoad(e, i)}
            />
          ) : (
            <Image
              src={img.src}
              alt={img.alt}
              width={800}
              height={534}
              loading="lazy"
              className="gallery-img"
              unoptimized
              onLoad={(e) => handleLoad(e, i)}
            />
          )}
        </button>
      ))}
    </div>
  );
}
