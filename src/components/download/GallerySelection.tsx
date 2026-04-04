"use client";

import Image from "next/image";
import Masonry from "react-masonry-css";
import type { GalleryImage } from "@/components/gallery/Lightbox";

const BREAKPOINT_COLS = { default: 3, 900: 2, 480: 1 };

interface GallerySelectionProps {
  images: GalleryImage[];
  selectionMode: boolean;
  selected: string[];
  onImageClick: (index: number) => void;
  onSelectionChange: (filename: string, checked: boolean) => void;
}

/** Converts a WebP src path to the .jpg basename used for download. */
function toDownloadFilename(src: string): string {
  return src.split("/").pop()!.replace(/\.webp$/i, ".jpg");
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
      className={`project-gallery${selectionMode ? " selection-mode" : ""}`}
      columnClassName="project-gallery__col"
    >
      {images.map((img, i) => {
        const filename = toDownloadFilename(img.src);
        const isChecked = selected.includes(filename);

        return (
          <div key={`${img.src}-${i}`} className="gallery-item">
            <button
              className="gallery-item__trigger"
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
                className="gallery-img"
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
                    d="M 3 13 Q 7.5 18.5 19 5"
                    stroke="#1f1f1f"
                    strokeWidth="2.2"
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
