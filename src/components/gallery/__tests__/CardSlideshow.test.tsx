/**
 * CardSlideshow — unit tests
 *
 * Tests cover:
 *  - Initial render (all images present, first slide active)
 *  - Swipe left  → advance to next slide
 *  - Swipe right → go to previous slide (wraps to last)
 *  - Wraps from last slide back to first on swipe left
 *  - Single-image: no autoplay timer started
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { unoptimized: _u, fill: _f, sizes: _s, placeholder: _p, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...rest} />;
  },
}));

const IMAGES = [
  { src: "/img/a-800.webp" },
  { src: "/img/b-800.webp" },
  { src: "/img/c-800.webp" },
];

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
  it("renders one img element per image", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" />);
    // querySelector finds all <img> regardless of alt/role
    expect(container.querySelectorAll("img")).toHaveLength(3);
  });

  it("the first slide is active on initial render", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" />);
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[0]).toHaveClass("card-slideshow__slide--active");
    expect(slides[1]).not.toHaveClass("card-slideshow__slide--active");
    expect(slides[2]).not.toHaveClass("card-slideshow__slide--active");
  });

  it("swipe left advances to the second slide", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" />);
    swipeLeft(container.querySelector(".card-slideshow")!);
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[1]).toHaveClass("card-slideshow__slide--active");
  });

  it("swipe right from the first slide wraps to the last slide", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" />);
    swipeRight(container.querySelector(".card-slideshow")!);
    const slides = container.querySelectorAll(".card-slideshow__slide");
    expect(slides[2]).toHaveClass("card-slideshow__slide--active");
  });

  it("swipe left wraps from the last slide back to the first", () => {
    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" />);
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
      <CardSlideshow images={imagesWithBlur} alt="Blur test" />
    );
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("blurDataURL", "data:image/webp;base64,TESTBLUR");
  });

  it("does not start autoplay when only one image is provided", () => {
    const { container } = render(
      <CardSlideshow images={[IMAGES[0]]} alt="Single" />
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Image = MockImage;

    const { container } = render(<CardSlideshow images={IMAGES} alt="Gallery" />);
    swipeLeft(container.querySelector(".card-slideshow")!);

    // After advancing to index 1, the next image (index 2) should be preloaded
    expect(MockImage).toHaveBeenCalled();
    expect(mockImageInstance.src).toBe(IMAGES[2].src);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Image = origImage;
  });
});
