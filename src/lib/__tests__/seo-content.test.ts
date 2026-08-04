/**
 * Phase 5 – SEO: portfolio content integrity tests
 *
 * Verifies:
 *  - new social-media-addiction project is correctly added
 *  - video portfolio cards follow the expected lineup order
 *  - card ordering in videography.json matches legacy site order
 *  - JSON-LD required fields are present on all video projects
 */

import { videoProjects, getProjectBySlug, getVideoCards } from "@/lib/portfolio-config";
import { getProjectSlideshowImages } from "@/lib/gallery-images";

describe("social-media-addiction project", () => {
  const project = videoProjects.find((p) => p.slug === "social-media-addiction");

  it("exists in video projects", () => {
    expect(project).toBeDefined();
  });

  it("has the correct type", () => {
    expect(project?.type).toBe("video");
  });

  it("has a non-empty title", () => {
    expect(project?.title).toBeTruthy();
  });

  it("has at least one video with an embedUrl", () => {
    expect(project?.videos.length).toBeGreaterThan(0);
    project?.videos.forEach((v) => {
      expect(v.embedUrl).toMatch(/youtube\.com\/embed\//);
    });
  });

  it("has an ogImage URL", () => {
    expect(project?.ogImage).toMatch(/^https:\/\//);
  });

  it("has a portfolioCard with a thumbnail", () => {
    expect(project?.portfolioCard?.thumbnail).toMatch(/\/assets\/videography\//);
  });

  it("can be found by slug via getProjectBySlug", () => {
    const found = getProjectBySlug("social-media-addiction");
    expect(found).toBeDefined();
    expect(found?.slug).toBe("social-media-addiction");
  });
});

describe("video portfolio card ordering", () => {
  const cardProjects = getVideoCards();

  it("has 23 projects with portfolio cards", () => {
    expect(cardProjects.length).toBe(23);
  });

  it("order matches lineup defined in videography.json", () => {
    const expectedOrder = [
      "stuck-low-pay",
      "father-son-suhaimi",
      "7-days-archery",
      "singer-jasmin-sokko",
      "food-wasted",
      "health-wang-zhen",
      "re-old-times",
      "scdf-project",
      "blind-kitchen-chefs",
      "lunch-with-us",
      "fertility-rate-sgp",
      "social-media-addiction",
      "into-the-gym",
      "uniqlo",
      "living-with-chronic-pain",
      "work-in-sgp",
      "stay-at-home-dad",
      "lion-dancers",
      "i-fell",
      "mark-your-calendar",
      "red-dot-detectives",
      "i-eat-therefore",
      "guardians-vietnam",
    ];
    const actualOrder = cardProjects.map((p) => p.slug);
    expect(actualOrder).toEqual(expectedOrder);
  });
});

describe("video projects JSON-LD data completeness", () => {
  const hasEpisodeCopy = (value?: string | string[]) =>
    Array.isArray(value)
      ? value.some((line) => line.trim().length > 0)
      : Boolean(value?.trim());

  it("every video project has at least one video with embedUrl or linkUrl", () => {
    videoProjects.forEach((p) => {
      expect(p.videos.length).toBeGreaterThan(0);
      p.videos.forEach((v) => {
        expect(v.embedUrl || v.linkUrl).toBeTruthy();
      });
    });
  });

  it("every video project has an uploadDate on its first video", () => {
    videoProjects.forEach((p) => {
      expect(p.videos[0].uploadDate).toBeTruthy();
    });
  });

  it("every video project has a description for VideoObject schema", () => {
    videoProjects.forEach((p) => {
      expect(p.description).toBeTruthy();
    });
  });

  it("every video has episode copy", () => {
    videoProjects.forEach((p) => {
      p.videos.forEach((v) => {
        expect(hasEpisodeCopy(v.description)).toBe(true);
      });
    });
  });
});

describe("fertility-rate-sgp Frontline series", () => {
  const project = videoProjects.find((p) => p.slug === "fertility-rate-sgp");

  it("includes all Frontline episodes in the series", () => {
    expect(project?.videos.map((v) => v.embedUrl)).toEqual([
      "https://www.youtube.com/embed/p5xyxnfQVlk",
      "https://www.youtube.com/embed/Up8c6SZ5s-w",
      "https://www.youtube.com/embed/nBP1A1oEq9k",
    ]);
  });

  it("uses a concise series description and three generated card preview images", () => {
    expect(project?.description.length).toBeLessThanOrEqual(160);
    expect(project?.description).toContain("Frontline");
    expect(project?.portfolioCard?.thumbnail).toBe(
      "/assets/videography/fertility-rate-sgp/fertility-rate-sgp-1-800.webp"
    );
    expect(getProjectSlideshowImages("fertility-rate-sgp", "video").map((image) => image.src)).toEqual([
      "/assets/videography/fertility-rate-sgp/fertility-rate-sgp-1-800.webp",
      "/assets/videography/fertility-rate-sgp/fertility-rate-sgp-2-800.webp",
      "/assets/videography/fertility-rate-sgp/fertility-rate-sgp-3-800.webp",
    ]);
  });
});
