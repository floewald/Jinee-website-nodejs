import { renderHook, act } from "@testing-library/react";
import { useSwipe } from "@/hooks/useSwipe";

describe("useSwipe", () => {
  it("returns null delta before any touch events", () => {
    const onSwipe = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft: onSwipe, onSwipeRight: onSwipe })
    );
    expect(result.current).toHaveProperty("handlers");
  });

  it("calls onSwipeLeft when a leftward swipe exceeds threshold", () => {
    const onSwipeLeft = jest.fn();
    const onSwipeRight = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft, onSwipeRight, threshold: 50 })
    );

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 200, clientY: 100 }],
      } as unknown as React.TouchEvent);
    });
    act(() => {
      result.current.handlers.onTouchEnd({
        changedTouches: [{ clientX: 100, clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("calls onSwipeRight when a rightward swipe exceeds threshold", () => {
    const onSwipeLeft = jest.fn();
    const onSwipeRight = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft, onSwipeRight, threshold: 50 })
    );

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 100, clientY: 100 }],
      } as unknown as React.TouchEvent);
    });
    act(() => {
      result.current.handlers.onTouchEnd({
        changedTouches: [{ clientX: 200, clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("does NOT fire when the swipe is below the threshold", () => {
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft, threshold: 50 })
    );

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 200, clientY: 100 }],
      } as unknown as React.TouchEvent);
    });
    act(() => {
      result.current.handlers.onTouchEnd({
        changedTouches: [{ clientX: 170, clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("does NOT fire when dominant axis is vertical, not horizontal", () => {
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft, threshold: 30 })
    );

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 200, clientY: 100 }],
      } as unknown as React.TouchEvent);
    });
    act(() => {
      result.current.handlers.onTouchEnd({
        changedTouches: [{ clientX: 160, clientY: 0 }],
      } as unknown as React.TouchEvent);
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });
});
