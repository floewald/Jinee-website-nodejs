import { renderHook, act } from "@testing-library/react";
import { useIntersection } from "@/hooks/useIntersection";

// Minimal IntersectionObserver mock
class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();

  forceCallback(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

beforeAll(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
});

beforeEach(() => {
  MockIntersectionObserver.instances = [];
});

describe("useIntersection", () => {
  it("returns false initially before intersection fires", () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useIntersection(ref));
    expect(result.current).toBe(false);
  });

  it("returns true when the target intersects", () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useIntersection(ref));

    act(() => {
      MockIntersectionObserver.instances[0].forceCallback([
        { isIntersecting: true, target: ref.current } as Partial<IntersectionObserverEntry>,
      ]);
    });
    expect(result.current).toBe(true);
  });

  it("stays true after becoming visible (once mode)", () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useIntersection(ref, { once: true }));

    act(() => {
      MockIntersectionObserver.instances[0].forceCallback([
        { isIntersecting: true, target: ref.current },
      ]);
    });
    act(() => {
      MockIntersectionObserver.instances[0].forceCallback([
        { isIntersecting: false, target: ref.current },
      ]);
    });
    expect(result.current).toBe(true);
  });

  it("calls observe on mount and disconnect on unmount", () => {
    const ref = { current: document.createElement("div") };
    const { unmount } = renderHook(() => useIntersection(ref));
    const observer = MockIntersectionObserver.instances[0];
    expect(observer.observe).toHaveBeenCalledWith(ref.current);
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
