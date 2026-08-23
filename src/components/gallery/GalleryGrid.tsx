"use client";

import { useId, useRef, type SyntheticEvent } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { cx } from "@/styled-system/css";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";
import {
  COLLAGE_REVEAL_PRESET,
  GALLERY_REVEAL_PRESET,
} from "@/lib/reveal-config";
import { notifyRevealLayoutInvalidated } from "@/lib/reveal-helpers";
import type { GalleryImage } from "./Lightbox";
import {
  projectGallery,
  projectGalleryCol,
  galleryCols,
  galleryColsItem,
  galleryItem,
  galleryItemRelaxedReveal,
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
  const galleryInstanceId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const revealKey = `${useColumnsLayout ? "columns" : "masonry"}:${images
    .map((image) => image.srcFull ?? image.src)
    .join("|")}`;
  const revealPreset = useColumnsLayout ? COLLAGE_REVEAL_PRESET : GALLERY_REVEAL_PRESET;
  useScrollLinkedReveal(containerRef, ".gallery-item", {
    ...revealPreset,
    resetKey: revealKey,
  });

  if (images.length === 0) return null;

  const inColumns = useColumnsLayout;

  function isPriorityImageIndex(index: number) {
    if (!useColumnsLayout) return index < 3;
    return images.length <= 5 ? index < 3 : index < 4;
  }

  function handleImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const item = e.currentTarget.closest(".gallery-item");
    if (item instanceof HTMLElement) {
      item.dataset.revealImageLoaded = "true";
    }
    notifyRevealLayoutInvalidated();
  }

  const galleryItems = images.map((img, i) => (
    <button
      key={`${img.src}-${i}`}
      data-gallery-index={i}
      data-gallery-alt={img.alt}
      data-gallery-src={img.srcFull ?? img.src}
      data-reveal-debug-id={`${galleryInstanceId}:${i}`}
      className={cx(
        inColumns ? galleryColsItem : undefined,
        inColumns ? galleryItemRelaxedReveal : undefined,
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
        loading={isPriorityImageIndex(i) ? "eager" : "lazy"}
        fetchPriority={isPriorityImageIndex(i) ? "high" : undefined}
        onLoad={handleImageLoad}
        className={cx(galleryImg, "gallery-img")}
        unoptimized
        style={{ height: "auto" }}
        {...(img.blur ? { placeholder: "blur" as const, blurDataURL: img.blur } : {})}
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
