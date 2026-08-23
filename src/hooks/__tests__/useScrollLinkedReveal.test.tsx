import { act, render, screen } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";
import { COLLAGE_REVEAL_PRESET, GALLERY_REVEAL_PRESET } from "@/lib/reveal-config";
import { RevealState } from "@/lib/reveal-state";

let surfaceTop = 0;
let surfaceWidth = 300;
let surfaceHeight = 200;

function makeRect(top: number) {
  return {
    top,
    bottom: top + surfaceHeight,
    left: 0,
    right: surfaceWidth,
    width: surfaceWidth,
    height: surfaceHeight,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }

  fire(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(
      entries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    );
  }
}

function TestSurface({
  initialTop,
  initialRevealState,
  resetKey,
  surfaceId = "surface",
  options,
}: {
  initialTop: number;
  initialRevealState?: Exclude<RevealState, "eligible">;
  resetKey?: string;
  surfaceId?: string;
  options?: Record<string, number | string | undefined>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    surfaceTop = initialTop;
  }, [initialTop]);

  useScrollLinkedReveal(
    ref,
    ".reveal-target",
    {
      ...(options ?? {}),
      ...(resetKey === undefined ? {} : { resetKey }),
    }
  );

  return (
    <div ref={ref}>
      <div
        key={surfaceId}
        className="reveal-target"
        data-reveal-state={initialRevealState}
        data-testid={surfaceId}
      />
    </div>
  );
}

function fireObserverEntry({
  target = screen.getByTestId("surface"),
  isIntersecting = true,
}: {
  target?: Element;
  isIntersecting?: boolean;
} = {}) {
  act(() => {
    MockIntersectionObserver.instances[0].fire([
      { isIntersecting, target } as Partial<IntersectionObserverEntry>,
    ]);
  });
}

function fireScrollFrame({ top }: { top: number }) {
  surfaceTop = top;

  act(() => {
    window.dispatchEvent(new Event("scroll"));
    rafCallbacks.splice(0).forEach((callback) => callback(performance.now()));
  });
}

function armExitMotion() {
  act(() => {
    window.dispatchEvent(new WheelEvent("wheel"));
  });
}

const rafCallbacks: FrameRequestCallback[] = [];

