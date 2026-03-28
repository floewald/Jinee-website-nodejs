import { render, screen } from "@testing-library/react";
import PortfolioPage from "@/app/portfolio/page";

jest.mock("@/lib/portfolio-config", () => ({
  getPhotographyCards: () => [
    {
      slug: "travel-photography",
      type: "photography",
      title: "Travel Photography",
      description: "Travel shots",
      heading: "📍 Singapore | Photographer",
      ogImage: "/travel.webp",
      portfolioCard: { cardTitle: "Travel Photography", thumbnail: "/travel-t.webp" },
    },
  ],
  getVideoCards: () => [
    {
      slug: "stuck-low-pay",
      type: "video",
      title: "Stuck with Low Pay",
      description: "Documentary",
      heading: "📍 Singapore | Producer | Director",
      ogImage: "/stuck.webp",
      videos: [],
      portfolioCard: { cardTitle: "Stuck with Low Pay", thumbnail: "/stuck-t.webp" },
    },
  ],
  portfolioIndexConfig: {
    socialMediaLinks: [
      {
        url: "https://www.instagram.com/reel/test/",
        image: "/assets/social-media/ig-own-travel-log/ig-own-travel-log-1.webp",
        alt: "Instagram own travel log 1",
      },
    ],
  },
  projectPath: (p: { type: string; slug: string }) => `/portfolio/${p.type}/${p.slug}/`,
}));

jest.mock("@/components/gallery/CardSlideshow", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <div data-testid="card-slideshow" aria-label={alt} />,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("PortfolioPage (hub)", () => {
  beforeEach(() => render(<PortfolioPage />));

  it("renders a Photography section heading", () => {
    expect(screen.getByText("Photography")).toBeInTheDocument();
  });

  it("renders a Video section heading", () => {
    expect(screen.getByText("Videography")).toBeInTheDocument();
  });

  it("renders a Social Media section heading", () => {
    expect(screen.getByText("Social Media")).toBeInTheDocument();
  });

  it("renders project cards with cardTitle", () => {
    expect(screen.getByText("Travel Photography")).toBeInTheDocument();
    expect(screen.getByText("Stuck with Low Pay")).toBeInTheDocument();
  });

  it("renders social media instagram previews", () => {
    // The play overlay ▶ is rendered inside each instagram preview link
    const overlays = screen.getAllByText("▶");
    expect(overlays.length).toBeGreaterThan(0);
  });

  it("renders no description paragraph in project cards", () => {
    const descs = document.querySelectorAll(".project-card__desc");
    expect(descs.length).toBe(0);
  });

  it("renders 'More Photography Projects' CTA", () => {
    expect(screen.getByText(/more photography projects/i)).toBeInTheDocument();
  });

  it("renders 'More Video Projects' CTA", () => {
    expect(screen.getByText(/more video projects/i)).toBeInTheDocument();
  });

  it("renders 'More Social Media Projects' CTA", () => {
    expect(screen.getByText(/more social media projects/i)).toBeInTheDocument();
  });
});
