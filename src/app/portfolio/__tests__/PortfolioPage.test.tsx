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
      portfolioCard: { cardTitle: "Travel Photography", thumbnail: "/travel-t.webp", order: 1 },
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
      portfolioCard: { cardTitle: "Stuck with Low Pay", thumbnail: "/stuck-t.webp", order: 1 },
    },
  ],
  getSocialMediaCards: () => [
    {
      slug: "ig-own-travel-log",
      type: "social-media",
      title: "Own Travel Log",
      description: "Travel IG",
      heading: "📍 Asia | Content Creator",
      ogImage: "/ig-travel.webp",
      hasGallery: true,
      portfolioCard: { cardTitle: "Own Travel Log", thumbnail: "/ig-travel-t.webp", order: 1 },
    },
  ],
  projectPath: (p: { type: string; slug: string }) => `/portfolio/${p.type}/${p.slug}/`,
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
    expect(screen.getByText("Video")).toBeInTheDocument();
  });

  it("renders a Social Media section heading", () => {
    expect(screen.getByText("Social Media")).toBeInTheDocument();
  });

  it("renders project cards with cardTitle", () => {
    expect(screen.getByText("Travel Photography")).toBeInTheDocument();
    expect(screen.getByText("Stuck with Low Pay")).toBeInTheDocument();
    expect(screen.getByText("Own Travel Log")).toBeInTheDocument();
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
