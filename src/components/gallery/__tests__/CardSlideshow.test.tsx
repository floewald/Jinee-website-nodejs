/**
 * CardSlideshow — unit tests
 *
 * Tests cover:
 *  - Initial render (only a bounded slide window is present, first slide active)
 *  - Swipe left  → advance to next slide
 *  - Swipe right → go to previous slide (wraps to last)
 *  - Wraps from last slide back to first on swipe left
 *  - Single-image: no autoplay timer started
 */

import { render, fireEvent, act } from "@testing-library/react";
import CardSlideshow from "@/components/gallery/CardSlideshow";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      unoptimized?: boolean;
      fill?: boolean;
      sizes?: string;
      blurDataURL?: string;
      placeholder?: string;
    }
  ) => {
    const {
      unoptimized: _u,
      fill: _f,
      sizes: _s,
      placeholder: _p,
      blurDataURL,
      ...rest
    } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" data-blur-data-url={blurDataURL} {...rest} />;
  },
}));

const IMAGES = [
  { src: "/img/a-800.webp" },
  { src: "/img/b-800.webp" },
  { src: "/img/c-800.webp" },
];

const MANY_IMAGES = Array.from({ length: 12 }, (_, i) => ({
  src: `/img/${String(i + 1).padStart(2, "0")}-800.webp`,
}));

