import {
  getRevealState,
  isActuallyVisibleInViewport,
  isInPreEntryBand,
  markRevealAnimated,
  markRevealSettled,
} from "@/lib/reveal-state";

function makeRect({
  top,
  bottom,
  left = 0,
  right = 200,
  width = 200,
  height = bottom - top,
}: {
  top: number;
  bottom: number;
  left?: number;
  right?: number;
  width?: number;
  height?: number;
}) {
  return {
    top,
    bottom,
    left,
    right,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("reveal-state", () => {
  it("marks a settled item with terminal DOM state", () => {
    const item = document.createElement("div");

    expect(getRevealState(item)).toBe("eligible");

    markRevealSettled(item);

    expect(getRevealState(item)).toBe("settled");
    expect(item.dataset.revealState).toBe("settled");
    expect(item.dataset.revealAnimated).toBe("true");
  });

  it("marks an animated item with terminal DOM state", () => {
    const item = document.createElement("div");

    markRevealAnimated(item);

    expect(getRevealState(item)).toBe("animated");
    expect(item.dataset.revealState).toBe("animated");
    expect(item.dataset.revealAnimated).toBe("true");
  });

  it("distinguishes actual viewport visibility from the buffered pre-entry band", () => {
    const item = document.createElement("div");

    jest
      .spyOn(item, "getBoundingClientRect")
      .mockReturnValue(
        makeRect({
          top: window.innerHeight + 5,
          bottom: window.innerHeight + 205,
        })
      );

    expect(isActuallyVisibleInViewport(item)).toBe(false);
    expect(isInPreEntryBand(item)).toBe(true);
  });

  it("treats the legacy terminal marker as non-eligible when typed state is absent", () => {
    const item = document.createElement("div");
    item.dataset.revealAnimated = "true";

    expect(getRevealState(item)).toBe("animated");
  });
});
