/**
 * ProjectCardsGrid — unit tests
 *
 * Tests cover:
 *  - Renders a card for each project
 *  - Renders CardSlideshow when project has > 1 slideshow image
 *  - Renders a fallback <Image> when project has ≤ 1 slideshow image
 *  - Each card links to the correct project path
 */

import { render, screen } from "@testing-library/react";
import ProjectCardsGrid from "@/components/portfolio/ProjectCardsGrid";
import type { VideoProject, PhotographyProject } from "@/types/portfolio";

jest.mock("@/lib/gallery-images", () => ({
  getProjectSlideshowImages: jest.fn(),
}));

jest.mock("@/lib/portfolio-config", () => ({
  projectPath: (p: { type: string; slug: string }) =>
    `/portfolio/${p.type}/${p.slug}/`,
}));

jest.mock("@/components/gallery/CardSlideshow", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => (
    <div data-testid="card-slideshow" aria-label={alt} />
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" {...props} />
  ),
}));

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

import { getProjectSlideshowImages } from "@/lib/gallery-images";
const mockGetSlideshowImages = getProjectSlideshowImages as jest.Mock;

const VIDEO_PROJECT: VideoProject = {
  slug: "stuck-low-pay",
  type: "video",
  title: "Stuck with Low Pay",
  description: "Documentary",
  heading: "Producer | Director | 📍 Taiwan",
  ogImage: "/stuck.webp",
  videos: [],
  portfolioCard: { cardTitle: "CNA | Stuck With Low Pay", thumbnail: "/thumb.webp" },
};

const PHOTO_PROJECT: PhotographyProject = {
  slug: "event-photography",
  type: "photography",
  title: "Event Photography",
  description: "Events",
  heading: "Photographer | 📍 Singapore",
  ogImage: "/event.webp",
  enableDownload: false,
  imageCount: 10,
  portfolioCard: { cardTitle: "Event Photography", thumbnail: "/event-t.webp" },
};

describe("ProjectCardsGrid", () => {
  beforeEach(() => {
    mockGetSlideshowImages.mockReturnValue([]);
  });

  it("renders one card per project", () => {
    render(
      <ProjectCardsGrid
        projects={[VIDEO_PROJECT, PHOTO_PROJECT]}
        type="video"
        fallbackImageHeight={450}
      />
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("renders CardSlideshow when project has more than one slideshow image", () => {
    mockGetSlideshowImages.mockReturnValue([
      { src: "/a.webp" },
      { src: "/b.webp" },
    ]);
    render(
      <ProjectCardsGrid
        projects={[VIDEO_PROJECT]}
        type="video"
        fallbackImageHeight={450}
      />
    );
    expect(screen.getByTestId("card-slideshow")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a fallback image when project has ≤ 1 slideshow image", () => {
    mockGetSlideshowImages.mockReturnValue([]);
    render(
      <ProjectCardsGrid
        projects={[VIDEO_PROJECT]}
        type="video"
        fallbackImageHeight={450}
      />
    );
    expect(screen.queryByTestId("card-slideshow")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("links each card to the correct project path", () => {
    render(
      <ProjectCardsGrid
        projects={[VIDEO_PROJECT]}
        type="video"
        fallbackImageHeight={450}
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/portfolio/video/stuck-low-pay/"
    );
  });

  it("renders the card title", () => {
    render(
      <ProjectCardsGrid
        projects={[VIDEO_PROJECT]}
        type="video"
        fallbackImageHeight={450}
      />
    );
    expect(screen.getByText("CNA | Stuck With Low Pay")).toBeInTheDocument();
  });
});
