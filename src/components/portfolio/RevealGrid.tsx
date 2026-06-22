"use client";

import {
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";

interface RevealGridProps {
  children: ReactNode;
  /** Optional CSS class applied to the wrapper div */
  className?: string;
}

const REVEAL_TARGET_SELECTOR = ".project-card, .instagram-preview";
const REVEAL_TARGET_STYLE_TEXT = [
  "opacity: var(--reveal-opacity, 1);",
  "transform: translateY(var(--reveal-translate-y, 0px));",
  "will-change: opacity, transform;",
].join(" ");

function applyRevealTargetStyle(item: HTMLElement) {
  const existingStyle = item.getAttribute("style") ?? "";
  if (existingStyle.includes("--reveal-opacity")) return;

  item.setAttribute(
    "style",
    existingStyle
      ? `${REVEAL_TARGET_STYLE_TEXT} ${existingStyle}`
      : REVEAL_TARGET_STYLE_TEXT
  );
}

/**
 * Thin client wrapper that adds fail-open scroll-linked motion to teaser
 * content. Children stay visible by default; the observer only adds polish.
 * Keeps parent pages as Server Components.
 */
export default function RevealGrid({ children, className }: RevealGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLinkedReveal(ref, REVEAL_TARGET_SELECTOR);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    root
      .querySelectorAll<HTMLElement>(REVEAL_TARGET_SELECTOR)
      .forEach(applyRevealTargetStyle);
  }, [children]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
