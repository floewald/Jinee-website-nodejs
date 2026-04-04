import { render, screen, act } from "@testing-library/react";
import HeroSlideshow from "@/components/sections/HeroSlideshow";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      sizes?: string;
      priority?: boolean;
    }
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill: _f, sizes: _s, priority: _p, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...rest} />;
  },
}));

const SLIDES = [
  { src: "/img/a.webp", alt: "Slide A" },
  { src: "/img/b.webp", alt: "Slide B" },
  { src: "/img/c.webp", alt: "Slide C" },
];

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("HeroSlideshow", () => {
  it("renders all slides", () => {
    const { container } = render(
      <HeroSlideshow slides={SLIDES} intervalMs={1000} />
    );
    expect(container.querySelectorAll(".hero-slide")).toHaveLength(3);
  });

  it("first slide is active on initial render", () => {
    const { container } = render(
      <HeroSlideshow slides={SLIDES} intervalMs={1000} />
    );
    const slides = container.querySelectorAll(".hero-slide");
    expect(slides[0]).toHaveClass("hero-slide--active");
    expect(slides[1]).not.toHaveClass("hero-slide--active");
  });

  it("advances to the next slide after the interval", () => {
    const { container } = render(
      <HeroSlideshow slides={SLIDES} intervalMs={1000} />
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const slides = container.querySelectorAll(".hero-slide");
    expect(slides[1]).toHaveClass("hero-slide--active");
    expect(slides[0]).not.toHaveClass("hero-slide--active");
  });

  it("wraps back to first slide after the last one", () => {
    const { container } = render(
      <HeroSlideshow slides={SLIDES} intervalMs={1000} />
    );
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    const slides = container.querySelectorAll(".hero-slide");
    expect(slides[0]).toHaveClass("hero-slide--active");
  });

  it("renders the section with aria-label", () => {
    render(<HeroSlideshow slides={SLIDES} />);
    expect(screen.getByRole("region", { name: /hero slideshow/i })).toBeInTheDocument();
  });

  it("renders nothing when slides array is empty", () => {
    const { container } = render(<HeroSlideshow slides={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not start a timer for a single slide", () => {
    const timerSpy = jest.spyOn(global, "setInterval");
    render(<HeroSlideshow slides={[SLIDES[0]]} intervalMs={1000} />);
    expect(timerSpy).not.toHaveBeenCalled();
    timerSpy.mockRestore();
  });
});