describe("useScrollLinkedReveal", () => {
  beforeAll(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: MockIntersectionObserver,
    });

    Object.defineProperty(window, "requestAnimationFrame", {
      writable: true,
      value: jest.fn((callback: FrameRequestCallback) => {
        rafCallbacks.push(callback);
        return rafCallbacks.length;
      }),
    });

    Object.defineProperty(window, "cancelAnimationFrame", {
      writable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    rafCallbacks.length = 0;
    surfaceTop = 0;
    surfaceWidth = 300;
    surfaceHeight = 200;
    window.history.replaceState({}, "", "/");
    (window.requestAnimationFrame as jest.Mock).mockClear();
    (window.cancelAnimationFrame as jest.Mock).mockClear();

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 900,
    });

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1200,
    });

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
        if (this.classList.contains("reveal-target")) {
          return makeRect(surfaceTop);
        }

        return makeRect(0);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("settles items that are already visible on mount", () => {
    render(<TestSurface initialTop={120} />);
    fireObserverEntry();

    expect(screen.getByTestId("surface")).toHaveAttribute(
      "data-reveal-state",
      "settled"
    );
  });

  it("updates css variables while an item scrolls into range", () => {
    render(<TestSurface initialTop={980} />);
    fireObserverEntry();

    fireScrollFrame({ top: 940 });

    expect(
      screen.getByTestId("surface").style.getPropertyValue("--reveal-progress")
    ).not.toBe("");
  });

  it("marks the item settled once progress reaches 1", () => {
    render(<TestSurface initialTop={980} />);
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });

    fireScrollFrame({ top: 720 });

    expect(surface).toHaveAttribute(
      "data-reveal-state",
      "settled"
    );
    expect(MockIntersectionObserver.instances[0].unobserve).toHaveBeenCalledWith(
      surface
    );
  });

  it("does not settle during scroll frames before progress reaches 1", () => {
    render(<TestSurface initialTop={980} />);
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });

    fireScrollFrame({ top: 890 });

    expect(surface).not.toHaveAttribute("data-reveal-state", "settled");
    expect(surface.style.getPropertyValue("--reveal-progress")).not.toBe("1");
    expect(MockIntersectionObserver.instances[0].unobserve).not.toHaveBeenCalled();
  });

  it("does not observe or mutate items that are already non-eligible", () => {
    render(<TestSurface initialTop={980} initialRevealState="animated" />);

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(screen.getByTestId("surface").style.getPropertyValue("--reveal-progress"))
      .toBe("");
  });

  it("observes new eligible items when the reset key changes", () => {
    const { rerender } = render(
      <TestSurface initialTop={980} resetKey="one" surfaceId="one" />
    );

    expect(MockIntersectionObserver.instances).toHaveLength(1);

    rerender(<TestSurface initialTop={980} resetKey="two" surfaceId="two" />);

    expect(MockIntersectionObserver.instances).toHaveLength(2);
    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();
    expect(MockIntersectionObserver.instances[1].observe).toHaveBeenCalledWith(
      screen.getByTestId("two")
    );
  });

  it("keeps scroll-linked items active after entry when exit motion is enabled", () => {
    render(
      <TestSurface
        initialTop={980}
        options={{
          exitStartPx: 220,
          exitRangePx: 280,
          exitOffsetPx: 18,
          exitEndOpacity: 0.32,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 300,
    });
    fireScrollFrame({ top: 540 });

    expect(surface).not.toHaveAttribute("data-reveal-state", "settled");
    expect(MockIntersectionObserver.instances[0].unobserve).not.toHaveBeenCalledWith(
      surface
    );
  });

  it("does not apply the exit fade to an initially visible item before the user scrolls", () => {
    render(
      <TestSurface
        initialTop={120}
        options={{
          exitStartPx: 220,
          exitRangePx: 280,
          exitOffsetPx: 18,
          exitEndOpacity: 0.32,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    fireScrollFrame({ top: 120 });

    expect(surface).not.toHaveAttribute("data-reveal-state", "settled");
    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");
  });

  it("publishes live reveal debug state when the query param is enabled", () => {
    window.history.replaceState({}, "", "/?revealDebug=1");

    render(
      <TestSurface
        initialTop={120}
        options={{
          exitStartPx: 220,
          exitRangePx: 280,
          exitOffsetPx: 18,
          exitEndOpacity: 0.32,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    fireScrollFrame({ top: 120 });

    expect(surface).toHaveAttribute("data-reveal-debug-enabled", "true");
    expect(surface).toHaveAttribute("data-reveal-debug-phase", "tick");
    expect(surface).toHaveAttribute("data-reveal-debug-reason", "hold-visible-before-scroll");
    expect(surface.getAttribute("data-reveal-debug-summary")).toContain(
      "tick:hold-visible-before-scroll"
    );
  });

  it("keeps initially visible tiles locked at full entry after scroll arms exit motion", () => {
    render(
      <TestSurface
        initialTop={520}
        options={{
          exitStartPx: 220,
          exitRangePx: 280,
          exitOffsetPx: 18,
          exitEndOpacity: 0.32,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 120,
    });
    fireScrollFrame({ top: 460 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");
  });

  it("applies a separate exit fade once exit motion is armed by user scroll intent", () => {
    render(
      <TestSurface
        initialTop={980}
        options={{
          exitStartPx: 220,
          exitRangePx: 280,
          exitOffsetPx: 18,
          exitEndOpacity: 0.32,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 600,
    });
    fireScrollFrame({ top: 120 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 640,
    });
    fireScrollFrame({ top: 80 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(1);
    expect(Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))).toBeLessThan(0);
  });

  it("keeps the tile fully shown while it hovers inside the configured exit hysteresis zone", () => {
    render(
      <TestSurface
        initialTop={980}
        options={{
          exitStartPx: 90,
          exitRangePx: 200,
          exitOffsetPx: 10,
          exitEndOpacity: 0.72,
          exitHysteresisPx: 16,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 600,
    });
    fireScrollFrame({ top: 80 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");
  });

  it("does not arm exit fade from wheel intent alone when scroll position did not change", () => {
    render(
      <TestSurface
        initialTop={980}
        options={{
          exitStartPx: 90,
          exitRangePx: 200,
          exitOffsetPx: 10,
          exitEndOpacity: 0.72,
          exitHysteresisPx: 16,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();
    fireScrollFrame({ top: 60 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");
  });

  it("starts the exit fade once the tile moves past the exit hysteresis zone", () => {
    render(
      <TestSurface
        initialTop={980}
        options={{
          exitStartPx: 90,
          exitRangePx: 200,
          exitOffsetPx: 10,
          exitEndOpacity: 0.72,
          exitHysteresisPx: 16,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 620,
    });
    fireScrollFrame({ top: 60 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 660,
    });
    fireScrollFrame({ top: 20 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(1);
    expect(Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))).toBeLessThan(0);
  });

  it("lets tall masonry tiles start exiting once their top crosses the gallery top gate", () => {
    surfaceWidth = 300;
    surfaceHeight = 684;

    render(
      <TestSurface
        initialTop={980}
        options={GALLERY_REVEAL_PRESET}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 920,
    });
    fireScrollFrame({ top: 60 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(1);
    expect(Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))).toBeLessThan(0);
  });

  it("keeps collage tiles fully shown while their top edge is still inside the viewport", () => {
    render(
      <TestSurface
        initialTop={980}
        options={COLLAGE_REVEAL_PRESET}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 620,
    });
    fireScrollFrame({ top: 40 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");
  });

  it("starts collage landscape exit while the tile is still visible below the top band", () => {
    render(
      <TestSurface
        initialTop={980}
        options={COLLAGE_REVEAL_PRESET}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 808,
    });
    fireScrollFrame({ top: -8 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 836,
    });
    fireScrollFrame({ top: -36 });

    const earlyOpacity = Number(surface.style.getPropertyValue("--reveal-opacity"));
    const earlyTranslateY = Number.parseFloat(
      surface.style.getPropertyValue("--reveal-translate-y")
    );

    expect(earlyOpacity).toBeLessThan(1);
    expect(earlyTranslateY).toBeLessThan(0);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 916,
    });
    fireScrollFrame({ top: -116 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(
      earlyOpacity
    );
    expect(
      Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))
    ).toBeLessThan(earlyTranslateY);
  });

  it("lets tall collage tiles hold longer before exit so portrait fades do not start too early", () => {
    surfaceWidth = 300;
    surfaceHeight = 684;

    render(
      <TestSurface
        initialTop={980}
        options={COLLAGE_REVEAL_PRESET}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 1076,
    });
    fireScrollFrame({ top: -96 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 1244,
    });
    fireScrollFrame({ top: -264 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 1284,
    });
    fireScrollFrame({ top: -304 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(1);
    expect(Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))).toBeLessThan(0);
  });

  it("re-activates a still-visible exit tile on scroll after a spurious observer leave", () => {
    render(
      <TestSurface
        initialTop={980}
        options={COLLAGE_REVEAL_PRESET}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 836,
    });
    fireScrollFrame({ top: -36 });

    const exitOpacity = Number(surface.style.getPropertyValue("--reveal-opacity"));
    const exitTranslateY = Number.parseFloat(
      surface.style.getPropertyValue("--reveal-translate-y")
    );

    expect(exitOpacity).toBeLessThan(1);
    expect(exitTranslateY).toBeLessThan(0);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 916,
    });
    fireScrollFrame({ top: -116 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(
      exitOpacity
    );
    expect(
      Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))
    ).toBeLessThan(exitTranslateY);

    fireObserverEntry({ target: surface, isIntersecting: false });

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 916,
    });
    fireScrollFrame({ top: -116 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(
      exitOpacity
    );
    expect(
      Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))
    ).toBeLessThan(exitTranslateY);
  });

  it("starts exit from a smooth anchor when a visible-ratio gate opens late", () => {
    surfaceWidth = 300;
    surfaceHeight = 554;

    render(
      <TestSurface
        initialTop={256}
        options={{
          exitStartPx: 75,
          exitRangePx: 220,
          exitOffsetPx: 12,
          exitEndOpacity: 0.52,
          exitVisibleRatioThreshold: 0.75,
          exitVisibleRatioHysteresis: 0.08,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    fireScrollFrame({ top: 256 });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 400,
    });
    fireScrollFrame({ top: -144 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 440,
    });
    fireScrollFrame({ top: -184 });

    expect(Number(surface.style.getPropertyValue("--reveal-opacity"))).toBeLessThan(1);
    expect(Number.parseFloat(surface.style.getPropertyValue("--reveal-translate-y"))).toBeLessThan(0);
  });

  it("lets portrait tiles hold longer than landscape tiles when aspect-specific thresholds are configured", () => {
    surfaceWidth = 300;
    surfaceHeight = 554;

    render(
      <TestSurface
        initialTop={256}
        options={{
          exitStartPx: 75,
          exitRangePx: 220,
          exitOffsetPx: 12,
          exitEndOpacity: 0.52,
          exitVisibleRatioThresholdLandscape: 0.75,
          exitVisibleRatioThresholdPortrait: 0.55,
          exitVisibleRatioHysteresis: 0.08,
        }}
      />
    );
    const surface = screen.getByTestId("surface");
    fireObserverEntry({ target: surface });
    fireScrollFrame({ top: 256 });
    armExitMotion();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 360,
    });
    fireScrollFrame({ top: -104 });

    expect(surface.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(surface.style.getPropertyValue("--reveal-translate-y")).toBe("0px");
  });
});
