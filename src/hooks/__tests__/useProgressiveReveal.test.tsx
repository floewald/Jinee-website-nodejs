import { act, render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useProgressiveReveal } from "@/hooks/useProgressiveReveal";

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
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

  beforeAll(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: MockIntersectionObserver,
    });

    Object.defineProperty(HTMLElement.prototype, "animate", {
      writable: true,
      value: animateMock,
    });
  });

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    animateMock.mockReset();
  });

  it("keeps items visible by default instead of gating them behind reveal classes", () => {
    const { getByTestId } = render(<TestGrid />);

    expect(getByTestId("container")).not.toHaveAttribute("data-reveal-ready");
    expect(getByTestId("first")).not.toHaveClass("reveal--visible");
    expect(getByTestId("second")).not.toHaveClass("reveal--visible");
  });

  it("animates items that start within the reveal range", async () => {
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

    render(<TestGrid />);

    await waitFor(() => expect(animateMock).toHaveBeenCalled());
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

    MockIntersectionObserver.instances[0].fire([
      { isIntersecting: true, target } as Partial<IntersectionObserverEntry>,
    ]);

    expect(animateMock).toHaveBeenCalledTimes(1);

    MockIntersectionObserver.instances[0].fire([
      { isIntersecting: true, target } as Partial<IntersectionObserverEntry>,
    ]);

    expect(animateMock).toHaveBeenCalledTimes(1);
  });

  it("rescans visible items after the page load event settles layout", () => {
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

    render(<TestGrid />);

    expect(animateMock).not.toHaveBeenCalled();

    rectSpy.mockImplementation(() => rectInRange as DOMRect);
    window.dispatchEvent(new Event("load"));

    expect(animateMock).toHaveBeenCalled();
  });

  it("rescans shortly after mount for masonry reflow changes", () => {
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

    render(<TestGrid />);
    expect(animateMock).not.toHaveBeenCalled();

    rectSpy.mockImplementation(() => rectInRange as DOMRect);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(animateMock).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
