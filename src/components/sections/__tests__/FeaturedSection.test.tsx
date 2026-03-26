import { render, screen } from "@testing-library/react";
import FeaturedSection from "../FeaturedSection";

// Mock portfolio-config
jest.mock("@/lib/portfolio-config", () => ({
  getVideoCards: () => [
    {
      slug: "test-video",
      type: "video",
      title: "Test Video",
      description: "A test video",
      heading: "Test",
      ogImage: "/test.webp",
      videos: [],
      portfolioCard: {
        cardTitle: "Test Card",
        thumbnail: "/thumb.webp",
        order: 1,
      },
    },
  ],
  portfolioIndexConfig: {
    socialMediaLinks: [
      {
        url: "https://instagram.com/p/test1",
        image: "/ig1.webp",
        alt: "IG post 1",
      },
    ],
    videoSectionTitle: "My Work",
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("FeaturedSection", () => {
  beforeEach(() => render(<FeaturedSection />));

  it("renders portfolio section with id", () => {
    const section = document.querySelector("#portfolio");
    expect(section).toBeInTheDocument();
  });

  it('renders "My Work" heading', () => {
    expect(screen.getByText("My Work")).toBeInTheDocument();
  });

  it("renders video project cards", () => {
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("renders video card with correct link", () => {
    const link = screen.getByText("Test Card").closest("a");
    expect(link).toHaveAttribute("href", "/portfolio/video/test-video/");
  });

  it("renders Instagram previews", () => {
    expect(screen.getByAltText("IG post 1")).toBeInTheDocument();
  });

  it('renders "View More Projects" link', () => {
    const link = screen.getByText("View More Projects");
    expect(link).toHaveAttribute("href", "/portfolio/");
  });
});
