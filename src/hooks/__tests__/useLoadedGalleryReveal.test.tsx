import { act, render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useLoadedGalleryReveal } from "@/hooks/useLoadedGalleryReveal";

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

function TestGallery({
  revealKey = "desktop",
  imageSrcs = ["/img/a.webp"],
}: {
  revealKey?: string;
  imageSrcs?: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLoadedGalleryReveal(ref, ".gallery-item img", revealKey);

  return (
    <div ref={ref}>
      {imageSrcs.map((src, index) => (
        <button key={src} className="gallery-item" data-testid={`item-${index}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={`Gallery item ${index}`} src={src} />
        </button>
      ))}
    </div>
  );
}

describe("useLoadedGalleryReveal", () => {
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
    jest.useFakeTimers();
    MockIntersectionObserver.instances = [];
    animateMock.mockReset();
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });

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
      expect(getByTestId("item-0")).toHaveAttribute("data-reveal-state", "settled")
    );
    expect(animateMock).not.toHaveBeenCalled();
    expect(MockIntersectionObserver.instances[0].unobserve).toHaveBeenCalledWith(
      getByTestId("item-0")
    );
  });

  it("animates a gallery item when the observer catches it before visible entry", async () => {
    const rectPreEntry = {
      top: window.innerHeight + 5,
      bottom: window.innerHeight + 205,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: window.innerHeight + 5,
      toJSON: () => ({}),
    };

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectPreEntry as DOMRect);

    const { getByTestId } = render(<TestGallery />);
    const item = getByTestId("item-0");

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

    await waitFor(() =>
      expect(item).toHaveAttribute("data-reveal-state", "animated")
    );
    expect(animateMock).toHaveBeenCalledTimes(1);
  });

  it("re-observes gallery items when the reveal key changes for layout identity only", async () => {
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

    const { getByTestId, rerender } = render(
      <TestGallery revealKey="masonry:/img/a.webp" imageSrcs={["/img/a.webp"]} />
    );

    const firstItem = getByTestId("item-0");
    expect(MockIntersectionObserver.instances[0].observe).toHaveBeenCalledWith(firstItem);

    rerender(
      <TestGallery revealKey="columns:/img/a.webp" imageSrcs={["/img/a.webp"]} />
    );

    const secondObserver = MockIntersectionObserver.instances[1];
    const sameDatasetItem = getByTestId("item-0");

    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();
    expect(secondObserver.observe).toHaveBeenCalledWith(sameDatasetItem);

    act(() => {
      secondObserver.fire([
        { isIntersecting: true, target: sameDatasetItem } as Partial<IntersectionObserverEntry>,
      ]);
    });

    await waitFor(() =>
      expect(sameDatasetItem).toHaveAttribute("data-reveal-state", "animated")
    );
    expect(animateMock).toHaveBeenCalledTimes(1);
  });

  it("re-observes gallery items when the reveal key changes with a new dataset identity", async () => {
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

    const { getByTestId, rerender } = render(
      <TestGallery revealKey="masonry:/img/a.webp" imageSrcs={["/img/a.webp"]} />
    );

    const firstItem = getByTestId("item-0");
    expect(MockIntersectionObserver.instances[0].observe).toHaveBeenCalledWith(firstItem);

    rerender(
      <TestGallery
        revealKey="masonry:/img/b.webp|/img/c.webp"
        imageSrcs={["/img/b.webp", "/img/c.webp"]}
      />
    );

    const secondObserver = MockIntersectionObserver.instances[1];
    const nextItem = getByTestId("item-1");

    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();
    expect(secondObserver.observe).toHaveBeenCalledWith(nextItem);

    act(() => {
      secondObserver.fire([
        { isIntersecting: true, target: nextItem } as Partial<IntersectionObserverEntry>,
      ]);
    });

    await waitFor(() =>
      expect(nextItem).toHaveAttribute("data-reveal-state", "animated")
    );
    expect(animateMock).toHaveBeenCalledTimes(1);
  });
});
