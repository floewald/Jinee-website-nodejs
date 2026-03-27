"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface GalleryImage {
  src: string;
  alt: string;
  srcFull?: string;
}

interface LightboxProps {
  images: GalleryImage[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  images,
  isOpen,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  // Track (index → size) pair so stale sizes are ignored automatically.
  const [sizeState, setSizeState] = useState<{
    index: number;
    size: { w: number; h: number } | null;
  }>({ index: currentIndex, size: null });

  // Derive natural size: only valid for the current image index.
  const naturalSize = sizeState.index === currentIndex ? sizeState.size : null;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];
  const imgSrc = current.srcFull ?? current.src;

  const isPortrait = naturalSize ? naturalSize.h > naturalSize.w : false;
  const lbRatio =
    naturalSize && naturalSize.w > 0
      ? `${naturalSize.w} / ${naturalSize.h}`
      : "3 / 2";

  return (
    <div
      className="lightbox"
      aria-hidden={!isOpen}
    >
      <div
        className="lightbox__backdrop"
        data-testid="lightbox-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={current.alt}
        className="lightbox__content"
      >
        <div
          className="lightbox__frame"
          style={{ "--lb-ratio": lbRatio } as React.CSSProperties}
        >
          {/* Blurred background for portrait images */}
          {isPortrait && (
            <div
              className="lightbox__portrait-bg"
              style={{ backgroundImage: `url(${imgSrc})` }}
              aria-hidden="true"
            />
          )}

          <button
            className="lightbox__btn lightbox__prev"
            onClick={onPrev}
            aria-label="Previous"
          >
            ◀
          </button>

          <div className="lightbox__img-wrap">
            <Image
              src={imgSrc}
              alt={current.alt}
              fill
              className="lightbox__img"
              style={{ objectFit: "contain" }}
              sizes="100vw"
              unoptimized
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0) {
                  setSizeState({ index: currentIndex, size: { w: img.naturalWidth, h: img.naturalHeight } });
                }
              }}
            />
          </div>

          <button
            className="lightbox__btn lightbox__next"
            onClick={onNext}
            aria-label="Next"
          >
            ▶
          </button>

          <button
            className="lightbox__btn lightbox__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="lightbox__counter" aria-live="polite">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

