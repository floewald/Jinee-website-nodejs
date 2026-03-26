import { render, screen, fireEvent } from "@testing-library/react";
import Navigation from "@/components/layout/Navigation";

// Mock Next.js hooks
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Navigation", () => {
  it("renders primary nav items", () => {
    render(<Navigation />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });

  it("renders the nav toggle button for mobile", () => {
    render(<Navigation />);
    expect(
      screen.getByRole("button", { name: /toggle menu/i })
    ).toBeInTheDocument();
  });

  it("toggle button aria-expanded is false by default", () => {
    render(<Navigation />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("toggle button aria-expanded becomes true when clicked", () => {
    render(<Navigation />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("renders photography, social-media and video submenu links", () => {
    render(<Navigation />);
    expect(
      screen.getByRole("link", { name: /photography/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /social media/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /video/i })
    ).toBeInTheDocument();
  });
});
