import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  const originalMatchMedia = window.matchMedia;

  function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("returns true when the media query matches", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() =>
      useMediaQuery("(max-width: 800px)")
    );
    expect(result.current).toBe(true);
  });

  it("returns false when the media query does not match", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() =>
      useMediaQuery("(max-width: 800px)")
    );
    expect(result.current).toBe(false);
  });

  it("updates when the media query match state changes", () => {
    let listener: ((e: { matches: boolean }) => void) | null = null;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn((_: string, cb: (e: { matches: boolean }) => void) => {
          listener = cb;
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const { result } = renderHook(() =>
      useMediaQuery("(max-width: 800px)")
    );
    expect(result.current).toBe(false);

    act(() => {
      listener?.({ matches: true });
    });
    expect(result.current).toBe(true);
  });
});
