import { act, render, screen } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";
import { RevealState } from "@/lib/reveal-state";

let surfaceTop = 0;

function makeRect(top: number) {
  return {
    top,
    bottom: top + 200,
    left: 0,
    right: 300,
    width: 300,
    height: 200,
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
}: {
  initialTop: number;
  initialRevealState?: Exclude<RevealState, "eligible">;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    surfaceTop = initialTop;
  }, [initialTop]);

  useScrollLinkedReveal(ref, ".reveal-target");

  return (
    <div ref={ref}>
      <div
        className="reveal-target"
        data-reveal-state={initialRevealState}
        data-testid="surface"
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

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
        if (this.dataset.testid === "surface") {
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
});
