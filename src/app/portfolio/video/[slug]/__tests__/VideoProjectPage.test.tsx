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
          embedUrl: "https://www.youtube.com/embed/x7U6OarM2vk",
          description: ["First episode story.", "A second paragraph."],
          uploadDate: "2026-01-01T00:00:00+08:00",
        },
        {
          title: "Episode two",
          embedUrl: "https://www.youtube.com/embed/euvDjOD29Ng",
          description: "Second episode story. </script><script>alert(1)</script>",
          previewImage: "/assets/videography/multi-video/second-800.webp",
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
          // No verified publication date: do not fabricate structured data.
        },
      ],
    },
    {
      slug: "external-video",
      type: "video",
      title: "External Video",
      description: "Watch elsewhere.",
      heading: "Producer",
      ogImage: "https://jineechen.com/external.webp",
      videos: [{ title: "External episode", linkUrl: "https://www.mewatch.sg/watch/episode", uploadDate: "2026-01-01T00:00:00+08:00" }],
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
  it("describes every embedded episode with its own story, date, and thumbnail", async () => {
    const { container } = render(await VideoProjectPage({ params: Promise.resolve({ slug: "multi-video" }) }));
    const data = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(data["@graph"]).toHaveLength(2);
    expect(data["@graph"][0]).toMatchObject({
      "@type": "VideoObject", name: "Episode one",
      description: "First episode story. A second paragraph.",
      uploadDate: "2026-01-01T00:00:00+08:00",
      thumbnailUrl: ["https://i.ytimg.com/vi/x7U6OarM2vk/sddefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/x7U6OarM2vk",
    });
    expect(data["@graph"][1]).toMatchObject({
      name: "Episode two", description: "Second episode story. </script><script>alert(1)</script>",
      uploadDate: "2026-01-02T00:00:00+08:00",
      thumbnailUrl: ["https://jineechen.com/assets/videography/multi-video/second-800.webp"],
    });
  });

  it("escapes script delimiters in editorial copy while preserving valid JSON", async () => {
    const { container } = render(await VideoProjectPage({ params: Promise.resolve({ slug: "multi-video" }) }));
    const raw = container.querySelector('script[type="application/ld+json"]')!.textContent!;
    expect(raw).not.toContain("</script>");
    expect(JSON.parse(raw)["@graph"][1].description).toContain("</script>");
  });

  it.each(["single-video", "external-video"])("omits VideoObject for %s without an on-page video or verified date", async (slug) => {
    const { container } = render(await VideoProjectPage({ params: Promise.resolve({ slug }) }));
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it("renders intro copy with a compact facts block for multi-video projects", async () => {
    render(await VideoProjectPage({ params: Promise.resolve({ slug: "multi-video" }) }));

    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Producer | Director")).toBeInTheDocument();
    expect(screen.getByText("Singapore")).toBeInTheDocument();
    expect(screen.queryByText("Format")).not.toBeInTheDocument();

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
    expect(screen.queryByText("Format")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Episodes" })).not.toBeInTheDocument();
    expect(screen.getByTestId("video-player")).toHaveTextContent("Only video");
  });
});
