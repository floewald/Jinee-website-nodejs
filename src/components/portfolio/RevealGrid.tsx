"use client";

import { useRef, useEffect } from "react";

interface RevealGridProps {
  children: React.ReactNode;
  /** Optional CSS class applied to the wrapper div */
  className?: string;
}

const REVEAL_BOTTOM_BUFFER_PX = 160;
const REVEAL_SIDE_BUFFER_PX = 50;

function isWithinRevealRange(rect: DOMRect) {
  return (
    rect.top < window.innerHeight + REVEAL_BOTTOM_BUFFER_PX &&
    rect.bottom > -REVEAL_BOTTOM_BUFFER_PX &&
    rect.left < window.innerWidth + REVEAL_SIDE_BUFFER_PX &&
    rect.right > -REVEAL_SIDE_BUFFER_PX
  );
}

/**
 * Thin client wrapper that adds scroll-triggered slide-in animation to
 * .project-card and .gallery-item children via IntersectionObserver.
 * Keeps parent pages as Server Components.
 */
export default function RevealGrid({ children, className }: RevealGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>(".project-card, .gallery-item, .instagram-preview")
    );
    if (!items.length) return;

    // Pre-mark items already in viewport so they never jump on mount
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (isWithinRevealRange(rect)) {
        item.classList.add("reveal--visible");
      }
    });
    container.setAttribute("data-reveal-ready", "");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: `0px ${REVEAL_SIDE_BUFFER_PX}px ${REVEAL_BOTTOM_BUFFER_PX}px ${REVEAL_SIDE_BUFFER_PX}px`,
      }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
