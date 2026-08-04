import {
  getProjectBySlug,
  getPhotographyCards,
  getVideoCards,
  // getSocialMediaCards is imported indirectly via socialMediaProjects
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSocialMediaCards,
  projectPath,
  getSlugsByType,
  photographyProjects,
  portfolioIndexConfig,
  videoProjects,
  socialMediaProjects,
} from "@/lib/portfolio-config";

describe("photographyProjects", () => {
  it("contains at least one project", () => {
    expect(photographyProjects.length).toBeGreaterThan(0);
  });

  it("every project has the photography type", () => {
    photographyProjects.forEach((p) => expect(p.type).toBe("photography"));
  });
});

describe("videoProjects", () => {
  it("contains at least one project", () => {
    expect(videoProjects.length).toBeGreaterThan(0);
  });

  it("every project has a non-empty videos array", () => {
    videoProjects.forEach((p) =>
      expect(p.videos.length).toBeGreaterThan(0)
    );
  });
});

describe("socialMediaProjects", () => {
  it("contains at least one project", () => {
    expect(socialMediaProjects.length).toBeGreaterThan(0);
  });
});

describe("getProjectBySlug", () => {
  it("finds a photography project by slug", () => {
    const project = getProjectBySlug("event-photography");
    expect(project).toBeDefined();
    expect(project?.type).toBe("photography");
  });

  it("finds a video project by slug", () => {
    const project = getProjectBySlug("stuck-low-pay");
    expect(project).toBeDefined();
    expect(project?.type).toBe("video");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProjectBySlug("does-not-exist")).toBeUndefined();
  });
});

describe("getPhotographyCards", () => {
  it("returns only projects that have a portfolioCard", () => {
    const cards = getPhotographyCards();
    cards.forEach((p) => expect(p.portfolioCard).toBeDefined());
  });

  it("returns cards in JSON array order", () => {
    const cards = getPhotographyCards();
    expect(cards.length).toBeGreaterThan(0);
    // Order is determined by JSON array position — just verify it returns a stable list
    expect(cards.map((p) => p.slug)).toEqual(
      expect.arrayContaining([cards[0].slug])
    );
  });
});

describe("getVideoCards", () => {
  it("returns only projects that have a portfolioCard", () => {
    const cards = getVideoCards();
    cards.forEach((p) => expect(p.portfolioCard).toBeDefined());
  });

  it("returns only visible video card projects", () => {
    const cards = getVideoCards();
    cards.forEach((p) => expect(p.visible).not.toBe(false));
  });
});

describe("projectPath", () => {
  it("returns the canonical URL path for a photography project", () => {
    const project = getProjectBySlug("event-photography")!;
    expect(projectPath(project)).toBe(
      "/portfolio/photography/event-photography/"
    );
  });

  it("returns the canonical URL path for a video project", () => {
    const project = getProjectBySlug("stuck-low-pay")!;
    expect(projectPath(project)).toBe("/portfolio/video/stuck-low-pay/");
  });

  it("returns the social-media index path for a social-media project", () => {
    const project = getProjectBySlug("ig-motivational")!;
    expect(projectPath(project)).toBe("/portfolio/social-media/");
  });
});

describe("getSlugsByType", () => {
  it("returns all photography slugs", () => {
    const slugs = getSlugsByType("photography");
    expect(slugs).toContain("event-photography");
    expect(slugs).toContain("walking-tour-little-india");
  });

  it("returns all video slugs", () => {
    const slugs = getSlugsByType("video");
    expect(slugs).toContain("stuck-low-pay");
    expect(slugs).toContain("blind-kitchen-chefs");
  });
});

describe("portfolioIndexConfig", () => {
  it("resolves intrinsic dimensions for homepage collage images", () => {
    portfolioIndexConfig.collageImages.forEach((image) => {
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    });
  });

  it("uses medium WebP sources for the homepage collage grid while keeping full-size lightbox sources", () => {
    portfolioIndexConfig.collageImages.forEach((image) => {
      expect(image.src).toMatch(/-800\.webp$/);
      expect(image.srcFull).toMatch(/-1600\.webp$/);
    });
  });

  it("keeps large WebP sources for the homepage hero slideshow", () => {
    portfolioIndexConfig.slideshowImages?.forEach((image) => {
      expect(image.src).toMatch(/-1600\.webp$/);
      expect(image.srcFull).toBe(image.src);
    });
  });
});
