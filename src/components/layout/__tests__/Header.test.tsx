import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/Header";

// Navigation is a client component that uses Next.js hooks — mock it simply
jest.mock("@/components/layout/Navigation", () => ({
  __esModule: true,
  default: () => <nav data-testid="navigation" />,
}));

describe("Header", () => {
  it("renders the site logo image", () => {
    render(<Header />);
    const logo = screen.getByRole("img", { name: /jinee chen logo/i });
    expect(logo).toBeInTheDocument();
  });

  it("logo is wrapped in a link to the home page", () => {
    render(<Header />);
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders the tagline text", () => {
    render(<Header />);
    expect(screen.getByText(/visual storyteller/i)).toBeInTheDocument();
  });

  it("includes the Navigation component", () => {
    render(<Header />);
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
  });
});
