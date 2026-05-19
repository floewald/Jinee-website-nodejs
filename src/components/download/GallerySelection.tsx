"use client";

import { useRef } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { cx } from "@/styled-system/css";
import { animateRevealElement, isElementWithinRevealRange } from "@/lib/reveal-helpers";
import { useLoadedGalleryReveal } from "@/hooks/useLoadedGalleryReveal";
import type { GalleryImage } from "@/components/gallery/Lightbox";
import {
  projectGallery,
  projectGalleryCol,
  galleryItem,
  galleryItemTrigger,
  galleryImg,
} from "@/components/gallery/gallery-styles";
import {
  galleryCheckbox,
  inlineSelect,
  galleryCheckboxIcon,
} from "./download-styles";

const BREAKPOINT_COLS = { default: 3, 900: 2, 480: 1 };

interface GallerySelectionProps {
  images: GalleryImage[];
  selectionMode: boolean;
  selected: string[];
  onImageClick: (index: number) => void;
  onSelectionChange: (filename: string, checked: boolean) => void;
}

/** Converts a WebP src path to the basename used for download. */
function toDownloadFilename(src: string): string {
  return src.split("/").pop()!;
}

export default function GallerySelection({
  images,
  selectionMode,
  selected,
  onImageClick,
  onSelectionChange,
}: GallerySelectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useLoadedGalleryReveal(containerRef);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    // Same fail-open rule as GalleryGrid: selection mode must stay usable even
    // if timing is odd, so load can add motion but never gate visibility.
    const item = e.currentTarget.closest(".gallery-item");
    if (item instanceof HTMLElement && isElementWithinRevealRange(item)) {
      animateRevealElement(item);
    }
  }

  return (
    <div ref={containerRef}>
      <Masonry
        breakpointCols={BREAKPOINT_COLS}
        className={cx(projectGallery, "project-gallery", selectionMode && "selection-mode")}
        columnClassName={cx(projectGalleryCol, "project-gallery__col")}
      >
        {images.map((img, i) => {
          const filename = toDownloadFilename(img.src);
          const isChecked = selected.includes(filename);

          return (
            <div key={`${img.src}-${i}`} className={cx(galleryItem, "gallery-item")}>
              <button
                className={cx(galleryItemTrigger, "gallery-item__trigger")}
                onClick={() => {
                  if (selectionMode) {
                    onSelectionChange(filename, !isChecked);
                  } else {
                    onImageClick(i);
                  }
                }}
                aria-label={
                  selectionMode
                    ? `${isChecked ? "Deselect" : "Select"} ${img.alt}`
                    : `Open image: ${img.alt}`
                }
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width ?? 800}
                  height={img.height ?? 0}
                  loading="lazy"
                  className={cx(galleryImg, "gallery-img")}
                  unoptimized
                  onLoad={handleImageLoad}
                />
              </button>

              {selectionMode && (
                <label className={cx(galleryCheckbox, "gallery-checkbox")}>
                  <input
                    type="checkbox"
                    className={cx(inlineSelect, "inline-select")}
                    aria-label={`Select ${img.alt} for download`}
                    value={filename}
                    checked={isChecked}
                    onChange={(e) =>
                      onSelectionChange(filename, e.target.checked)
                    }
                    tabIndex={-1}
                  />
                  <svg
                    className={cx(galleryCheckboxIcon, "gallery-checkbox-icon")}
                    viewBox="0 0 22 22"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M 3.5 11.5 L 8.5 16.5 L 19 5"
                      stroke="#595959"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label>
              )}
            </div>
          );
        })}
      </Masonry>
    </div>
  );
}
