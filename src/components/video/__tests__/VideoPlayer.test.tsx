import { render, screen } from "@testing-library/react";
import VideoPlayer from "../VideoPlayer";
import type { VideoItem } from "@/types/portfolio";

// Mock useIntersection to control visibility
let mockIsVisible = false;
jest.mock("@/hooks/useIntersection", () => ({
  useIntersection: () => mockIsVisible,
}));

const videos: VideoItem[] = [
  {
    title: "Episode 1: Test Video",
    embedUrl: "https://www.youtube.com/embed/abc123",
    uploadDate: "2026-01-01T00:00:00+08:00",
  },
  {
    title: "Episode 2: Another",
    embedUrl: "https://www.youtube.com/embed/def456",
    uploadDate: "2026-02-01T00:00:00+08:00",
  },
];

describe("VideoPlayer", () => {
  it("renders one item per video", () => {
    render(<VideoPlayer videos={videos} />);
    const items = document.querySelectorAll(".video-player__item");
    expect(items).toHaveLength(2);
  });

  it("shows title for each video when multiple videos", () => {
    render(<VideoPlayer videos={videos} />);
    expect(screen.getByText("Episode 1: Test Video")).toBeInTheDocument();
    expect(screen.getByText("Episode 2: Another")).toBeInTheDocument();
  });

  it("shows title even when only one video", () => {
    render(<VideoPlayer videos={[videos[0]]} />);
    expect(
      screen.queryByText("Episode 1: Test Video")
    ).toBeInTheDocument();
  });

  it("shows placeholder when not visible", () => {
    mockIsVisible = false;
    render(<VideoPlayer videos={[videos[0]]} />);
    const placeholder = document.querySelector(
      ".video-embed--placeholder"
    );
    expect(placeholder).toBeInTheDocument();
    expect(screen.queryByTitle("Episode 1: Test Video")).toBeNull();
  });

  it("renders iframe when visible", () => {
    mockIsVisible = true;
    render(<VideoPlayer videos={[videos[0]]} />);
    const iframe = screen.getByTitle("Episode 1: Test Video");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123"
    );
  });
});
