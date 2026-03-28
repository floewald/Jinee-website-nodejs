"use client";

import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";
import { useLightbox } from "@/hooks/useLightbox";
import type { GalleryImage } from "./Lightbox";

interface GalleryWithLightboxProps {
  images: GalleryImage[];
  /** Render the Slideshow hero above the grid (project pages only). */
  showSlideshow?: boolean;
  /** Use CSS columns layout for balanced portrait/landscape distribution. */
  useColumnsLayout?: boolean;
}

export default function GalleryWithLightbox({
  images,
  showSlideshow = false,
  useColumnsLayout = false,
}: GalleryWithLightboxProps) {
  const { isOpen, currentIndex, open, close, next, prev } = useLightbox(images);

  return (
    <>
      {showSlideshow && images.length > 0 && <Slideshow images={images} />}
      <GalleryGrid images={images} onImageClick={open} useColumnsLayout={useColumnsLayout} />
      <Lightbox
        images={images}
        isOpen={isOpen}
        currentIndex={currentIndex}
        onClose={close}
        onNext={next}
        onPrev={prev}
      />
    </>
  );
}
