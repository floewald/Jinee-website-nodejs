"use client";

import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import { useLightbox } from "@/hooks/useLightbox";
import type { GalleryImage } from "./Lightbox";

interface GalleryWithLightboxProps {
  images: GalleryImage[];
}

export default function GalleryWithLightbox({ images }: GalleryWithLightboxProps) {
  const { isOpen, currentIndex, open, close, next, prev } = useLightbox(images);

  return (
    <>
      <GalleryGrid images={images} onImageClick={open} />
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
