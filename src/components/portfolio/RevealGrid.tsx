"use client";

import { useRef, useEffect } from "react";

interface RevealGridProps {
  children: React.ReactNode;
  /** Optional CSS class applied to the wrapper div */
  className?: string;
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
      if (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
      ) {
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
      { threshold: 0.01, rootMargin: "0px 50px 0px 0px" }
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
