import {
  clampRevealProgress,
  getRevealProgressFromRect,
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
});
