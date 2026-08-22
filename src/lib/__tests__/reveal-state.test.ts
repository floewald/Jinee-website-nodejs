import {
  getRevealLayoutMetrics,
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

  it("derives reveal layout metrics from the unshifted tile position", () => {
    const item = document.createElement("div");
    item.style.setProperty("--reveal-translate-y", "-12px");

    jest
      .spyOn(item, "getBoundingClientRect")
      .mockReturnValue(
        makeRect({
          top: 108,
          bottom: 308,
        })
      );

    expect(getRevealLayoutMetrics(item)).toMatchObject({
      top: 120,
      bottom: 320,
      left: 0,
      right: 200,
    });
  });

  it("prefers the dominant client rect when Safari columns report a fragmented union box", () => {
    const item = document.createElement("div");

    Object.defineProperty(item, "offsetWidth", {
      configurable: true,
      value: 456,
    });
    Object.defineProperty(item, "offsetHeight", {
      configurable: true,
      value: 308,
    });

    jest
      .spyOn(item, "getBoundingClientRect")
      .mockReturnValue(
        makeRect({
          top: -254.40625,
          bottom: 1078.078125,
          left: 491.984375,
          right: 1418.375,
          width: 926.390625,
          height: 1332.484375,
        })
      );
    jest
      .spyOn(item, "getClientRects")
      .mockReturnValue(
        [
          makeRect({
            top: 1072.078125,
            bottom: 1078.078125,
            left: 491.984375,
            right: 947.984375,
            width: 456,
            height: 6,
          }),
          makeRect({
            top: -254.40625,
            bottom: 47.390625,
            left: 962.375,
            right: 1418.375,
            width: 456,
            height: 301.796875,
          }),
        ] as unknown as DOMRectList
      );

    expect(getRevealLayoutMetrics(item)).toMatchObject({
      top: -254.40625,
      bottom: 53.59375,
      left: 962.375,
      right: 1418.375,
      width: 456,
      height: 308,
    });
  });

  it("treats the legacy terminal marker as non-eligible when typed state is absent", () => {
    const item = document.createElement("div");
    item.dataset.revealAnimated = "true";

    expect(getRevealState(item)).toBe("animated");
  });
});
