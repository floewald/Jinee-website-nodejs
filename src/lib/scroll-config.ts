/**
 * Duration for smooth-scroll animations (milliseconds).
 *
 * Increase this value for a slower, more dramatic scroll;
 * decrease it (e.g. 400–600) for a snappier feel.
 *
 * Used by: src/components/SmoothScroll.tsx, src/components/layout/Navigation.tsx
 */
export const SCROLL_DURATION_MS = 2000;

/** ease-in-out-quad easing function */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Animate a scroll from `from` to `to` in SCROLL_DURATION_MS milliseconds.
 * Call only from client-side code.
 */
export function animateScrollTo(from: number, to: number): void {
  const startTime = performance.now();
  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / SCROLL_DURATION_MS, 1);
    window.scrollTo(0, from + (to - from) * easeInOutQuad(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/** Smooth-scroll to an element by id, accounting for the fixed header offset. */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const OFFSET = 80;
  animateScrollTo(window.scrollY, el.getBoundingClientRect().top + window.scrollY - OFFSET);
}

/** Smooth-scroll back to the very top of the page. */
export function scrollToTop(): void {
  animateScrollTo(window.scrollY, 0);
}
