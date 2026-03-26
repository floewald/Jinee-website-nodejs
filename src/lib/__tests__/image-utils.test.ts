import {
  getThumbUrl,
  getMdUrl,
  getLgUrl,
  toYouTubeEmbedUrl,
  youTubeIdFromEmbedUrl,
} from "@/lib/image-utils";

describe("getThumbUrl", () => {
  it("appends -320.webp to the basename", () => {
    expect(getThumbUrl("/assets/photography/event", "IMG_001")).toBe(
      "/assets/photography/event/IMG_001-320.webp"
    );
  });
});

describe("getMdUrl", () => {
  it("appends -800.webp to the basename", () => {
    expect(getMdUrl("/assets/video/stuck-low-pay", "thumb")).toBe(
      "/assets/video/stuck-low-pay/thumb-800.webp"
    );
  });
});

describe("getLgUrl", () => {
  it("appends -1600.webp to the basename", () => {
    expect(getLgUrl("/assets/photography/travel", "DSC_0001")).toBe(
      "/assets/photography/travel/DSC_0001-1600.webp"
    );
  });
});

describe("toYouTubeEmbedUrl", () => {
  it("returns the URL unchanged when a full URL is provided", () => {
    const url = "https://www.youtube.com/embed/I2CK-j-pR7M";
    expect(toYouTubeEmbedUrl(url)).toBe(url);
  });

  it("builds an embed URL when a bare video ID is provided", () => {
    expect(toYouTubeEmbedUrl("I2CK-j-pR7M")).toBe(
      "https://www.youtube.com/embed/I2CK-j-pR7M"
    );
  });
});

describe("youTubeIdFromEmbedUrl", () => {
  it("extracts the video ID from an embed URL", () => {
    expect(
      youTubeIdFromEmbedUrl("https://www.youtube.com/embed/I2CK-j-pR7M")
    ).toBe("I2CK-j-pR7M");
  });

  it("returns empty string for an empty embed URL", () => {
    expect(youTubeIdFromEmbedUrl("")).toBe("");
  });
});
