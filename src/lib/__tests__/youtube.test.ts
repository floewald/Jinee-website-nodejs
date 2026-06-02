import { getYouTubeVideoId, getYouTubeThumbnailUrl } from "../youtube";

describe("getYouTubeVideoId", () => {
  it("returns the ID for a standard youtube.com/embed URL", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/embed/abc123")).toBe(
      "abc123"
    );
  });

  it("returns the ID for a youtube-nocookie.com/embed URL", () => {
    expect(
      getYouTubeVideoId("https://www.youtube-nocookie.com/embed/abc123")
    ).toBe("abc123");
  });

  it("returns the ID when query params are present", () => {
    expect(
      getYouTubeVideoId(
        "https://www.youtube.com/embed/abc123?start=10&rel=0"
      )
    ).toBe("abc123");
  });

  it("returns null for undefined input", () => {
    expect(getYouTubeVideoId(undefined)).toBeNull();
  });

  it("returns null for empty string input", () => {
    expect(getYouTubeVideoId("")).toBeNull();
  });

  it("returns null for a Vimeo URL", () => {
    expect(getYouTubeVideoId("https://player.vimeo.com/video/123456")).toBeNull();
  });
});

describe("getYouTubeThumbnailUrl", () => {
  it("builds the i.ytimg.com sddefault URL for a given ID", () => {
    expect(getYouTubeThumbnailUrl("abc123")).toBe(
      "https://i.ytimg.com/vi/abc123/sddefault.jpg"
    );
  });
});
