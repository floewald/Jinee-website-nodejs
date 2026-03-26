"use client";

import Image from "next/image";
import type { GalleryImage } from "./Lightbox";

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

export default function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  if (images.length === 0) return null;

  return (
    <div className="project-gallery">
      {images.map((img, i) => (
        <button
          key={`${img.src}-${i}`}
          className="gallery-item"
          onClick={() => onImageClick(i)}
          aria-label={`Open image: ${img.alt}`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={800}
            height={534}
            loading="lazy"
            className="gallery-img"
            unoptimized
          />
        </button>
      ))}
    </div>
  );
}
