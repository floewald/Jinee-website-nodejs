import { render, screen } from "@testing-library/react";
import Footer from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/Jinee Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it("renders the contact email link", () => {
    render(<Footer />);
    const emailLink = screen.getByRole("link", { name: /hello@jineechen.com/i });
    expect(emailLink).toHaveAttribute("href", "mailto:hello@jineechen.com");
  });

  it("renders the Calendly booking link", () => {
    render(<Footer />);
    const bookLink = screen.getByRole("link", { name: /book a meeting/i });
    expect(bookLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(bookLink).toHaveAttribute(
      "href",
      expect.stringContaining("calendly.com")
    );
  });

  it("renders the Imprint link", () => {
    render(<Footer />);
    const imprintLink = screen.getByRole("link", { name: /imprint/i });
    expect(imprintLink).toBeInTheDocument();
  });

  it("renders the Privacy Policy link", () => {
    render(<Footer />);
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toBeInTheDocument();
  });
});
