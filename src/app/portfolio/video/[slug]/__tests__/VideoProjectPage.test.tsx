import { render, screen } from "@testing-library/react";
import VideoProjectPage from "../page";

jest.mock("@/lib/portfolio-config", () => ({
  videoProjects: [
    {
      slug: "multi-video",
      type: "video",
      title: "Multi Video Project",
      description: "A concise project description.",
      longDescription: ["First paragraph.", "", "Second paragraph."],
      heading: "Producer | Director",
      location: "Singapore",
      ogImage: "https://jineechen.com/assets/videography/multi-video/multi-video-800.webp",
      videos: [
        {
          title: "Episode one",
          embedUrl: "https://www.youtube.com/embed/one",
          uploadDate: "2026-01-01T00:00:00+08:00",
        },
        {
          title: "Episode two",
          embedUrl: "https://www.youtube.com/embed/two",
          uploadDate: "2026-01-02T00:00:00+08:00",
        },
      ],
    },
    {
      slug: "single-video",
      type: "video",
      title: "Single Video Project",
      description: "A concise project description.",
      longDescription: "Only paragraph.",
      heading: "Videographer",
      ogImage: "https://jineechen.com/assets/videography/single-video/single-video-800.webp",
      videos: [
        {
          title: "Only video",
          embedUrl: "https://www.youtube.com/embed/only",
          uploadDate: "2026-01-00T00:00:00+08:00",
        },
      ],
    },
  ],
  getSlugsByType: () => ["multi-video", "single-video"],
}));

jest.mock("@/components/video/VideoPlayer", () => ({
  __esModule: true,
  default: ({ videos }: { videos: { title: string }[] }) => (
    <div data-testid="video-player">{videos.map((video) => video.title).join(", ")}</div>
  ),
}));

describe("VideoProjectPage", () => {
  it("renders intro copy with a compact facts block for multi-video projects", async () => {
    render(await VideoProjectPage({ params: Promise.resolve({ slug: "multi-video" }) }));

    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Producer | Director")).toBeInTheDocument();
    expect(screen.getByText("Singapore")).toBeInTheDocument();

    const paragraphs = document.querySelectorAll(".project-description p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("First paragraph.");
    expect(paragraphs[1]).toHaveTextContent("Second paragraph.");
    expect(screen.queryByRole("heading", { name: "Episodes" })).not.toBeInTheDocument();
  });

  it("renders a single video project without a format field", async () => {
    render(await VideoProjectPage({ params: Promise.resolve({ slug: "single-video" }) }));

    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Videographer")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Episodes" })).not.toBeInTheDocument();
    expect(screen.getByTestId("video-player")).toHaveTextContent("Only video");
  });
});
