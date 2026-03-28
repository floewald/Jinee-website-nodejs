/**
 * src/app/not-found.tsx — custom 404 page tests
 *
 * Verifies the branded Not Found page renders a heading and a home link.
 */

import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("NotFound (404 page)", () => {
  it("renders a 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByRole("heading").textContent).toMatch(/404/);
  });

  it("renders a link back to the homepage", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /back to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
