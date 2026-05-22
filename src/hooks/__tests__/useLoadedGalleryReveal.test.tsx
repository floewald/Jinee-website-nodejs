import { act, render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useLoadedGalleryReveal } from "@/hooks/useLoadedGalleryReveal";
import { REVEAL_OFFSET_PX } from "@/lib/reveal-config";

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

function TestGallery() {
  const ref = useRef<HTMLDivElement>(null);
  useLoadedGalleryReveal(ref);

  return (
    <div ref={ref}>
      <button className="gallery-item" data-testid="item">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Gallery item" src="/img/a.webp" />
      </button>
    </div>
  );
}

describe("useLoadedGalleryReveal", () => {
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
    jest.useFakeTimers();
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

    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("marks already-visible loaded gallery items as revealed without late WAAPI motion", async () => {
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

    const { getByTestId } = render(<TestGallery />);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() =>
      expect(getByTestId("item")).toHaveAttribute("data-reveal-animated", "true")
    );
    expect(getByTestId("item")).toHaveAttribute("data-reveal-animated", "true");
    expect(animateMock).not.toHaveBeenCalled();
  });

  it("marks items as revealed without WAAPI motion when reduced motion is preferred", async () => {
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

    const { getByTestId } = render(<TestGallery />);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(matchMediaMock).toHaveBeenCalled());
    expect(animateMock).not.toHaveBeenCalled();
    expect(getByTestId("item")).toHaveAttribute("data-reveal-animated", "true");
  });

  it("uses slide + fade when a loaded gallery item enters later after scrolling", async () => {
    const rectOutOfRange = {
      top: 2200,
      bottom: 2400,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 2200,
      toJSON: () => ({}),
    };

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectOutOfRange as DOMRect);

    const { getByTestId } = render(<TestGallery />);
    const item = getByTestId("item");

    expect(animateMock).not.toHaveBeenCalled();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 120,
    });

    act(() => {
      MockIntersectionObserver.instances[0].fire([
        { isIntersecting: true, target: item } as Partial<IntersectionObserverEntry>,
      ]);
    });

    await waitFor(() => expect(animateMock).toHaveBeenCalledTimes(1));
    expect(animateMock).toHaveBeenCalledWith(
      [
        expect.objectContaining({ transform: `translateY(${REVEAL_OFFSET_PX}px)` }),
        expect.objectContaining({ transform: "translateY(0)" }),
      ],
      expect.any(Object)
    );
  });
});
