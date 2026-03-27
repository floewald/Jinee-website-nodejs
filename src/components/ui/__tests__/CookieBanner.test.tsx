import { render, screen, fireEvent, act } from "@testing-library/react";
import CookieBanner from "@/components/ui/CookieBanner";

// Helpers to manipulate document.cookie in jsdom
function clearConsentCookie() {
  document.cookie = "site_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

beforeEach(() => {
  clearConsentCookie();
});

describe("CookieBanner", () => {
  it("renders the banner when no consent cookie exists", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("region", { name: /cookie consent/i })).toBeInTheDocument();
  });

  it("does NOT render the banner when consent is already stored", () => {
    document.cookie = "site_consent=%7B%22analytics%22%3Atrue%7D; path=/";
    render(<CookieBanner />);
    expect(screen.queryByRole("region", { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it("renders Accept and Reject buttons", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });

  it("renders a link to the Privacy Policy", () => {
    render(<CookieBanner />);
    const link = screen.getByRole("link", { name: /privacy policy/i });
    expect(link).toHaveAttribute("href", "/privacy/");
  });

  it("hides the banner when Accept is clicked", () => {
    render(<CookieBanner />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    });
    expect(screen.queryByRole("region", { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it("sets site_consent cookie with analytics:true on Accept", () => {
    render(<CookieBanner />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    });
    expect(document.cookie).toContain("site_consent");
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("site_consent="))
      ?.split("=")
      .slice(1)
      .join("=");
    const parsed = JSON.parse(decodeURIComponent(raw ?? "{}"));
    expect(parsed.analytics).toBe(true);
  });

  it("hides the banner when Reject is clicked", () => {
    render(<CookieBanner />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    });
    expect(screen.queryByRole("region", { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it("sets site_consent cookie with analytics:false on Reject", () => {
    render(<CookieBanner />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    });
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("site_consent="))
      ?.split("=")
      .slice(1)
      .join("=");
    const parsed = JSON.parse(decodeURIComponent(raw ?? "{}"));
    expect(parsed.analytics).toBe(false);
  });
});
