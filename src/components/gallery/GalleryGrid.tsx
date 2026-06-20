"use client";

import { useRef } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { cx } from "@/styled-system/css";
import {
  isElementWithinRevealRange,
  revealElement,
} from "@/lib/reveal-helpers";
import { useLoadedGalleryReveal } from "@/hooks/useLoadedGalleryReveal";
import type { GalleryImage } from "./Lightbox";
import {
  projectGallery,
  projectGalleryCol,
  galleryCols,
  galleryColsItem,
  galleryColsItemHideOnMobile,
  galleryItem,
  galleryImg,
} from "./gallery-styles";

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
  /**
   * When true, uses CSS columns layout instead of react-masonry-css.
   * Better for mixed portrait/landscape images: browser balances column heights.
   */
  useColumnsLayout?: boolean;
  /** Indices that should stay in the DOM but disappear on mobile. */
  hiddenOnMobileIndices?: number[];
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
  hiddenOnMobileIndices = [],
}: GalleryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useLoadedGalleryReveal(containerRef);
  const hiddenOnMobile = new Set(hiddenOnMobileIndices);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    // Gallery tiles use image-load reveal, not viewport reveal, because the
    // gallery must stay visible even if layout settles late on Safari.
    const item = e.currentTarget.closest(".gallery-item");
    if (item instanceof HTMLElement && isElementWithinRevealRange(item)) {
      revealElement(item);
    }
  }

  if (images.length === 0) return null;

  const inColumns = useColumnsLayout;

  const galleryItems = images.map((img, i) => (
    <button
      key={`${img.src}-${i}`}
      className={cx(
        inColumns ? galleryColsItem : undefined,
        inColumns && hiddenOnMobile.has(i) ? galleryColsItemHideOnMobile : undefined,
        galleryItem,
        "gallery-item",
      )}
      onClick={() => onImageClick(i)}
      aria-label={`Open image: ${img.alt}`}
    >
      <Image
        src={img.src}
        alt={img.alt}
        width={img.width ?? 800}
        height={img.height ?? 0}
        loading="lazy"
        className={cx(galleryImg, "gallery-img")}
        unoptimized
        style={{ height: "auto" }}
        {...(img.blur ? { placeholder: "blur" as const, blurDataURL: img.blur } : {})}
        onLoad={handleImageLoad}
      />
    </button>
  ));

  if (useColumnsLayout) {
    return (
      <div ref={containerRef} className={cx(galleryCols, "gallery-cols")}>
        {galleryItems}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <Masonry
        breakpointCols={BREAKPOINT_COLS}
        className={cx(projectGallery, "project-gallery")}
        columnClassName={cx(projectGalleryCol, "project-gallery__col")}
      >
        {galleryItems}
      </Masonry>
    </div>
  );
}
