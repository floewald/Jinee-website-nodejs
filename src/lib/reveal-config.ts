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
 * Tuning for the scroll-linked reveal (passed as options so the timed-reveal
 * path keeps the default config above). A low start opacity makes the fade
 * clearly visible; `settleOffsetPx` is the scroll distance — measured from the
 * element's top — over which it fades up to full opacity, so a BIGGER value =
 * SLOWER, more visible fade.
 *
 * Two variants: video rows are large and reveal one at a time, so a shorter
 * settle reads well; grids (project cards + gallery images) have many small
 * items, so a longer settle makes each item's fade slower and more noticeable.
 */
export const VIDEO_REVEAL_PRESET = {
  startOpacity: 0.15,
  entryOffsetPx: 100,
  settleOffsetPx: 200,
  offsetPx: 60,
  exitStartPx: 180,
  exitRangePx: 240,
  exitOffsetPx: 24,
  exitEndOpacity: 0.38,
} as const;

export const TEASER_REVEAL_PRESET = {
  startOpacity: 0.15,
  entryOffsetPx: 100,
  settleOffsetPx: 300,
  offsetPx: 60,
  exitStartPx: 75,
  exitRangePx: 280,
  exitOffsetPx: 18,
  exitEndOpacity: 0.32,
} as const;

export const SOCIAL_PREVIEW_REVEAL_PRESET = {
  startOpacity: 0.15,
  entryOffsetPx: 100,
  settleOffsetPx: 300,
  offsetPx: 60,
  exitStartPx: 40,
  exitRangePx: 280,
  exitOffsetPx: 18,
  exitEndOpacity: 0.32,
} as const;

export const GALLERY_REVEAL_PRESET = {
  startOpacity: 0.15,
  entryOffsetPx: 100,
  settleOffsetPx: 300,
  offsetPx: 60,
  exitStartPx: 75,
  exitRangePx: 220,
  exitHysteresisPx: 10,
  exitVisibleRatioThresholdLandscape: 2,
  exitVisibleRatioThresholdPortrait: 0.55,
  exitVisibleRatioHysteresis: 0.08,
  exitOffsetPx: 12,
  exitEndOpacity: 0.52,
  exitMaskMaxStartPercent: 14,
} as const;

export const COLLAGE_REVEAL_PRESET = {
  startOpacity: 0.15,
  entryOffsetPx: 100,
  settleOffsetPx: 320,
  offsetPx: 56,
  exitGateMode: "top",
  exitStartPx: 0,
  exitRangePx: 160,
  exitHysteresisPx: 12,
  exitOffsetPx: 6,
  exitEndOpacity: 0.9,
  exitMaskMaxStartPercent: 0,
} as const;

export const GRID_REVEAL_PRESET = {
  startOpacity: 0.15,
  entryOffsetPx: 100,
  settleOffsetPx: 300,
  offsetPx: 60,
} as const;
