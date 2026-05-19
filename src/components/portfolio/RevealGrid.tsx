"use client";

import { useRef } from "react";
import { useProgressiveReveal } from "@/hooks/useProgressiveReveal";

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
  useProgressiveReveal(ref, ".project-card, .gallery-item, .instagram-preview");

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
