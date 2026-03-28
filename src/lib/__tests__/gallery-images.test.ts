/**
 * gallery-images — unit tests
 *
 * Verifies that both getGalleryImages() and getProjectSlideshowImages()
 * emit a console.warn (instead of silently returning []) when the expected
 * images.json manifest is not present on disk.
 */

import fs from "fs";
import { getGalleryImages, getProjectSlideshowImages } from "@/lib/gallery-images";

jest.mock("fs");

const MISSING_SLUG = "no-such-project";

beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  (fs.existsSync as jest.Mock).mockReturnValue(false);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// getGalleryImages
// ---------------------------------------------------------------------------
describe("getGalleryImages()", () => {
  it("returns an empty array when the manifest is missing", () => {
    const result = getGalleryImages(MISSING_SLUG, "photography");
    expect(result).toEqual([]);
  });

  it("logs console.warn mentioning [gallery-images] when manifest is missing", () => {
    getGalleryImages(MISSING_SLUG, "photography");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[gallery-images]")
    );
  });

  it("includes the slug in the warning message", () => {
    getGalleryImages(MISSING_SLUG, "photography");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(MISSING_SLUG)
    );
  });

  it("includes the type in the warning message", () => {
    getGalleryImages(MISSING_SLUG, "video");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("video")
    );
  });
});

// ---------------------------------------------------------------------------
// getProjectSlideshowImages
// ---------------------------------------------------------------------------
describe("getProjectSlideshowImages()", () => {
  it("returns an empty array when the manifest is missing", () => {
    const result = getProjectSlideshowImages(MISSING_SLUG, "photography");
    expect(result).toEqual([]);
  });

  it("logs console.warn mentioning [gallery-images] when manifest is missing", () => {
    getProjectSlideshowImages(MISSING_SLUG, "photography");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[gallery-images]")
    );
  });

  it("includes the slug in the warning message", () => {
    getProjectSlideshowImages(MISSING_SLUG, "photography");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(MISSING_SLUG)
    );
  });

  it("includes the type in the warning message", () => {
    getProjectSlideshowImages(MISSING_SLUG, "social-media");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("social-media")
    );
  });
});

// ---------------------------------------------------------------------------
// LQIP blur passthrough — getGalleryImages
// ---------------------------------------------------------------------------
describe("getGalleryImages() blur passthrough", () => {
  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  it("includes blur field from manifest when present", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify([{
        basename: "photo-1",
        thumb: "photo-1-400.webp",
        md: "photo-1-800.webp",
        lg: "photo-1-1600.webp",
        original: "photo-1.jpg",
        blur: "data:image/webp;base64,ABC123",
      }])
    );
    const result = getGalleryImages("test-project", "photography");
    expect(result[0].blur).toBe("data:image/webp;base64,ABC123");
  });

  it("has undefined blur when manifest item has no blur field", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify([{
        basename: "photo-1",
        thumb: "photo-1-400.webp",
        md: "photo-1-800.webp",
        lg: "photo-1-1600.webp",
        original: "photo-1.jpg",
      }])
    );
    const result = getGalleryImages("test-project", "photography");
    expect(result[0].blur).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// LQIP blur passthrough — getProjectSlideshowImages
// ---------------------------------------------------------------------------
describe("getProjectSlideshowImages() returns SlideshowImage objects", () => {
  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  it("returns objects with src and blur when manifest has blur field", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify([{
        basename: "photo-1",
        thumb: null,
        md: "photo-1-800.webp",
        lg: null,
        original: null,
        blur: "data:image/webp;base64,XYZ",
      }])
    );
    const result = getProjectSlideshowImages("test-project", "photography");
    expect(result[0]).toEqual({
      src: "/assets/photography/test-project/photo-1-800.webp",
      blur: "data:image/webp;base64,XYZ",
    });
  });

  it("returns objects with only src when manifest item has no blur field", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify([{
        basename: "photo-1",
        thumb: null,
        md: "photo-1-800.webp",
        lg: null,
        original: null,
      }])
    );
    const result = getProjectSlideshowImages("test-project", "photography");
    expect(result[0]).toMatchObject({ src: "/assets/photography/test-project/photo-1-800.webp" });
    expect(result[0].blur).toBeUndefined();
  });
});
