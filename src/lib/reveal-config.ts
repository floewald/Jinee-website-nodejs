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
export const REVEAL_PROGRESS_ENTRY_OFFSET_PX = 120;
export const REVEAL_PROGRESS_SETTLE_OFFSET_PX = 24;
export const REVEAL_BOTTOM_BUFFER_PX = 10;
export const REVEAL_SIDE_BUFFER_PX = 50;
export const REVEAL_START_OPACITY = 0.20;
export const REVEAL_VISIBLE_THRESHOLD_PX = 1;
export const REVEAL_RESCAN_SHORT_MS = 180;
export const REVEAL_RESCAN_LONG_MS = 600;
export const GALLERY_REVEAL_RESCAN_DELAY_MS = 400;

/**
 * Shared tuning for the scroll-linked reveal, used across project cards, gallery
 * images (home masonry + photography), and video rows so they all reveal with
 * the same premium feel. A low start opacity makes the fade clearly visible, and
 * a high settle offset means an element only reaches full opacity once it has
 * scrolled up out of the lower third of the viewport — not the instant it peeks
 * in at the bottom. Passed as options so the timed-reveal path (download-mode
 * gallery) keeps the default config above.
 */
export const SCROLL_LINKED_REVEAL_PRESET = {
  startOpacity: 0.15,
  entryOffsetPx: 100,
  settleOffsetPx: 200,
  offsetPx: 60,
} as const;
