/**
 * scaffold-project — unit tests
 *
 * Tests cover the pure business logic functions that the interactive
 * `scripts/create-project.mjs` CLI relies on.
 *
 *  - validateSlug() accepts/rejects various slug formats
 *  - buildSkeletonEntry() produces correct content for each type
 *  - getContentJsonPath() returns the correct path per type
 *  - getAssetsRawPath() returns the correct directory path
 */

import path from "path";
import {
  validateSlug,
  buildSkeletonEntry,
  getContentJsonPath,
  getAssetsRawPath,
} from "@/lib/scaffold-project";

const ROOT = path.resolve(__dirname, "../../../..");

// ── validateSlug ─────────────────────────────────────────────────────────────

describe("validateSlug()", () => {
  it("accepts lowercase alphanumeric with hyphens", () => {
    expect(validateSlug("my-new-project")).toBe(true);
    expect(validateSlug("event2026")).toBe(true);
    expect(validateSlug("a")).toBe(true);
  });

  it("rejects uppercase letters", () => {
    expect(validateSlug("MyProject")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(validateSlug("my project")).toBe(false);
  });

  it("rejects underscores", () => {
    expect(validateSlug("my_project")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateSlug("")).toBe(false);
  });
});

// ── buildSkeletonEntry ───────────────────────────────────────────────────────

describe("buildSkeletonEntry()", () => {
  it("builds a photography skeleton with correct type and fields", () => {
    const entry = buildSkeletonEntry("photography", "event-photography", "Event Photography");
    expect(entry.type).toBe("photography");
    expect(entry.slug).toBe("event-photography");
    expect(entry.title).toBe("Event Photography");
    expect((entry as { enableDownload: boolean }).enableDownload).toBe(false);
    expect(entry.portfolioCard).toBeDefined();
  });

  it("builds a video skeleton with correct type and videos array", () => {
    const entry = buildSkeletonEntry("video", "my-doc", "My Documentary");
    expect(entry.type).toBe("video");
    expect(entry.slug).toBe("my-doc");
    expect((entry as { videos: unknown[] }).videos).toBeInstanceOf(Array);
    expect((entry as { videos: unknown[] }).videos).toHaveLength(1);
  });

  it("builds a social-media skeleton with correct type and hasGallery", () => {
    const entry = buildSkeletonEntry("social-media", "ig-reel", "IG Reel");
    expect(entry.type).toBe("social-media");
    expect(entry.slug).toBe("ig-reel");
    expect((entry as { hasGallery: boolean }).hasGallery).toBe(true);
  });

  it("embeds the slug in the ogImage URL", () => {
    const entry = buildSkeletonEntry("photography", "my-project", "My Project");
    expect(entry.ogImage).toContain("my-project");
  });

  it("embeds the slug in the thumbnail path", () => {
    const entry = buildSkeletonEntry("video", "my-video", "My Video");
    expect(entry.portfolioCard!.thumbnail).toContain("my-video");
  });
});

// ── getContentJsonPath ────────────────────────────────────────────────────────

describe("getContentJsonPath()", () => {
  it("returns the photography.json path", () => {
    expect(getContentJsonPath("photography")).toBe(
      path.join(ROOT, "src", "content", "portfolio", "photography.json")
    );
  });

  it("returns the video.json path", () => {
    expect(getContentJsonPath("video")).toBe(
      path.join(ROOT, "src", "content", "portfolio", "video.json")
    );
  });

  it("returns the social-media.json path", () => {
    expect(getContentJsonPath("social-media")).toBe(
      path.join(ROOT, "src", "content", "portfolio", "social-media.json")
    );
  });
});

// ── getAssetsRawPath ──────────────────────────────────────────────────────────

describe("getAssetsRawPath()", () => {
  it("returns the correct assets-raw directory path", () => {
    expect(getAssetsRawPath("photography", "my-project")).toBe(
      path.join(ROOT, "Jinee_website", "assets-raw", "photography", "my-project")
    );
  });
});
