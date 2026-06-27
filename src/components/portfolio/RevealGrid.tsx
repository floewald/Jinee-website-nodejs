"use client";

import { useRef, type ReactNode } from "react";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";
import { GRID_REVEAL_PRESET } from "@/lib/reveal-config";
import { cx } from "@/styled-system/css";
import { revealGrid } from "./featured-styles";

interface RevealGridProps {
  children: ReactNode;
  /** Optional CSS class applied to the wrapper div */
  className?: string;
}

const REVEAL_TARGET_SELECTOR = ".project-card, .instagram-preview";

/**
 * Thin client wrapper that adds fail-open scroll-linked motion to teaser
 * content. Children stay visible by default; the observer only adds polish.
 * Keeps parent pages as Server Components.
 */
export default function RevealGrid({ children, className }: RevealGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLinkedReveal(ref, REVEAL_TARGET_SELECTOR, GRID_REVEAL_PRESET);

  return (
    <div ref={ref} className={cx(revealGrid, className)}>
      {children}
    </div>
  );
}
