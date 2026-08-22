"use client";

import { useRef, type ReactNode } from "react";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";
import {
  SOCIAL_PREVIEW_REVEAL_PRESET,
  TEASER_REVEAL_PRESET,
} from "@/lib/reveal-config";
import { cx } from "@/styled-system/css";
import { revealGrid } from "./featured-styles";

interface RevealGridProps {
  children: ReactNode;
  /** Optional CSS class applied to the wrapper div */
  className?: string;
}

const PROJECT_CARD_SELECTOR = ".project-card";
const SOCIAL_PREVIEW_SELECTOR = ".instagram-preview";

/**
 * Thin client wrapper that adds fail-open scroll-linked motion to teaser
 * content. Children stay visible by default; the observer only adds polish.
 * Keeps parent pages as Server Components.
 */
export default function RevealGrid({ children, className }: RevealGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLinkedReveal(ref, PROJECT_CARD_SELECTOR, TEASER_REVEAL_PRESET);
  useScrollLinkedReveal(ref, SOCIAL_PREVIEW_SELECTOR, SOCIAL_PREVIEW_REVEAL_PRESET);

  return (
    <div ref={ref} className={cx(revealGrid, className)}>
      {children}
    </div>
  );
}
