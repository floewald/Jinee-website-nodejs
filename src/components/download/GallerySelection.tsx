"use client";

import Image from "next/image";
import Masonry from "react-masonry-css";
import { cx } from "@/styled-system/css";
import type { GalleryImage } from "@/components/gallery/Lightbox";
import {
  projectGallery,
  projectGalleryCol,
  galleryItem,
  galleryItemTrigger,
  galleryImg,
} from "@/components/gallery/gallery-styles";

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
  return (
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
                width={800}
                height={0}
                loading="lazy"
                className={cx(galleryImg, "gallery-img")}
                unoptimized
              />
            </button>

            {selectionMode && (
              <label className="gallery-checkbox">
                <input
                  type="checkbox"
                  className="inline-select"
                  aria-label={`Select ${img.alt} for download`}
                  value={filename}
                  checked={isChecked}
                  onChange={(e) =>
                    onSelectionChange(filename, e.target.checked)
                  }
                  tabIndex={-1}
                />
                <svg
                  className="gallery-checkbox-icon"
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
  );
}
