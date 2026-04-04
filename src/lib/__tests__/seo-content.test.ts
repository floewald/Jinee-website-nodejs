/**
 * Phase 5 – SEO: portfolio content integrity tests
 *
 * Verifies:
 *  - new social-media-addiction project is correctly added
 *  - all video portfolio cards have consecutive orders (no gaps)
 *  - card ordering in video.json matches legacy site order
 *  - JSON-LD required fields are present on all video projects
 */

import { videoProjects, getProjectBySlug } from "@/lib/portfolio-config";

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
    expect(project?.portfolioCard?.thumbnail).toMatch(/\/assets\/video\//);
  });

  it("can be found by slug via getProjectBySlug", () => {
    const found = getProjectBySlug("social-media-addiction");
    expect(found).toBeDefined();
    expect(found?.slug).toBe("social-media-addiction");
  });
});

describe("video portfolio card ordering", () => {
  const cardProjects = videoProjects.filter((p) => p.portfolioCard);

  it("has 13 projects with portfolio cards", () => {
    expect(cardProjects.length).toBe(13);
  });

  it("order matches lineup defined in video.json", () => {
    const expectedOrder = [
      "stuck-low-pay",
      "singer-jasmin-sokko",
      "re-old-times",
      "healthy-dining",
      "social-media-addiction",
      "blind-kitchen-chefs",
      "lion-dancers",
      "into-the-gym",
      "lunch-with-us",
      "scdf-project",
      "i-fell",
      "work-in-sgp",
      "stay-at-home-dad",
    ];
    const actualOrder = cardProjects.map((p) => p.slug);
    expect(actualOrder).toEqual(expectedOrder);
  });
});

describe("video projects JSON-LD data completeness", () => {
  it("every video project has at least one video with embedUrl", () => {
    videoProjects.forEach((p) => {
      expect(p.videos.length).toBeGreaterThan(0);
      p.videos.forEach((v) => {
        expect(v.embedUrl).toBeTruthy();
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
});
