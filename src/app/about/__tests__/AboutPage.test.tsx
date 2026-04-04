import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" {...props} />
  ),
}));

describe("AboutPage (/about/)", () => {
  it("renders the about section", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: /video producer/i })
    ).toBeInTheDocument();
  });

  it("renders Jinee's portrait image", () => {
    render(<AboutPage />);
    expect(screen.getByAltText("Jinee Chen portrait")).toBeInTheDocument();
  });

  it("renders location info", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Singapore/)).toBeInTheDocument();
  });

  it("renders the Chinese text section", () => {
    const { container } = render(<AboutPage />);
    expect(container.querySelector('[lang="zh-Hant"]')).toBeInTheDocument();
  });
});
