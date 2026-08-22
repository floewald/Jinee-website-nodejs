import { render, screen } from "@testing-library/react";
import RevealGrid from "@/components/portfolio/RevealGrid";

beforeEach(() => {
  (global.IntersectionObserver as jest.Mock).mockClear();
});

describe("RevealGrid", () => {
  it("renders children inside a div wrapper", () => {
    const { container } = render(
      <RevealGrid>
        <div className="project-card">card</div>
      </RevealGrid>
    );
    expect(container.querySelector(".project-card")).toBeInTheDocument();
  });

  it("accepts a className prop", () => {
    const { container } = render(
      <RevealGrid className="project-grid">
        <span>child</span>
      </RevealGrid>
    );
    expect(container.firstChild).toHaveClass("project-grid");
  });

  it("does not gate visibility behind data-reveal-ready", () => {
    const { container } = render(
      <RevealGrid>
        <div className="project-card">card</div>
      </RevealGrid>
    );
    expect(container.firstChild).not.toHaveAttribute("data-reveal-ready");
  });

  it("applies shared reveal treatment without mutating project cards inline", () => {
    const { container } = render(
      <RevealGrid>
        <a className="project-card" href="#">
          Card
        </a>
      </RevealGrid>
    );
    expect(container.firstChild).toHaveClass("panda-mock");
    expect(screen.getByRole("link")).not.toHaveAttribute("style");
  });

  it("observes out-of-range .project-card children for progressive animation", () => {
    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(
        () =>
          ({
            top: 2000,
            bottom: 2200,
            left: 0,
            right: 200,
            width: 200,
            height: 200,
            x: 0,
            y: 2000,
            toJSON: () => ({}),
          }) as DOMRect
      );

    render(
      <RevealGrid>
        <a className="project-card">Card 1</a>
        <a className="project-card">Card 2</a>
      </RevealGrid>
    );
    const mockObserver = (global.IntersectionObserver as jest.Mock).mock
      .results[0].value;
    expect(mockObserver.observe).toHaveBeenCalledTimes(2);
  });

  it("observes out-of-range .instagram-preview children with the social preset hook", () => {
    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(
        () =>
          ({
            top: 2000,
            bottom: 2711,
            left: 0,
            right: 400,
            width: 400,
            height: 711,
            x: 0,
            y: 2000,
            toJSON: () => ({}),
          }) as DOMRect
      );

    render(
      <RevealGrid>
        <a className="instagram-preview">Preview 1</a>
        <a className="instagram-preview">Preview 2</a>
      </RevealGrid>
    );
    const mockObserver = (global.IntersectionObserver as jest.Mock).mock
      .results[0].value;
    expect(mockObserver.observe).toHaveBeenCalledTimes(2);
  });
});
