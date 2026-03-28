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
