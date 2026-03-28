import { render, screen } from "@testing-library/react";
import AboutSection from "../AboutSection";

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

describe("AboutSection", () => {
  beforeEach(() => render(<AboutSection />));

  it("renders about section with id", () => {
    const section = document.querySelector("#about");
    expect(section).toBeInTheDocument();
  });

  it("renders heading", () => {
    expect(
      screen.getByRole("heading", { name: /Video Producer/i })
    ).toBeInTheDocument();
  });

  it("renders avatar image", () => {
    expect(screen.getByAltText("Jinee Chen portrait")).toBeInTheDocument();
  });

  it("renders English bio text", () => {
    expect(
      screen.getByText(/professional photographer/i)
    ).toBeInTheDocument();
  });

  it("renders Chinese bio text", () => {
    const chineseBlock = document.querySelector("[lang='zh-Hant']");
    expect(chineseBlock).toBeInTheDocument();
    expect(chineseBlock!.textContent).toContain("Jinee");
  });
});
