import { useState, useCallback } from "react";

export interface LightboxImage {
  src: string;
  alt: string;
}

export interface UseLightboxReturn {
  isOpen: boolean;
  currentIndex: number;
  current: LightboxImage | undefined;
  count: number;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

/**
 * Manages lightbox open/close state and navigation across an array of images.
 * Wraps around at both ends.
 */
export function useLightbox(images: LightboxImage[]): UseLightboxReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
    isOpen,
    currentIndex,
    current: images[currentIndex],
    count: images.length,
    open,
    close,
    next,
    prev,
    goTo,
  };
}
