import { render, screen, fireEvent, act } from "@testing-library/react";
import Slideshow from "@/components/gallery/Slideshow";

const IMAGES = [
  { src: "/img/a-800.webp", alt: "Slide A", srcFull: "/img/a-1600.webp" },
  { src: "/img/b-800.webp", alt: "Slide B", srcFull: "/img/b-1600.webp" },
  { src: "/img/c-800.webp", alt: "Slide C", srcFull: "/img/c-1600.webp" },
];

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("Slideshow", () => {
  it("renders nothing when images array is empty", () => {
    const { container } = render(<Slideshow images={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the first slide image on load", () => {
    render(<Slideshow images={IMAGES} autoplay={false} />);
    expect(screen.getByAltText("Slide A")).toBeInTheDocument();
  });

  it("renders one dot per image", () => {
    render(<Slideshow images={IMAGES} autoplay={false} />);
    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots).toHaveLength(3);
  });

  it("renders prev and next buttons", () => {
    render(<Slideshow images={IMAGES} autoplay={false} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("advances to slide 2 when next is clicked", () => {
    render(<Slideshow images={IMAGES} autoplay={false} />);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    // active dot should be index 1
    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots[1]).toHaveAttribute("aria-current", "true");
  });

  it("wraps around to last slide when prev is clicked from index 0", () => {
    render(<Slideshow images={IMAGES} autoplay={false} />);
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots[2]).toHaveAttribute("aria-current", "true");
  });

  it("jumps to the correct slide when a dot is clicked", () => {
    render(<Slideshow images={IMAGES} autoplay={false} />);
    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    fireEvent.click(dots[2]);
    expect(dots[2]).toHaveAttribute("aria-current", "true");
  });

  it("auto-advances to next slide after the interval", () => {
    render(<Slideshow images={IMAGES} autoplay interval={3000} />);
    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(dots[1]).toHaveAttribute("aria-current", "true");
  });
});
