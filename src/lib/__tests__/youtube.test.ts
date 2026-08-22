import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
  parseYouTubeVideoId,
} from "../youtube";

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

describe("parseYouTubeVideoId", () => {
  it("returns the ID for a watch URL", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("returns the ID for a shortlink URL", () => {
    expect(parseYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=30")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("returns the ID for a shorts URL", () => {
    expect(parseYouTubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("returns the ID for a bare video ID", () => {
    expect(parseYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for a non-YouTube host", () => {
    expect(parseYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });
});

describe("getYouTubeEmbedUrl", () => {
  it("builds the embed URL for a given ID", () => {
    expect(getYouTubeEmbedUrl("abc123")).toBe("https://www.youtube.com/embed/abc123");
  });
});

describe("getYouTubeThumbnailUrl", () => {
  it("builds the i.ytimg.com sddefault URL for a given ID", () => {
    expect(getYouTubeThumbnailUrl("abc123")).toBe(
      "https://i.ytimg.com/vi/abc123/sddefault.jpg"
    );
  });
});
