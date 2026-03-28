"use client";

import Image from "next/image";
import Masonry from "react-masonry-css";
import type { GalleryImage } from "./Lightbox";

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

const BREAKPOINT_COLS = {
  default: 3,
  900: 2,
  480: 1,
};

export default function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  if (images.length === 0) return null;

  return (
    <Masonry
      breakpointCols={BREAKPOINT_COLS}
      className="project-gallery"
      columnClassName="project-gallery__col"
    >
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
            height={0}
            loading="lazy"
            className="gallery-img"
            sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw"
            unoptimized
            style={{ height: "auto" }}
            {...(img.blur ? { placeholder: "blur" as const, blurDataURL: img.blur } : {})}
          />
        </button>
      ))}
    </Masonry>
  );
}
