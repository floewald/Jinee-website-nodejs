import { render, screen, fireEvent } from "@testing-library/react";
import Navigation from "@/components/layout/Navigation";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Prevent real browser scroll APIs from running during unit tests
jest.mock("@/lib/scroll-config", () => ({
  scrollToTop: jest.fn(),
  scrollToId: jest.fn(),
  animateScrollTo: jest.fn(),
  SCROLL_DURATION_MS: 2000,
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

  it("about link points to /about/", () => {
    render(<Navigation />);
    const aboutLink = screen.getByRole("link", { name: /about/i });
    expect(aboutLink).toHaveAttribute("href", "/about/");
  });

  it("portfolio link points to /portfolio/ (not an anchor)", () => {
    render(<Navigation />);
    const portfolioLink = screen.getByRole("link", { name: /^portfolio$/i });
    expect(portfolioLink).toHaveAttribute("href", "/portfolio/");
  });

  it("contact link points to the /contact/ page (not an anchor)", () => {
    render(<Navigation />);
    const contactLink = screen.getByRole("link", { name: /contact/i });
    expect(contactLink).toHaveAttribute("href", "/contact/");
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

describe("Navigation — auto-close mobile menu and Overview link", () => {
  // These tests only exercise links whose handlers are width-independent
  // (Home/About/Contact/submenu links all just close the menu + maybe scroll).
  // They deliberately do NOT click the Portfolio parent, whose behavior is
  // width-gated (`window.innerWidth <= 800`). jsdom leaves innerWidth at its
  // default here, so if you ever add a Portfolio-parent click to this block,
  // set window.innerWidth explicitly first (see the mobile-toggle block below).

  /** Opens the mobile menu by clicking the hamburger button. */
  function openMenu() {
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggle);
    return toggle;
  }

  // NOTE: the Overview link is hidden on desktop purely via CSS
  // (`@media (min-width: 801px) { display: none }`). jsdom does not apply
  // stylesheets, so that visual hiding can only be verified visually / via E2E.
  // This unit test therefore only asserts presence + correct href.
  it("renders an Overview link pointing to /portfolio/", () => {
    render(<Navigation />);
    const overviewLink = screen.getByRole("link", { name: /^overview$/i });
    expect(overviewLink).toBeInTheDocument();
    expect(overviewLink).toHaveAttribute("href", "/portfolio/");
  });

  it("clicking Home closes the menu (aria-expanded becomes false)", () => {
    render(<Navigation />);
    const toggle = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name: /^home$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking About closes the menu (aria-expanded becomes false)", () => {
    render(<Navigation />);
    const toggle = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name: /^about$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking Contact closes the menu (aria-expanded becomes false)", () => {
    render(<Navigation />);
    const toggle = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name: /^contact$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking Photography submenu link closes the menu", () => {
    render(<Navigation />);
    const toggle = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name: /^photography$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking Videography submenu link closes the menu", () => {
    render(<Navigation />);
    const toggle = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name: /^videography$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking Social Media submenu link closes the menu", () => {
    render(<Navigation />);
    const toggle = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name: /^social media$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking Overview submenu link closes the menu", () => {
    render(<Navigation />);
    const toggle = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name: /^overview$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Navigation — mobile Portfolio submenu toggle (innerWidth <= 800)", () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      value: 375,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
  });

  function openMenu() {
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggle);
    return toggle;
  }

  it("first tap on Portfolio opens the submenu, does not navigate, and keeps the menu open", () => {
    render(<Navigation />);
    const toggle = openMenu();
    const portfolio = screen.getByRole("link", { name: /^portfolio$/i });

    expect(portfolio).toHaveAttribute("aria-expanded", "false");

    // preventDefault is expected on mobile (no navigation)
    const clickEvent = fireEvent.click(portfolio);
    // fireEvent.click returns false when the event's default was prevented
    expect(clickEvent).toBe(false);

    // submenu now expanded, and the menu itself stays open
    expect(portfolio).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("reopening the menu via the hamburger resets the Portfolio submenu", () => {
    render(<Navigation />);
    const toggle = openMenu();
    const portfolio = screen.getByRole("link", { name: /^portfolio$/i });

    // open the submenu
    fireEvent.click(portfolio);
    expect(portfolio).toHaveAttribute("aria-expanded", "true");

    // close the whole menu via the hamburger
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    // reopen the menu — submenu must start collapsed again
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(portfolio).toHaveAttribute("aria-expanded", "false");
  });
});
