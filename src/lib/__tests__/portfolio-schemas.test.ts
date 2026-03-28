/**
 * portfolio-schemas — unit tests
 *
 * Tests cover:
 *  - PhotographyProjectSchema accepts valid data
 *  - PhotographyProjectSchema rejects missing required fields
 *  - VideoProjectSchema accepts valid data
 *  - VideoProjectSchema rejects projects with no videos array
 *  - SocialMediaProjectSchema accepts valid data
 *  - PortfolioCardSchema accepts valid data with and without optional fields
 *  - validatePortfolioData() throws with a Zod error message for invalid data
 *  - validatePortfolioData() returns parsed data on success
 *  - Real photography.json data passes validation
 *  - Real video.json data passes validation
 *  - Real social-media.json data passes validation
 */

import {
  PhotographyProjectSchema,
  VideoProjectSchema,
  SocialMediaProjectSchema,
  validatePortfolioData,
} from "@/lib/portfolio-schemas";
import photographyData from "@/content/portfolio/photography.json";
import videoData from "@/content/portfolio/video.json";
import socialMediaData from "@/content/portfolio/social-media.json";

const VALID_PHOTO = {
  type: "photography" as const,
  slug: "event-photography",
  title: "Event Photography",
  description: "Events",
  heading: "Photographer | 📍 Singapore",
  ogImage: "https://jineechen.com/assets/photography/event-photography/img-800.webp",
  enableDownload: false,
  imageCount: 12,
};

const VALID_VIDEO = {
  type: "video" as const,
  slug: "stuck-low-pay",
  title: "Stuck with Low Pay",
  description: "Documentary",
  heading: "Producer | Director | 📍 Taiwan",
  ogImage: "https://jineechen.com/assets/video/stuck-low-pay/img-800.webp",
  videos: [
    {
      title: "Stuck With Low Pay",
      embedUrl: "https://www.youtube.com/embed/xxxxxxxxx",
      uploadDate: "2023-01-01T00:00:00+08:00",
    },
  ],
};

const VALID_SOCIAL = {
  type: "social-media" as const,
  slug: "ig-motivational",
  title: "Motivational Posts",
  description: "Motivational Instagram content",
  heading: "Content Creator | 📍 Singapore",
  ogImage: "https://jineechen.com/assets/social-media/ig-motivational/img-800.webp",
  hasGallery: true,
};

// ── PhotographyProjectSchema ─────────────────────────────────────────────────

describe("PhotographyProjectSchema", () => {
  it("accepts a valid photography project", () => {
    expect(() => PhotographyProjectSchema.parse(VALID_PHOTO)).not.toThrow();
  });

  it("rejects when type is wrong", () => {
    expect(() =>
      PhotographyProjectSchema.parse({ ...VALID_PHOTO, type: "video" })
    ).toThrow();
  });

  it("rejects when required fields are missing", () => {
    const { enableDownload: _e, ...without } = VALID_PHOTO;
    expect(() => PhotographyProjectSchema.parse(without)).toThrow();
  });

  it("accepts optional fields: portfolioCard, showSlideshow, visible", () => {
    expect(() =>
      PhotographyProjectSchema.parse({
        ...VALID_PHOTO,
        visible: false,
        showSlideshow: false,
        portfolioCard: {
          cardTitle: "Event Photography",
          thumbnail: "/assets/photography/event-photography/img-800.webp",
        },
      })
    ).not.toThrow();
  });
});

// ── VideoProjectSchema ───────────────────────────────────────────────────────

describe("VideoProjectSchema", () => {
  it("accepts a valid video project", () => {
    expect(() => VideoProjectSchema.parse(VALID_VIDEO)).not.toThrow();
  });

  it("rejects when videos array is missing", () => {
    const { videos: _v, ...without } = VALID_VIDEO;
    expect(() => VideoProjectSchema.parse(without)).toThrow();
  });

  it("accepts longDescription as optional", () => {
    expect(() =>
      VideoProjectSchema.parse({ ...VALID_VIDEO, longDescription: "Long text" })
    ).not.toThrow();
  });
});

// ── SocialMediaProjectSchema ─────────────────────────────────────────────────

describe("SocialMediaProjectSchema", () => {
  it("accepts a valid social-media project", () => {
    expect(() => SocialMediaProjectSchema.parse(VALID_SOCIAL)).not.toThrow();
  });

  it("rejects when hasGallery is missing", () => {
    const { hasGallery: _h, ...without } = VALID_SOCIAL;
    expect(() => SocialMediaProjectSchema.parse(without)).toThrow();
  });
});

// ── validatePortfolioData() ──────────────────────────────────────────────────

describe("validatePortfolioData()", () => {
  it("returns parsed data when input is valid", () => {
    const result = validatePortfolioData("photography", [VALID_PHOTO]);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("event-photography");
  });

  it("throws a descriptive ZodError when data is invalid", () => {
    expect(() =>
      validatePortfolioData("photography", [{ ...VALID_PHOTO, slug: 123 }])
    ).toThrow(/slug/);
  });
});

// ── Real JSON files pass validation ─────────────────────────────────────────

describe("Real JSON content files", () => {
  it("photography.json passes PhotographyProjectSchema", () => {
    expect(() =>
      validatePortfolioData("photography", photographyData)
    ).not.toThrow();
  });

  it("video.json passes VideoProjectSchema", () => {
    expect(() => validatePortfolioData("video", videoData)).not.toThrow();
  });

  it("social-media.json passes SocialMediaProjectSchema", () => {
    expect(() =>
      validatePortfolioData("social-media", socialMediaData)
    ).not.toThrow();
  });
});
