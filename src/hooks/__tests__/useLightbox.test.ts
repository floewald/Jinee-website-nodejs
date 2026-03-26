import { renderHook, act } from "@testing-library/react";
import { useLightbox } from "@/hooks/useLightbox";

const IMAGES = [
  { src: "/img/a.webp", alt: "A" },
  { src: "/img/b.webp", alt: "B" },
  { src: "/img/c.webp", alt: "C" },
];

describe("useLightbox", () => {
  it("is closed by default", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentIndex).toBe(0);
  });

  it("opens on a given index", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(1));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.currentIndex).toBe(1);
  });

  it("exposes the current image", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(2));
    expect(result.current.current).toEqual(IMAGES[2]);
  });

  it("closes", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(0));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("goes to next image", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(0));
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(1);
  });

  it("wraps from last to first on next", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(2));
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(0);
  });

  it("goes to previous image", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(1));
    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(0);
  });

  it("wraps from first to last on prev", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(0));
    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(2);
  });

  it("goTo navigates to a specific index", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    act(() => result.current.open(0));
    act(() => result.current.goTo(2));
    expect(result.current.currentIndex).toBe(2);
  });

  it("exposes the total count", () => {
    const { result } = renderHook(() => useLightbox(IMAGES));
    expect(result.current.count).toBe(3);
  });
});
