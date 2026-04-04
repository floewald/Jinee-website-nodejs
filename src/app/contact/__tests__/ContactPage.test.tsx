import { render, screen } from "@testing-library/react";
import ContactPage from "../page";

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

jest.mock("@/components/forms/ContactForm", () => ({
  __esModule: true,
  default: () => <form data-testid="contact-form" />,
}));

describe("ContactPage (/contact)", () => {
  it("renders the contact section", () => {
    render(<ContactPage />);
    expect(document.querySelector("#contact")).toBeInTheDocument();
  });

  it("renders the contact form", () => {
    render(<ContactPage />);
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("renders the email link", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("link", { name: /hello@jineechen/i })
    ).toHaveAttribute("href", "mailto:hello@jineechen.com");
  });

  it("renders the Calendly link", () => {
    render(<ContactPage />);
    expect(screen.getByRole("link", { name: /Calendly/i })).toBeInTheDocument();
  });
});
