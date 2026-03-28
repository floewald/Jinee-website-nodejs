/**
 * Phase 5 – SEO: sitemap generation tests
 *
 * Tests verify:
 *  - All static routes are present
 *  - All portfolio project routes are included
 *  - The new social-media-addiction project is represented
 *  - Priorities and frequencies are correct
 *  - All URLs start with the site URL and end with a trailing slash
 */

import { SITE_URL } from "@/lib/constants";
import {
  photographyProjects,
  videoProjects,
  socialMediaProjects,
} from "@/lib/portfolio-config";
import sitemap from "@/app/sitemap";

describe("sitemap()", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("returns an array of entries", () => {
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });

  it("every URL starts with the site URL", () => {
    urls.forEach((url) => {
      expect(url).toMatch(new RegExp(`^${SITE_URL}`));
    });
  });

  it("every URL ends with a trailing slash", () => {
    urls.forEach((url) => {
      expect(url).toMatch(/\/$/);
    });
  });

  describe("static routes", () => {
    const staticPaths = ["/", "/about/", "/contact/", "/portfolio/", "/portfolio/photography/", "/portfolio/video/", "/portfolio/social-media/", "/imprint/", "/privacy/"];

    it.each(staticPaths)("includes %s", (path) => {
      expect(urls).toContain(`${SITE_URL}${path}`);
    });

    it("homepage has priority 1.0", () => {
      const home = entries.find((e) => e.url === `${SITE_URL}/`);
      expect(home?.priority).toBe(1.0);
    });

    it("portfolio index has priority 0.8", () => {
      const portfolio = entries.find((e) => e.url === `${SITE_URL}/portfolio/`);
      expect(portfolio?.priority).toBe(0.8);
    });

    it("category pages have priority 0.7", () => {
      ["/portfolio/photography/", "/portfolio/video/", "/portfolio/social-media/"].forEach((path) => {
        const entry = entries.find((e) => e.url === `${SITE_URL}${path}`);
        expect(entry?.priority).toBe(0.7);
      });
    });

    it("legal pages have priority 0.2", () => {
      ["/imprint/", "/privacy/"].forEach((path) => {
        const entry = entries.find((e) => e.url === `${SITE_URL}${path}`);
        expect(entry?.priority).toBe(0.2);
      });
    });
  });

  describe("photography project routes", () => {
    it("includes all photography projects", () => {
      photographyProjects.forEach((p) => {
        expect(urls).toContain(`${SITE_URL}/portfolio/photography/${p.slug}/`);
      });
    });

    it("photography projects have priority 0.6", () => {
      photographyProjects.forEach((p) => {
        const entry = entries.find(
          (e) => e.url === `${SITE_URL}/portfolio/photography/${p.slug}/`
        );
        expect(entry?.priority).toBe(0.6);
      });
    });
  });

  describe("video project routes", () => {
    it("includes all video projects", () => {
      videoProjects.forEach((p) => {
        expect(urls).toContain(`${SITE_URL}/portfolio/video/${p.slug}/`);
      });
    });

    it("includes the new social-media-addiction project", () => {
      expect(urls).toContain(`${SITE_URL}/portfolio/video/social-media-addiction/`);
    });

    it("video projects have priority 0.6", () => {
      videoProjects.forEach((p) => {
        const entry = entries.find(
          (e) => e.url === `${SITE_URL}/portfolio/video/${p.slug}/`
        );
        expect(entry?.priority).toBe(0.6);
      });
    });
  });

  describe("social-media project routes", () => {
    it("includes all social-media projects", () => {
      socialMediaProjects.forEach((p) => {
        expect(urls).toContain(
          `${SITE_URL}/portfolio/social-media/${p.slug}/`
        );
      });
    });
  });

  it("total count matches static + all projects", () => {
    const staticCount = 9; // home, about, contact, portfolio, 3 categories, imprint, privacy
    const expected =
      staticCount +
      photographyProjects.length +
      videoProjects.length +
      socialMediaProjects.length;
    expect(entries.length).toBe(expected);
  });
});
