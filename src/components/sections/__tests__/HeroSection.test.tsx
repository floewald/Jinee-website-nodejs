import { render, screen } from "@testing-library/react";
import HeroSection from "../HeroSection";

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

describe("HeroSection", () => {
  it("renders a section element", () => {
    render(<HeroSection src="/assets/photography/travel-photography/0019_16-1600.webp" alt="hero" />);
    expect(document.querySelector("section.hero-section")).toBeInTheDocument();
  });

  it("renders an image with the given src", () => {
    render(<HeroSection src="/assets/test-hero.webp" alt="Travel photography hero" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/assets/test-hero.webp");
  });

  it("renders an image with the given alt text", () => {
    render(<HeroSection src="/assets/test-hero.webp" alt="Travel photography hero" />);
    expect(screen.getByAltText("Travel photography hero")).toBeInTheDocument();
  });

  it("image has sizes='100vw' for full-width rendering", () => {
    render(<HeroSection src="/assets/test-hero.webp" alt="hero" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("sizes", "100vw");
  });
});
