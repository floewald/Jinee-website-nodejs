"use client";

import { useEffect, useMemo, useRef } from "react";
import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";
import { useLightbox } from "@/hooks/useLightbox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { GalleryImage } from "./Lightbox";

interface GalleryWithLightboxProps {
  images: GalleryImage[];
  /** Optional curated subset shown on mobile while desktop keeps the full set. */
  mobileImages?: GalleryImage[];
  /** Render the Slideshow hero above the grid (project pages only). */
  showSlideshow?: boolean;
  /** Use CSS columns layout for balanced portrait/landscape distribution. */
  useColumnsLayout?: boolean;
}

const MOBILE_GALLERY_QUERY = "(max-width: 800px)";

function imageKey(image: GalleryImage): string {
  return image.srcFull ?? image.src;
}

export default function GalleryWithLightbox({
  images,
  mobileImages,
  showSlideshow = false,
  useColumnsLayout = false,
}: GalleryWithLightboxProps) {
  const isMobile = useMediaQuery(MOBILE_GALLERY_QUERY);
  const hasCuratedMobileSubset = !!mobileImages && mobileImages.length > 0;
  const activeImages =
    hasCuratedMobileSubset && isMobile && mobileImages ? mobileImages : images;

  const hiddenOnMobileIndices = useMemo(() => {
    if (!hasCuratedMobileSubset || !mobileImages) return [];

    const mobileKeys = new Set(mobileImages.map(imageKey));
    return images.flatMap((image, index) =>
      mobileKeys.has(imageKey(image)) ? [] : [index]
    );
  }, [hasCuratedMobileSubset, images, mobileImages]);

  const activeIndexBySourceIndex = useMemo(() => {
    if (!hasCuratedMobileSubset || !mobileImages || !isMobile) {
      return new Map(images.map((_, index) => [index, index]));
    }

    const mobileIndexByKey = new Map(
      mobileImages.map((image, index) => [imageKey(image), index])
    );

    return new Map(
      images.flatMap((image, sourceIndex) => {
        const activeIndex = mobileIndexByKey.get(imageKey(image));
        return activeIndex === undefined ? [] : [[sourceIndex, activeIndex] as const];
      })
    );
  }, [hasCuratedMobileSubset, images, isMobile, mobileImages]);

  const { isOpen, currentIndex, open, close, next, prev } = useLightbox(activeImages);
  const previousIsMobile = useRef(isMobile);

  useEffect(() => {
    if (previousIsMobile.current !== isMobile && isOpen) {
      close();
    }
    previousIsMobile.current = isMobile;
  }, [close, isMobile, isOpen]);

  function handleOpen(sourceIndex: number) {
    const activeIndex = activeIndexBySourceIndex.get(sourceIndex);
    if (activeIndex !== undefined) {
      open(activeIndex);
    }
  }

  return (
    <>
      {showSlideshow && activeImages.length > 0 && <Slideshow images={activeImages} />}
      <GalleryGrid
        images={images}
        onImageClick={handleOpen}
        useColumnsLayout={useColumnsLayout}
        hiddenOnMobileIndices={hiddenOnMobileIndices}
      />
      <Lightbox
        images={activeImages}
        isOpen={isOpen}
        currentIndex={currentIndex}
        onClose={close}
        onNext={next}
        onPrev={prev}
      />
    </>
  );
}
