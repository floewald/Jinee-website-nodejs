"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSwipe } from "@/hooks/useSwipe";

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

  // Zoom is keyed to the current image — deriving it from the index means zoom
  // resets automatically on navigation without needing an effect.
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const zoomed = zoomedIndex === currentIndex;

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

  // Swipe left/right to navigate (disabled while zoomed)
  const { handlers: swipeHandlers } = useSwipe({
    onSwipeLeft: zoomed ? undefined : onNext,
    onSwipeRight: zoomed ? undefined : onPrev,
  });

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];
  const imgSrc = current.srcFull ?? current.src;

  const isPortrait = naturalSize ? naturalSize.h > naturalSize.w : false;
  // Portrait images use the standard 3/2 landscape ratio so the frame shape
  // stays consistent — the image fits fully inside with blurred fill on the sides.
  const lbRatio =
    !isPortrait && naturalSize && naturalSize.w > 0
      ? `${naturalSize.w} / ${naturalSize.h}`
      : "3 / 2";

  function handleFrameClick(e: React.MouseEvent<HTMLDivElement>) {
    // Clicks on nav/close buttons must not toggle zoom
    if ((e.target as HTMLElement).closest(".lightbox__btn")) return;
    setZoomedIndex(zoomed ? null : currentIndex);
  }

  return createPortal(
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
          style={{
            "--lb-ratio": lbRatio,
            cursor: zoomed ? "zoom-out" : "zoom-in",
          } as React.CSSProperties}
          {...swipeHandlers}
          onClick={handleFrameClick}
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

          <div
            className="lightbox__img-wrap"
            style={{
              transform: zoomed ? "scale(2.2)" : "scale(1)",
              transition: "transform 0.25s ease",
            }}
          >
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
      </div>
    </div>,
    document.body
  );
}