const REPLACEMENT_IMAGES = Array.from({ length: 4 }, (_, i) => ({
  src: `/new/${String(i + 1).padStart(2, "0")}-800.webp`,
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Helper: simulate a left swipe (right-to-left finger movement)
function swipeLeft(el: Element) {
  fireEvent.touchStart(el, { touches: [{ clientX: 300, clientY: 100 }] });
  fireEvent.touchEnd(el, { changedTouches: [{ clientX: 100, clientY: 100 }] });
}

// Helper: simulate a right swipe (left-to-right finger movement)
function swipeRight(el: Element) {
  fireEvent.touchStart(el, { touches: [{ clientX: 100, clientY: 100 }] });
  fireEvent.touchEnd(el, { changedTouches: [{ clientX: 300, clientY: 100 }] });
}

describe("CardSlideshow", () => {
  it("renders only a bounded active/adjacent slide window when many images are provided", () => {
    const { container } = render(<CardSlideshow images={MANY_IMAGES} alt="Gallery" cardIndex={0} />);

    expect(container.querySelectorAll("img")).toHaveLength(3);
    expect(container.querySelector('img[src="/img/12-800.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/img/01-800.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/img/02-800.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/img/07-800.webp"]')).not.toBeInTheDocument();
  });

  it("keeps looping through images that were not mounted initially", () => {
    const { container } = render(<CardSlideshow images={MANY_IMAGES} alt="Gallery" cardIndex={0} />);
    const track = container.querySelector(".card-slideshow")!;

    for (let i = 0; i < 6; i += 1) {
      swipeLeft(track);
    }

    const activeImg = container.querySelector(".card-slideshow__slide--active img");
    expect(activeImg).toHaveAttribute("src", MANY_IMAGES[6].src);
    expect(container.querySelectorAll("img").length).toBeLessThan(MANY_IMAGES.length);
  });

  it("wraps through every image in a bounded large slideshow", () => {
    const { container } = render(<CardSlideshow images={MANY_IMAGES} alt="Gallery" cardIndex={0} />);
    const track = container.querySelector(".card-slideshow")!;

    for (let i = 0; i < MANY_IMAGES.length; i += 1) {
      swipeLeft(track);
    }

    const activeImg = container.querySelector(".card-slideshow__slide--active img");
    expect(activeImg).toHaveAttribute("src", MANY_IMAGES[0].src);
    expect(container.querySelectorAll("img").length).toBeLessThan(MANY_IMAGES.length);
  });

  it("detects portrait orientation from the preloaded next image", () => {
    const OriginalImage = window.Image;

    class MockPreloadImage {
      naturalWidth = 800;
      naturalHeight = 1200;
      onload: (() => void) | null = null;
      private _src = "";

      set src(value: string) {
        this._src = value;
        this.onload?.();
      }

      get src() {
        return this._src;
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Image = jest.fn(() => new MockPreloadImage());

      const { container } = render(<CardSlideshow images={MANY_IMAGES} alt="Gallery" cardIndex={0} />);

      const nextSlide = container
        .querySelector('img[src="/img/02-800.webp"]')
        ?.closest(".card-slideshow__slide");
      expect(nextSlide).toHaveClass("card-slideshow__slide--portrait");
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Image = OriginalImage;
    }
  });

  it("ignores stale preload portrait results after images change", () => {
    const OriginalImage = window.Image;
    const preloadImages: Array<{
      naturalWidth: number;
      naturalHeight: number;
      onload: (() => void) | null;
      src: string;
    }> = [];

    class MockPreloadImage {
      naturalWidth = 800;
      naturalHeight = 1200;
      onload: (() => void) | null = null;
      src = "";
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Image = jest.fn(() => {
        const image = new MockPreloadImage();
        preloadImages.push(image);
        return image;
      });

      const { container, rerender } = render(
        <CardSlideshow images={MANY_IMAGES.slice(0, 4)} alt="Gallery" cardIndex={0} />
      );
      const stalePreload = preloadImages[0];

      rerender(<CardSlideshow images={REPLACEMENT_IMAGES} alt="Gallery" cardIndex={0} />);

      act(() => {
        stalePreload.onload?.();
      });

      const replacementNextSlide = container
        .querySelector('img[src="/new/02-800.webp"]')
        ?.closest(".card-slideshow__slide");
      expect(replacementNextSlide).not.toHaveClass("card-slideshow__slide--portrait");
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Image = OriginalImage;
    }
  });

  it("the first slide is active on initial render", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" cardIndex={0} />);
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[0]).toHaveClass("card-slideshow__slide--active");
    expect(slides[1]).not.toHaveClass("card-slideshow__slide--active");
    expect(slides[2]).not.toHaveClass("card-slideshow__slide--active");
  });

  it("swipe left advances to the second slide", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" cardIndex={0} />);
    swipeLeft(container.querySelector(".card-slideshow")!);
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[1]).toHaveClass("card-slideshow__slide--active");
  });

  it("swipe right from the first slide wraps to the last slide", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" cardIndex={0} />);
    swipeRight(container.querySelector(".card-slideshow")!);
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[2]).toHaveClass("card-slideshow__slide--active");
  });

  it("swipe left wraps from the last slide back to the first", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" cardIndex={0} />);
    const track = container.querySelector(".card-slideshow")!;
    // Advance to last slide via two left swipes
    swipeLeft(track);
    swipeLeft(track);
    // One more left swipe should wrap to index 0
    swipeLeft(track);
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[0]).toHaveClass("card-slideshow__slide--active");
  });

  it("passes blurDataURL to the image when blur field is present", () => {
    const imagesWithBlur = [
      { src: "/img/a-800.webp", blur: "data:image/webp;base64,TESTBLUR" },
    ];
    const { container } = render(
      <CardSlideshow images={imagesWithBlur} alt="Blur test" cardIndex={0} />
    );
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("data-blur-data-url", "data:image/webp;base64,TESTBLUR");
  });

  it("does not start autoplay when only one image is provided", () => {
    const { container } = render(
      <CardSlideshow images={[IMAGES[0]]} alt="Single" cardIndex={0} />
    );
    act(() => {
      jest.advanceTimersByTime(20_000);
    });
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[0]).toHaveClass("card-slideshow__slide--active");
    expect(slides).toHaveLength(1);
  });

  it("preloads the next image when the active slide changes", () => {
    // Mock window.Image constructor to capture .src assignments
    const mockImageInstance = { src: "" };
    const MockImage = jest.fn(() => mockImageInstance);
    const origImage = window.Image;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Image = MockImage;

      const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" cardIndex={0} />);
      swipeLeft(container.querySelector(".card-slideshow")!);

      // After advancing to index 1, the next image (index 2) should be preloaded
      expect(MockImage).toHaveBeenCalled();
      expect(mockImageInstance.src).toBe(IMAGES[2].src);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Image = origImage;
    }
  });
});
