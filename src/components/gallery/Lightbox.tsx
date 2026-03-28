"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSwipe } from "@/hooks/useSwipe";

export interface GalleryImage {
  src: string;
  alt: string;
  srcFull?: string;
  blur?: string;
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
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const movedDuringDragRef = useRef(false);

  // Derive natural size: only valid for the current image index.
  const naturalSize = sizeState.index === currentIndex ? sizeState.size : null;

  // Reset refs when the lightbox closes. Ref mutations in effects are fine;
  // only synchronous setState in effects triggers the set-state-in-effect rule.
  useEffect(() => {
    if (!isOpen) {
      dragStartRef.current = null;
      movedDuringDragRef.current = false;
    }
  }, [isOpen]);


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

    // Ignore click that follows a drag gesture.
    if (movedDuringDragRef.current) {
      movedDuringDragRef.current = false;
      return;
    }

    if (zoomed) {
      setZoomedIndex(null);
    } else {
      // Reset pan & drag state before zooming in so no stale values persist.
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
      setZoomedIndex(currentIndex);
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomed) return;

    // Only primary mouse button should start panning.
    if (e.pointerType === "mouse" && e.button !== 0) return;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    movedDuringDragRef.current = false;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomed || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      movedDuringDragRef.current = true;
    }

    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomed) return;
    dragStartRef.current = null;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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
            cursor: zoomed ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            touchAction: zoomed ? "none" : "auto",
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
              transform: zoomed
                ? `translate3d(${pan.x}px, ${pan.y}px, 0) scale(2.2)`
                : "translate3d(0, 0, 0) scale(1)",
              transformOrigin: "center center",
              willChange: zoomed ? "transform" : undefined,
              transition: zoomed && isDragging ? "none" : "transform 0.25s ease",
              cursor: zoomed ? (isDragging ? "grabbing" : "grab") : "auto",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => {
              if (zoomed) e.preventDefault();
            }}
          >
            <Image
              src={imgSrc}
              alt={current.alt}
              fill
              className="lightbox__img"
              style={{ objectFit: "contain" }}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              sizes="100vw"
              unoptimized
              {...(current.blur ? { placeholder: "blur" as const, blurDataURL: current.blur } : {})}
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

