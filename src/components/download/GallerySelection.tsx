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
                if (!selectionMode) onImageClick(i);
              }}
              aria-label={`Open image: ${img.alt}`}
              tabIndex={selectionMode ? -1 : 0}
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
                />
              </label>
            )}
          </div>
        );
      })}
    </Masonry>
  );
}
