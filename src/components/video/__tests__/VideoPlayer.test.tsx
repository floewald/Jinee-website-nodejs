import { act, fireEvent, render, screen } from "@testing-library/react";
import VideoPlayer from "../VideoPlayer";
import type { VideoItem } from "@/types/portfolio";

// Mock useIntersection to control visibility
let mockIsVisible = false;
jest.mock("@/hooks/useIntersection", () => ({
  useIntersection: () => mockIsVisible,
}));

// Replace the global IntersectionObserver mock with one that captures the
// callback so tests can simulate the observer firing.
type IOInstance = {
  callback: IntersectionObserverCallback;
  observe: jest.Mock;
  disconnect: jest.Mock;
};
let ioInstances: IOInstance[] = [];
beforeEach(() => {
  ioInstances = [];
  (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    jest.fn().mockImplementation((cb: IntersectionObserverCallback) => {
      const instance: IOInstance = {
        callback: cb,
        observe: jest.fn(),
        disconnect: jest.fn(),
      };
      ioInstances.push(instance);
      return {
        observe: instance.observe,
        unobserve: jest.fn(),
        disconnect: instance.disconnect,
        takeRecords: jest.fn(() => []),
      };
    });
});

const videos: VideoItem[] = [
  {
    title: "Episode 1: Test Video",
    embedUrl: "https://www.youtube.com/embed/abc123",
    description: ["Episode-specific copy.", "Second paragraph."],
    uploadDate: "2026-01-01T00:00:00+08:00",
  },
  {
    title: "Episode 2: Another",
    embedUrl: "https://www.youtube.com/embed/def456",
    uploadDate: "2026-02-01T00:00:00+08:00",
  },
];

// Helper: stub getBoundingClientRect on every HTMLDivElement so tiles register
// as being in or out of the viewport during useLayoutEffect.
function stubRect(rect: { top: number; bottom: number }) {
  const spy = jest
    .spyOn(HTMLDivElement.prototype, "getBoundingClientRect")
    .mockReturnValue({
      top: rect.top,
      bottom: rect.bottom,
      left: 0,
      right: 0,
      width: 0,
      height: rect.bottom - rect.top,
      x: 0,
      y: rect.top,
      toJSON: () => ({}),
    } as DOMRect);
  return spy;
}

describe("VideoPlayer", () => {
  beforeEach(() => {
    mockIsVisible = false;
    // The iframe crossfade flips `data-loaded` after two rAF ticks (so YT has
    // a paint frame). Run rAF callbacks synchronously in tests so we don't
    // need to await timers everywhere.
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders one item per video", () => {
    render(<VideoPlayer videos={videos} />);
    const items = document.querySelectorAll(".video-episode-row");
    expect(items).toHaveLength(2);
  });

  it("alternates desktop row layout by index for multi-video projects", () => {
    render(<VideoPlayer videos={videos} />);
    const rows = document.querySelectorAll(".video-episode-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("data-episode-layout", "media-left");
    expect(rows[1]).toHaveAttribute("data-episode-layout", "media-right");
  });

  it("shows title and episode copy for each video when multiple videos", () => {
    render(<VideoPlayer videos={videos} />);
    expect(screen.getByText("Episode 1: Test Video")).toBeInTheDocument();
    expect(screen.getByText("Episode 2: Another")).toBeInTheDocument();
    expect(screen.getByText("Episode-specific copy.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
  });

  it("shows a single row using the first-row desktop direction when only one video is present", () => {
    render(<VideoPlayer videos={[videos[0]]} />);
    expect(screen.getByText("Episode 1: Test Video")).toBeInTheDocument();
    expect(document.querySelectorAll(".video-episode-row")).toHaveLength(1);
    const row = document.querySelector(".video-episode-row");
    expect(row).toHaveAttribute("data-episode-layout", "media-left");
  });

  it("renders placeholder even when iframe is not yet mounted", () => {
    mockIsVisible = false;
    // Placeholder is now always present (the crossfade "behind" layer), so all
    // three tiles render one regardless of whether the iframe is mounted.
    const three: VideoItem[] = [videos[0], videos[1], videos[0]];
    render(<VideoPlayer videos={three} />);
    const placeholders = document.querySelectorAll(".video-embed--placeholder");
    expect(placeholders).toHaveLength(3);
  });

  it("renders iframe when visible", () => {
    mockIsVisible = true;
    render(<VideoPlayer videos={[videos[0]]} />);
    const iframe = screen.getByTitle("Episode 1: Test Video");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123"
    );
  });

  it("uses YouTube thumbnail as placeholder background when embedUrl is a YouTube URL", () => {
    mockIsVisible = false;
    // Three tiles → three placeholders. Assert against the third tile's
    // placeholder (videos[0] = abc123) explicitly.
    const three: VideoItem[] = [videos[1], videos[1], videos[0]];
    render(<VideoPlayer videos={three} />);
    const placeholders = document.querySelectorAll(
      ".video-embed--placeholder"
    );
    expect(placeholders).toHaveLength(3);
    const third = placeholders[2] as HTMLElement;
    expect(third.style.backgroundImage).toContain(
      "i.ytimg.com/vi/abc123/sddefault.jpg"
    );
  });

  it("falls back to no background-image when embedUrl is not a YouTube URL", () => {
    mockIsVisible = false;
    const vimeo: VideoItem = {
      title: "Vimeo Video",
      embedUrl: "https://player.vimeo.com/video/123456",
      uploadDate: "2026-03-01T00:00:00+08:00",
    };
    // Three tiles → three placeholders. The Vimeo tile is index 2.
    const three: VideoItem[] = [videos[0], videos[1], vimeo];
    render(<VideoPlayer videos={three} />);
    const placeholders = document.querySelectorAll(
      ".video-embed--placeholder"
    );
    expect(placeholders).toHaveLength(3);
    const third = placeholders[2] as HTMLElement;
    expect(third.style.backgroundImage).toBe("");
  });

  it("omits data-should-reveal when tile is above the fold on initial load", () => {
    stubRect({ top: 100, bottom: 300 });
    render(<VideoPlayer videos={[videos[0]]} />);
    const item = document.querySelector(".video-episode-row") as HTMLElement;
    expect(item).not.toBeNull();
    expect(item.hasAttribute("data-should-reveal")).toBe(false);
  });

  it("marks below-fold rows as hidden when they mount offscreen", () => {
    // window.innerHeight is 768 in jsdom; top > that means below the fold.
    stubRect({ top: 1200, bottom: 1400 });
    render(<VideoPlayer videos={[videos[0]]} />);
    const item = document.querySelector(".video-episode-row") as HTMLElement;
    expect(item).not.toBeNull();
    expect(item.getAttribute("data-should-reveal")).toBe("hidden");
  });

  it("flips data-should-reveal to 'animate' and disconnects when the observer fires", () => {
    stubRect({ top: 1200, bottom: 1400 });
    render(<VideoPlayer videos={[videos[0]]} />);
    const item = document.querySelector(".video-episode-row") as HTMLElement;
    expect(item.getAttribute("data-should-reveal")).toBe("hidden");
    expect(ioInstances).toHaveLength(1);

    act(() => {
      ioInstances[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(item.getAttribute("data-should-reveal")).toBe("animate");
    expect(ioInstances[0].disconnect).toHaveBeenCalled();
  });

  it("does not hide an in-viewport tile even when the page has been scrolled (bfcache / refresh)", () => {
    // Reproduces the regression class fixed by commits bb60447 / d2d29fd:
    // a tile that is already visible must never be hidden by JS after paint.
    Object.defineProperty(window, "scrollY", { configurable: true, value: 400 });
    stubRect({ top: 100, bottom: 300 });
    render(<VideoPlayer videos={[videos[0]]} />);
    const item = document.querySelector(".video-episode-row") as HTMLElement;
    expect(item.hasAttribute("data-should-reveal")).toBe(false);
  });

  it("skips the reveal mechanism for reduced-motion users", () => {
    // jsdom doesn't define matchMedia; define it just for this test so the
    // reduced-motion branch in useLayoutEffect can read it.
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        onchange: null,
        dispatchEvent: jest.fn(() => true),
      }),
    });
    // Below-fold tile that would normally get data-should-reveal="hidden".
    stubRect({ top: 1200, bottom: 1400 });
    render(<VideoPlayer videos={[videos[0]]} />);
    const item = document.querySelector(".video-episode-row") as HTMLElement;
    expect(item.hasAttribute("data-should-reveal")).toBe(false);
    // Cleanup: remove matchMedia so other tests see the default (undefined).
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  it("eager-renders the first two iframes even when the intersection gate is closed", () => {
    // mockIsVisible = false simulates the pre-IO-fire state. The first two
    // tiles must render their iframe anyway (that's the point of eager) — the
    // third must wait for the gate.
    mockIsVisible = false;
    const three: VideoItem[] = [
      videos[0],
      videos[1],
      {
        title: "Episode 3: Third",
        embedUrl: "https://www.youtube.com/embed/ghi789",
        uploadDate: "2026-03-01T00:00:00+08:00",
      },
    ];
    render(<VideoPlayer videos={three} />);
    const iframes = document.querySelectorAll("iframe");
    expect(iframes).toHaveLength(2);
    expect(iframes[0]).toHaveAttribute("loading", "eager");
    expect(iframes[1]).toHaveAttribute("loading", "eager");
    // Every tile renders a placeholder now — it's the always-present "behind"
    // layer that the iframe crossfades over.
    const placeholders = document.querySelectorAll(".video-embed--placeholder");
    expect(placeholders).toHaveLength(3);
  });

  it("iframe starts without data-loaded attribute when first mounted", () => {
    mockIsVisible = true;
    render(<VideoPlayer videos={[videos[0]]} />);
    const iframe = screen.getByTitle("Episode 1: Test Video");
    // Initial render: onLoad hasn't fired, so the attribute is absent and the
    // iframe stays at opacity 0 via the Panda selector.
    expect(iframe.hasAttribute("data-loaded")).toBe(false);
  });

  it("iframe gets data-loaded='true' after onLoad fires", () => {
    mockIsVisible = true;
    render(<VideoPlayer videos={[videos[0]]} />);
    const iframe = screen.getByTitle("Episode 1: Test Video");
    act(() => {
      fireEvent.load(iframe);
    });
    expect(iframe).toHaveAttribute("data-loaded", "true");
  });

  it("thumbnail placeholder is rendered behind the iframe so it can crossfade", () => {
    mockIsVisible = true;
    render(<VideoPlayer videos={[videos[0]]} />);
    // Both layers coexist: placeholder behind, iframe overlaid on top.
    const iframe = screen.getByTitle("Episode 1: Test Video");
    const placeholder = document.querySelector(".video-embed--placeholder");
    expect(iframe).toBeInTheDocument();
    expect(placeholder).not.toBeNull();
  });

  it("flips data-loaded via the timeout fallback when onLoad never fires", () => {
    jest.useFakeTimers();
    mockIsVisible = true;
    render(<VideoPlayer videos={[videos[0]]} />);
    const iframe = screen.getByTitle("Episode 1: Test Video");
    expect(iframe.hasAttribute("data-loaded")).toBe(false);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(iframe).toHaveAttribute("data-loaded", "true");
    jest.useRealTimers();
  });

  it("keeps the iframe out of the tab order and AOM until it has loaded", () => {
    mockIsVisible = true;
    render(<VideoPlayer videos={[videos[0]]} />);
    const iframe = screen.getByTitle("Episode 1: Test Video");
    expect(iframe).toHaveAttribute("tabindex", "-1");
    expect(iframe).toHaveAttribute("aria-hidden", "true");

    act(() => {
      fireEvent.load(iframe);
    });

    // After load: attributes removed so the iframe behaves like a normal
    // interactive region.
    expect(iframe.hasAttribute("tabindex")).toBe(false);
    expect(iframe.hasAttribute("aria-hidden")).toBe(false);
  });
});
