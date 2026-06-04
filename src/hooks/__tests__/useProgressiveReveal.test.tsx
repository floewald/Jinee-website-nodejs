import { act, render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useProgressiveReveal } from "@/hooks/useProgressiveReveal";
import {
  REVEAL_BOTTOM_BUFFER_PX,
  REVEAL_OFFSET_PX,
  REVEAL_SIDE_BUFFER_PX,
} from "@/lib/reveal-config";

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

function TestGrid() {
  const ref = useRef<HTMLDivElement>(null);
  useProgressiveReveal(ref, ".reveal-target");

  return (
    <div ref={ref} data-testid="container">
      <div className="reveal-target" data-testid="first" />
      <div className="reveal-target" data-testid="second" />
    </div>
  );
}

describe("useProgressiveReveal", () => {
  const animateMock = jest.fn();
  const matchMediaMock = jest.fn().mockImplementation(() => ({
    matches: false,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  beforeAll(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: MockIntersectionObserver,
    });

    Object.defineProperty(HTMLElement.prototype, "animate", {
      writable: true,
      value: animateMock,
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    animateMock.mockReset();
    matchMediaMock.mockClear();
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
    matchMediaMock.mockImplementation(() => ({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it("keeps items visible by default instead of gating them behind reveal classes", () => {
    const { getByTestId } = render(<TestGrid />);

    expect(getByTestId("container")).not.toHaveAttribute("data-reveal-ready");
    expect(getByTestId("first")).not.toHaveClass("reveal--visible");
    expect(getByTestId("second")).not.toHaveClass("reveal--visible");
  });

  it("marks items that start within the viewport as revealed without late WAAPI motion", async () => {
    const rectInRange = {
      top: 120,
      bottom: 320,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 120,
      toJSON: () => ({}),
    };

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectInRange as DOMRect);

    const { getByTestId } = render(<TestGrid />);

    await waitFor(() =>
      expect(getByTestId("first")).toHaveAttribute("data-reveal-animated", "true")
    );
    expect(animateMock).not.toHaveBeenCalled();
  });

  it("skips WAAPI motion when the user prefers reduced motion", async () => {
    const rectInRange = {
      top: 120,
      bottom: 320,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 120,
      toJSON: () => ({}),
    };

    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectInRange as DOMRect);

    render(<TestGrid />);

    await waitFor(() => expect(matchMediaMock).toHaveBeenCalled());
    expect(animateMock).not.toHaveBeenCalled();
  });

  it("animates items once when they intersect later", () => {
    const rectOutOfRange = {
      top: 2000,
      bottom: 2200,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    };

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    const { getByTestId } = render(<TestGrid />);
    const target = getByTestId("second");

    expect(animateMock).not.toHaveBeenCalled();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 120,
    });

    MockIntersectionObserver.instances[0].fire([
      { isIntersecting: true, target } as Partial<IntersectionObserverEntry>,
    ]);

    expect(animateMock).toHaveBeenCalledTimes(1);
    expect(animateMock).toHaveBeenCalledWith(
      [
        expect.objectContaining({ transform: `translateY(${REVEAL_OFFSET_PX}px)` }),
        expect.objectContaining({ transform: "translateY(0)" }),
      ],
      expect.any(Object)
    );

    MockIntersectionObserver.instances[0].fire([
      { isIntersecting: true, target } as Partial<IntersectionObserverEntry>,
    ]);

    expect(animateMock).toHaveBeenCalledTimes(1);
  });

  it("configures the observer to trigger before teaser cards enter the viewport", () => {
    const rectOutOfRange = {
      top: 2000,
      bottom: 2200,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    };

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    render(<TestGrid />);

    const observerEntryBufferPx = Math.max(
      REVEAL_BOTTOM_BUFFER_PX,
      REVEAL_OFFSET_PX
    );

    expect(MockIntersectionObserver.instances[0].options?.rootMargin).toBe(
      `${observerEntryBufferPx}px ${REVEAL_SIDE_BUFFER_PX}px ${observerEntryBufferPx}px ${REVEAL_SIDE_BUFFER_PX}px`
    );
  });

  it("still animates an item when the observer fires just before viewport entry", () => {
    const rectOutOfRange = {
      top: 2000,
      bottom: 2200,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    };
    const rectJustOutsideViewport = {
      top: 769,
      bottom: 969,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 769,
      toJSON: () => ({}),
    };

    const rectSpy = jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    const { getByTestId } = render(<TestGrid />);
    const target = getByTestId("second");

    rectSpy.mockImplementation(() => rectJustOutsideViewport as DOMRect);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 120,
    });

    MockIntersectionObserver.instances[0].fire([
      { isIntersecting: true, target } as Partial<IntersectionObserverEntry>,
    ]);

    expect(animateMock).toHaveBeenCalledTimes(1);
  });

  it("skips observer WAAPI motion once an intersecting item is already visibly in the viewport", () => {
    const rectOutOfRange = {
      top: 2000,
      bottom: 2200,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    };
    const rectSlightlyVisible = {
      top: 720,
      bottom: 920,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 720,
      toJSON: () => ({}),
    };

    const rectSpy = jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    const { getByTestId } = render(<TestGrid />);
    const target = getByTestId("second");

    rectSpy.mockImplementation(() => rectSlightlyVisible as DOMRect);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 120,
    });

    MockIntersectionObserver.instances[0].fire([
      { isIntersecting: true, target } as Partial<IntersectionObserverEntry>,
    ]);

    expect(animateMock).not.toHaveBeenCalled();
    expect(target).toHaveAttribute("data-reveal-animated", "true");
  });

  it("skips late WAAPI reveal when an intersecting item is already visible after scroll", () => {
    const rectOutOfRange = {
      top: 2000,
      bottom: 2200,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    };
    const rectVisibleInViewport = {
      top: 40,
      bottom: 240,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 40,
      toJSON: () => ({}),
    };

    const rectSpy = jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    const { getByTestId } = render(<TestGrid />);
    const target = getByTestId("second");

    expect(animateMock).not.toHaveBeenCalled();

    rectSpy.mockImplementation(() => rectVisibleInViewport as DOMRect);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 220,
    });

    MockIntersectionObserver.instances[0].fire([
      { isIntersecting: true, target } as Partial<IntersectionObserverEntry>,
    ]);

    expect(animateMock).not.toHaveBeenCalled();
    expect(target).toHaveAttribute("data-reveal-animated", "true");
  });

  it("marks visible items as revealed when page-load rescan settles layout", () => {
    const rectOutOfRange = {
      top: 2000,
      bottom: 2200,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    };
    const rectInRange = {
      top: 120,
      bottom: 320,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 120,
      toJSON: () => ({}),
    };

    const rectSpy = jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    const { getByTestId } = render(<TestGrid />);

    expect(animateMock).not.toHaveBeenCalled();

    rectSpy.mockImplementation(() => rectInRange as DOMRect);
    window.dispatchEvent(new Event("load"));

    expect(animateMock).not.toHaveBeenCalled();
    expect(getByTestId("first")).toHaveAttribute("data-reveal-animated", "true");
  });

  it("marks items as revealed when short rescan catches masonry reflow changes", () => {
    jest.useFakeTimers();

    const rectOutOfRange = {
      top: 2000,
      bottom: 2200,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    };
    const rectInRange = {
      top: 120,
      bottom: 320,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 120,
      toJSON: () => ({}),
    };

    const rectSpy = jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    const { getByTestId } = render(<TestGrid />);
    expect(animateMock).not.toHaveBeenCalled();

    rectSpy.mockImplementation(() => rectInRange as DOMRect);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(animateMock).not.toHaveBeenCalled();
    expect(getByTestId("first")).toHaveAttribute("data-reveal-animated", "true");
    jest.useRealTimers();
  });

});
