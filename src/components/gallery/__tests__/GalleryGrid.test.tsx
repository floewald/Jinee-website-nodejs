import fs from "node:fs";
import path from "node:path";
import { render, screen, fireEvent } from "@testing-library/react";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import type { GalleryImage } from "@/components/gallery/Lightbox";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => {
    const { unoptimized: _unoptimized, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...rest} />;
  },
}));

// react-masonry-css renders flex columns; mock it to render children directly
// so tests aren't coupled to the library's DOM structure.
jest.mock("react-masonry-css", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="masonry-grid">{children}</div>
  ),
}));

const IMAGES = [
  { src: "/img/a-800.webp", alt: "Photo A", srcFull: "/img/a-1600.webp", width: 800, height: 540 },
  { src: "/img/b-800.webp", alt: "Photo B", srcFull: "/img/b-1600.webp", width: 800, height: 1200 },
  { src: "/img/c-800.webp", alt: "Photo C", srcFull: "/img/c-1600.webp", width: 800, height: 533 },
];

function makeImages(prefix: string, count: number): GalleryImage[] {
  return Array.from({ length: count }, (_, index) => ({
    src: `/img/${prefix}-${index}-800.webp`,
    alt: `${prefix} photo ${index}`,
    srcFull: `/img/${prefix}-${index}-1600.webp`,
    width: 800,
    height: 540,
  }));
}

const GLOBALS_CSS = fs.readFileSync(
  path.join(process.cwd(), "src/app/globals.css"),
  "utf8"
);

beforeAll(() => {
  const style = document.createElement("style");
  style.setAttribute("data-testid", "globals-css");
  style.textContent = GLOBALS_CSS;
  document.head.appendChild(style);
});

describe("GalleryGrid", () => {
  const animateMock = jest.fn();

  class MockIntersectionObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
    static instances: MockIntersectionObserver[] = [];

    constructor() {
      MockIntersectionObserver.instances.push(this);
    }
  }

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      writable: true,
      value: animateMock,
    });
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  beforeEach(() => {
    animateMock.mockReset();
    MockIntersectionObserver.instances = [];
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => false,
    });
  });

  it("renders a grid item for every image", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    const items = screen.getAllByRole("img");
    expect(items).toHaveLength(3);
  });

  it("renders each image with the correct alt text", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(screen.getByRole("img", { name: "Photo A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Photo B" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Photo C" })).toBeInTheDocument();
  });

  it("calls onImageClick(0) when the first image is clicked", () => {
    const onImageClick = jest.fn();
    render(<GalleryGrid images={IMAGES} onImageClick={onImageClick} />);
    fireEvent.click(screen.getByRole("img", { name: "Photo A" }).closest("button")!);
    expect(onImageClick).toHaveBeenCalledWith(0);
  });

  it("calls onImageClick(2) when the third image is clicked", () => {
    const onImageClick = jest.fn();
    render(<GalleryGrid images={IMAGES} onImageClick={onImageClick} />);
    fireEvent.click(screen.getByRole("img", { name: "Photo C" }).closest("button")!);
    expect(onImageClick).toHaveBeenCalledWith(2);
  });

  it("renders nothing when images array is empty", () => {
    const { container } = render(<GalleryGrid images={[]} onImageClick={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders images inside the masonry grid container", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(screen.getByTestId("masonry-grid")).toBeInTheDocument();
  });

  it("does not render portrait background blur divs", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(document.querySelector(".gallery-portrait-bg")).toBeNull();
  });

  it("does not add gallery-item--portrait class to any item", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(document.querySelector(".gallery-item--portrait")).toBeNull();
  });

  it("every button has an accessible aria-label", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).toHaveAttribute("aria-label");
    });
  });

  it("renders columns layout when useColumnsLayout is true", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} useColumnsLayout />);
    expect(document.querySelector(".gallery-cols")).toBeInTheDocument();
    expect(screen.queryByTestId("masonry-grid")).toBeNull();
  });

  it("keeps priority gallery tiles eligible for reveal settling", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} useColumnsLayout />);
    expect(screen.getAllByRole("button")[0]).not.toHaveAttribute("data-reveal-state");
  });

  it("bounds priority loading to early gallery images", () => {
    render(<GalleryGrid images={makeImages("priority", 6)} onImageClick={jest.fn()} useColumnsLayout />);

    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("loading", "eager");
    expect(images[0]).toHaveAttribute("fetchpriority", "high");
    expect(images[3]).toHaveAttribute("loading", "eager");
    expect(images[3]).toHaveAttribute("fetchpriority", "high");
    expect(images[4]).toHaveAttribute("loading", "lazy");
    expect(images[4]).not.toHaveAttribute("fetchpriority");
  });

  it("observes a new image set after rerender", () => {
    const { rerender } = render(
      <GalleryGrid images={makeImages("first", 4)} onImageClick={jest.fn()} />
    );

    expect(MockIntersectionObserver.instances).toHaveLength(1);

    rerender(<GalleryGrid images={makeImages("second", 4)} onImageClick={jest.fn()} />);

    expect(MockIntersectionObserver.instances).toHaveLength(2);
    expect(MockIntersectionObserver.instances[1].observe).toHaveBeenCalledWith(
      screen.getByRole("img", { name: "second photo 0" }).closest(".gallery-item")
    );
  });

  it("passes intrinsic width and height through to gallery images", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);

    expect(screen.getByRole("img", { name: "Photo A" })).toHaveAttribute("width", "800");
    expect(screen.getByRole("img", { name: "Photo A" })).toHaveAttribute("height", "540");
    expect(screen.getByRole("img", { name: "Photo B" })).toHaveAttribute("height", "1200");
  });

  it("keeps gallery items visible by default even before any reveal class is applied", () => {
    render(
      <div data-reveal-ready="">
        <GalleryGrid images={IMAGES} onImageClick={jest.fn()} />
      </div>
    );

    const firstItem = screen.getByRole("img", { name: "Photo A" }).closest("button");
    expect(firstItem).not.toBeNull();
    expect(window.getComputedStyle(firstItem!).opacity).not.toBe("0");
  });

  it("settles visible gallery items from image load events after scroll", () => {
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

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rectVisibleInViewport as DOMRect);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 220,
    });

    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);

    const image = screen.getByRole("img", { name: "Photo A" });
    fireEvent.load(image);

    expect(animateMock).not.toHaveBeenCalled();
    expect(image.closest(".gallery-item")).toHaveAttribute("data-reveal-state", "settled");
  });
});
