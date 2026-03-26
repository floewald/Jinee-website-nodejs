"use client";

import { useEffect } from "react";
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
        <div className="lightbox__frame">
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
