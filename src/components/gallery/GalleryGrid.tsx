"use client";

import Image from "next/image";
import Masonry from "react-masonry-css";
import { cx } from "@/styled-system/css";
import type { GalleryImage } from "./Lightbox";
import {
  projectGallery,
  projectGalleryCol,
  galleryCols,
  galleryColsItem,
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
  if (images.length === 0) return null;

  const inColumns = useColumnsLayout;

  const galleryItems = images.map((img, i) => (
    <button
      key={`${img.src}-${i}`}
      className={cx(
        inColumns ? galleryColsItem : undefined,
        galleryItem,
        "gallery-item",
      )}
      onClick={() => onImageClick(i)}
      aria-label={`Open image: ${img.alt}`}
    >
      <Image
        src={img.src}
        alt={img.alt}
        width={800}
        height={0}
        loading="lazy"
        className={cx(galleryImg, "gallery-img")}
        unoptimized
        style={{ height: "auto" }}
        {...(img.blur ? { placeholder: "blur" as const, blurDataURL: img.blur } : {})}
      />
    </button>
  ));

  if (useColumnsLayout) {
    return (
      <div className={cx(galleryCols, "gallery-cols")}>
        {galleryItems}
      </div>
    );
  }

  return (
    <div>
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
