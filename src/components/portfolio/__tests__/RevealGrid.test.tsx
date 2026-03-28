import { render } from "@testing-library/react";
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

  it("sets data-reveal-ready after mount", () => {
    const { container } = render(
      <RevealGrid>
        <div className="project-card">card</div>
      </RevealGrid>
    );
    expect(container.firstChild).toHaveAttribute("data-reveal-ready");
  });

  it("observes .project-card children", () => {
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
});
