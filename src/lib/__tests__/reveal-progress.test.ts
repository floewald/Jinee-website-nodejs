import {
  clampRevealProgress,
  getRevealExitProgressFromTop,
  getRevealProgressFromRect,
  isInRevealExitBand,
  shouldSettleImmediately,
} from "@/lib/reveal-progress";

describe("reveal-progress", () => {
  it("returns settled progress for already visible items", () => {
    expect(
      shouldSettleImmediately({
        top: 100,
        bottom: 300,
        left: 0,
        right: 300,
        viewportHeight: 900,
        viewportWidth: 1200,
      })
    ).toBe(true);
  });

  it("does not settle items that are vertically outside the viewport", () => {
    expect(
      shouldSettleImmediately({
        top: 950,
        bottom: 1150,
        left: 0,
        right: 300,
        viewportHeight: 900,
        viewportWidth: 1200,
      })
    ).toBe(false);
  });

  it("does not settle items that are horizontally outside the viewport", () => {
    expect(
      shouldSettleImmediately({
        top: 100,
        bottom: 300,
        left: 1300,
        right: 1500,
        viewportHeight: 900,
        viewportWidth: 1200,
      })
    ).toBe(false);
  });

  it("clamps progress between 0 and 1", () => {
    expect(clampRevealProgress(-0.2)).toBe(0);
    expect(clampRevealProgress(1.2)).toBe(1);
  });

  it("increases progress as the item approaches the viewport", () => {
    const early = getRevealProgressFromRect({
      top: 980,
      bottom: 1180,
      viewportHeight: 900,
      entryOffsetPx: 120,
      settleOffsetPx: 24,
    });
    const late = getRevealProgressFromRect({
      top: 860,
      bottom: 1060,
      viewportHeight: 900,
      entryOffsetPx: 120,
      settleOffsetPx: 24,
    });

    expect(early).toBeLessThan(late);
  });

  it("decreases exit progress as the item moves toward and above the top edge", () => {
    const early = getRevealExitProgressFromTop({
      top: 220,
      exitStartPx: 220,
      exitRangePx: 280,
    });
    const late = getRevealExitProgressFromTop({
      top: 40,
      exitStartPx: 220,
      exitRangePx: 280,
    });

    expect(early).toBeGreaterThan(late);
  });

  it("keeps exit motion inactive inside the entry-side hysteresis zone", () => {
    expect(
      isInRevealExitBand({
        top: 80,
        exitStartPx: 90,
        exitHysteresisPx: 16,
        wasExiting: false,
      })
    ).toBe(false);
  });

  it("keeps exit motion active inside the release-side hysteresis zone", () => {
    expect(
      isInRevealExitBand({
        top: 100,
        exitStartPx: 90,
        exitHysteresisPx: 16,
        wasExiting: true,
      })
    ).toBe(true);
  });

  it("releases exit motion once the tile is clearly below the hysteresis band", () => {
    expect(
      isInRevealExitBand({
        top: 108,
        exitStartPx: 90,
        exitHysteresisPx: 16,
        wasExiting: true,
      })
    ).toBe(false);
  });

  it("keeps exit motion inactive when a tile has only barely started clipping", () => {
    expect(
      isInRevealExitBand({
        top: -10,
        exitStartPx: 0,
        exitHysteresisPx: 12,
        exitVisibleRatio: 0.92,
        exitVisibleRatioThreshold: 0.72,
        exitVisibleRatioHysteresis: 0.08,
        wasExiting: false,
      })
    ).toBe(false);
  });

  it("starts exit motion once a clipped tile falls below the visible-ratio threshold", () => {
    expect(
      isInRevealExitBand({
        top: -72,
        exitStartPx: 0,
        exitHysteresisPx: 12,
        exitVisibleRatio: 0.64,
        exitVisibleRatioThreshold: 0.72,
        exitVisibleRatioHysteresis: 0.08,
        wasExiting: false,
      })
    ).toBe(true);
  });

  it("keeps project-gallery exit inactive while a tall portrait still has most of its height visible", () => {
    expect(
      isInRevealExitBand({
        top: -64,
        exitStartPx: 75,
        exitHysteresisPx: 10,
        exitVisibleRatio: 0.88,
        exitVisibleRatioThreshold: 0.75,
        exitVisibleRatioHysteresis: 0.08,
        wasExiting: false,
      })
    ).toBe(false);
  });

  it("allows project-gallery exit once the same top position belongs to a shorter tile", () => {
    expect(
      isInRevealExitBand({
        top: -64,
        exitStartPx: 75,
        exitHysteresisPx: 10,
        exitVisibleRatio: 0.74,
        exitVisibleRatioThreshold: 0.75,
        exitVisibleRatioHysteresis: 0.08,
        wasExiting: false,
      })
    ).toBe(true);
  });

  it("can use a pure top-edge exit gate when a layout should ignore height differences", () => {
    expect(
      isInRevealExitBand({
        top: -24,
        exitStartPx: 0,
        exitHysteresisPx: 12,
        exitVisibleRatio: 0.88,
        wasExiting: false,
      })
    ).toBe(true);
  });

  it("holds exit motion until visible ratio clearly recovers above the hysteresis band", () => {
    expect(
      isInRevealExitBand({
        top: 6,
        exitStartPx: 0,
        exitHysteresisPx: 12,
        exitVisibleRatio: 0.76,
        exitVisibleRatioThreshold: 0.72,
        exitVisibleRatioHysteresis: 0.08,
        wasExiting: true,
      })
    ).toBe(true);
  });
});
