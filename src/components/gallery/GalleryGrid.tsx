"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import type { GalleryImage } from "./Lightbox";

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
  /**
   * When true, uses CSS columns layout instead of react-masonry-css.
   * Better for mixed portrait/landscape images: browser balances column heights.
   */
  useColumnsLayout?: boolean;
}

const BREAKPOINT_COLS = {
  default: 3,
  900: 2,
  480: 1,
};

export default function GalleryGrid({
  images,
  onImageClick,
  useColumnsLayout = false,
}: GalleryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll<HTMLElement>(".gallery-item")
    );
    if (items.length === 0) return;

    // Pre-mark items already in viewport so they never jump when data-reveal-ready is added
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
      ) {
        item.classList.add("reveal--visible");
      }
    });
    // Set attribute AFTER pre-marking so visible items stay put (no translateY flash)
    container.setAttribute("data-reveal-ready", "");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 50px 0px 0px" }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [images]);

  if (images.length === 0) return null;

  const galleryItems = images.map((img, i) => (
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
  ));

  if (useColumnsLayout) {
    return (
      <div ref={containerRef} className="gallery-cols">
        {galleryItems}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <Masonry
        breakpointCols={BREAKPOINT_COLS}
        className="project-gallery"
        columnClassName="project-gallery__col"
      >
        {galleryItems}
      </Masonry>
    </div>
  );
}
