import { render, screen } from "@testing-library/react";
import ContactSection from "../ContactSection";

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

// Mock ContactForm to isolate section-level tests
jest.mock("@/components/forms/ContactForm", () => ({
  __esModule: true,
  default: () => <form data-testid="contact-form" />,
}));

describe("ContactSection", () => {
  beforeEach(() => render(<ContactSection />));

  it("renders contact section with id", () => {
    const section = document.querySelector("#contact");
    expect(section).toBeInTheDocument();
  });

  it("renders contact form", () => {
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("renders email link", () => {
    const link = screen.getByRole("link", { name: /hello@jineechen/i });
    expect(link).toHaveAttribute("href", "mailto:hello@jineechen.com");
  });

  it("renders Calendly link", () => {
    const link = screen.getByRole("link", { name: /Calendly/i });
    expect(link).toHaveAttribute(
      "href",
      "https://calendly.com/jineechen/15min"
    );
  });

  it("renders contact photo", () => {
    expect(
      screen.getByAltText("Jinee Chen — professional portrait")
    ).toBeInTheDocument();
  });
});
