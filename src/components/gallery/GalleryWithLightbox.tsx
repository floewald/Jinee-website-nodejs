"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/styled-system/css";
import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";
import { useHydrated } from "@/hooks/useHydrated";
import { useLightbox } from "@/hooks/useLightbox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { GalleryImage } from "./Lightbox";
import {
  galleryCols,
  galleryColsItem,
  galleryPlaceholderSurface,
  galleryResponsiveShellDesktop,
  galleryResponsiveShellMobile,
} from "./gallery-styles";

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

function getPlaceholderAspectRatio(image: GalleryImage) {
  if (image.width && image.height && image.width > 0 && image.height > 0) {
    return `${image.width} / ${image.height}`;
  }

  return "3 / 2";
}

function ResponsiveGalleryPlaceholder({
  desktopImages,
  mobileImages,
}: {
  desktopImages: GalleryImage[];
  mobileImages: GalleryImage[];
}) {
  function renderShell(images: GalleryImage[]) {
    return (
      <div
        className={cx(galleryCols, "gallery-cols")}
        data-gallery-placeholder="responsive"
        aria-hidden="true"
      >
        {images.map((image, index) => (
          <div
            key={`${image.src}-${index}-placeholder`}
            className={galleryColsItem}
          >
            <div
              className={galleryPlaceholderSurface}
              style={{ aspectRatio: getPlaceholderAspectRatio(image) }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={galleryResponsiveShellDesktop}>{renderShell(desktopImages)}</div>
      <div className={galleryResponsiveShellMobile}>{renderShell(mobileImages)}</div>
    </>
  );
}

export default function GalleryWithLightbox({
  images,
  mobileImages,
  showSlideshow = false,
  useColumnsLayout = false,
}: GalleryWithLightboxProps) {
  const isHydrated = useHydrated();
  const isMobile = useMediaQuery(MOBILE_GALLERY_QUERY);
  const hasCuratedMobileSubset = !!mobileImages && mobileImages.length > 0;
  const renderedImages =
    hasCuratedMobileSubset && isMobile && mobileImages ? mobileImages : images;

  const { isOpen, currentIndex, open, close, next, prev } = useLightbox(renderedImages);
  const previousIsMobile = useRef(isMobile);

  useEffect(() => {
    if (previousIsMobile.current !== isMobile && isOpen) {
      close();
    }
    previousIsMobile.current = isMobile;
  }, [close, isMobile, isOpen]);

  function handleOpen(index: number) {
    open(index);
  }

  // Static export cannot know the viewport during HTML generation. Rendering a
  // lightweight shell first prevents mobile clients from receiving the desktop
  // collage dataset and preloading the wrong image set before hydration.
  if (hasCuratedMobileSubset && mobileImages && !isHydrated) {
    return (
      <ResponsiveGalleryPlaceholder
        desktopImages={images}
        mobileImages={mobileImages}
      />
    );
  }

  return (
    <>
      {showSlideshow && renderedImages.length > 0 && <Slideshow images={renderedImages} />}
      <GalleryGrid
        images={renderedImages}
        onImageClick={handleOpen}
        useColumnsLayout={useColumnsLayout}
      />
      <Lightbox
        images={renderedImages}
        isOpen={isOpen}
        currentIndex={currentIndex}
        onClose={close}
        onNext={next}
        onPrev={prev}
      />
    </>
  );
}
