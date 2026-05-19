import { act, render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useLoadedGalleryReveal } from "@/hooks/useLoadedGalleryReveal";

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
    animateMock.mockReset();
    matchMediaMock.mockClear();
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

  it("animates already-loaded gallery items", async () => {
    const { getByTestId } = render(<TestGallery />);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(animateMock).toHaveBeenCalled());
    expect(getByTestId("item")).toHaveAttribute("data-reveal-animated", "true");
  });

  it("marks items as revealed without WAAPI motion when reduced motion is preferred", async () => {
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

    const { getByTestId } = render(<TestGallery />);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(matchMediaMock).toHaveBeenCalled());
    expect(animateMock).not.toHaveBeenCalled();
    expect(getByTestId("item")).toHaveAttribute("data-reveal-animated", "true");
  });
});
