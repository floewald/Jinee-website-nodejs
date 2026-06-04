/**
 * Scroll-reveal tuning for progressive (fail-open) motion.
 *
 * Adjust these values to fine-tune the feel:
 * - increase duration for slower/more relaxed motion
 * - decrease offset for subtler movement
 * - tweak easing for sharper/softer landing
 * - increase gallery rescan delay if cached images reveal too early
 *
 * Used by:
 * - src/hooks/useProgressiveReveal.ts
 * - src/hooks/useLoadedGalleryReveal.ts
 */
export const REVEAL_DURATION_MS = 1500;
export const REVEAL_OFFSET_PX = 50;
export const REVEAL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
export const REVEAL_BOTTOM_BUFFER_PX = 10;
export const REVEAL_SIDE_BUFFER_PX = 50;
export const REVEAL_START_OPACITY = 0.20;
export const REVEAL_RESCAN_SHORT_MS = 180;
export const REVEAL_RESCAN_LONG_MS = 600;
export const GALLERY_REVEAL_RESCAN_DELAY_MS = 400;
