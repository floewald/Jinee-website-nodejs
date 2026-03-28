import { render, screen, fireEvent } from "@testing-library/react";
import ContactForm from "@/components/forms/ContactForm";

// Mock BACKEND_URL constant
jest.mock("@/lib/constants", () => ({
  BACKEND_URL: "http://localhost:8080",
  SITE_NAME: "Jinee Chen",
  SITE_EMAIL: "hello@jineechen.com",
  SITE_URL: "https://jineechen.com",
  SITE_TAGLINE: "Visual storyteller",
  GALLERY_COLUMNS: { xs: 2, sm: 3, md: 4 },
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  sessionStorage.clear();
});

describe("ContactForm", () => {
  it("renders all required fields", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("renders the phone optional field", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it("renders the consent checkbox", () => {
    render(<ContactForm />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("has placeholder text on all text inputs", () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+65/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tell me about your project/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<ContactForm />);
    expect(
      screen.getByRole("button", { name: /send/i })
    ).toBeInTheDocument();
  });

  it("shows a success message after successful submission", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "test-csrf" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok" }),
      });

    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Wong" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Hello there" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    const success = await screen.findByText(/message sent|thank you/i);
    expect(success).toBeInTheDocument();
  });

  it("shows an error message when the backend returns an error", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "test-csrf" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "error", message: "Spam detected." }),
      });

    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    const error = await screen.findByText(/spam detected|failed/i);
    expect(error).toBeInTheDocument();
  });

  it("shows a network error message when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network failure")
    );

    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    const error = await screen.findByText(/network|error|try again/i);
    expect(error).toBeInTheDocument();
  });

  it("disables the submit button while sending", async () => {
    let resolveFirst: (v: unknown) => void;
    (global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise((res) => {
        resolveFirst = res;
      })
    );

    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByRole("button", { name: /send|sending/i })).toBeDisabled();

    // resolve to avoid hanging
    resolveFirst!({
      ok: true,
      json: async () => ({ token: "t" }),
    });
  });
});
