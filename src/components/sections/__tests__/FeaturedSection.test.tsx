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
      heading: "Producer | Director | Videographer | 📍 Singapore",
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

// Mock CardSlideshow (only rendered when previewImages.length > 1)
jest.mock("@/components/gallery/CardSlideshow", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <div data-testid="card-slideshow" aria-label={alt} />,
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => <a href={href} className={className}>{children}</a>,
}));

describe("FeaturedSection", () => {
  beforeEach(() => render(<FeaturedSection />));

  it("renders portfolio section with id", () => {
    const section = document.querySelector("#portfolio");
    expect(section).toBeInTheDocument();
  });

  it('renders "Portfolio" heading (not "My Work")', () => {
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.queryByText("My Work")).not.toBeInTheDocument();
  });

  it("renders video project cards using project.heading (role/location)", () => {
    // role part (before 📍) rendered in .project-card__role
    expect(screen.getByText("Producer | Director | Videographer")).toBeInTheDocument();
  });

  it("renders location in a separate element outside the role clamp", () => {
    const role = document.querySelector(".project-card__role");
    const location = document.querySelector(".project-card__location");
    expect(role).toBeInTheDocument();
    expect(location).toBeInTheDocument();
    // location must NOT be a descendant of role
    expect(role).not.toContainElement(location as HTMLElement);
    expect(location).toHaveTextContent("📍 Singapore");
  });

  it("renders video card with correct link", () => {
    const link = screen.getByText("Producer | Director | Videographer").closest("a");
    expect(link).toHaveAttribute("href", "/portfolio/video/test-video/");
  });

  it("renders Instagram previews", () => {
    expect(screen.getByAltText("IG post 1")).toBeInTheDocument();
  });

  it("renders play overlay on Instagram previews", () => {
    const previews = document.querySelectorAll(".instagram-preview");
    previews.forEach((preview) => {
      expect(preview.querySelector(".play-overlay")).toBeInTheDocument();
    });
  });

  it('renders "View More Projects" link with btn--primary class', () => {
    const link = screen.getByText("View More Projects");
    expect(link).toHaveAttribute("href", "/portfolio/");
    expect(link).toHaveClass("btn--primary");
  });
});
