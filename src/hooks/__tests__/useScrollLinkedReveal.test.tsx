import { act, render, screen } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";

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
  observe = jest.fn((item: Element) => {
    this.fire([
      {
        isIntersecting: surfaceTop <= window.innerHeight + 120,
        target: item,
      },
    ]);
  });
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

function TestSurface({ initialTop }: { initialTop: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    surfaceTop = initialTop;
  }, [initialTop]);

  useScrollLinkedReveal(ref, ".reveal-target");

  return (
    <div ref={ref}>
      <div className="reveal-target" data-testid="surface" />
    </div>
  );
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

    expect(screen.getByTestId("surface")).toHaveAttribute(
      "data-reveal-state",
      "settled"
    );
  });

  it("updates css variables while an item scrolls into range", () => {
    render(<TestSurface initialTop={980} />);

    fireScrollFrame({ top: 940 });

    expect(
      screen.getByTestId("surface").style.getPropertyValue("--reveal-progress")
    ).not.toBe("");
  });

  it("marks the item settled once progress reaches 1", () => {
    render(<TestSurface initialTop={980} />);

    fireScrollFrame({ top: 720 });

    expect(screen.getByTestId("surface")).toHaveAttribute(
      "data-reveal-state",
      "settled"
    );
  });
});
