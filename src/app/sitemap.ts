import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import {
  photographyProjects,
  videoProjects,
  socialMediaProjects,
} from "@/lib/portfolio-config";

// Required for Next.js static export (`output: 'export'`)
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-03-26");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0, lastModified },
    { url: `${SITE_URL}/portfolio/`, changeFrequency: "monthly", priority: 0.8, lastModified },
    { url: `${SITE_URL}/portfolio/photography/`, changeFrequency: "monthly", priority: 0.7, lastModified },
    { url: `${SITE_URL}/portfolio/video/`, changeFrequency: "monthly", priority: 0.7, lastModified },
    { url: `${SITE_URL}/portfolio/social-media/`, changeFrequency: "monthly", priority: 0.7, lastModified },
    { url: `${SITE_URL}/imprint/`, changeFrequency: "yearly", priority: 0.2, lastModified },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "yearly", priority: 0.2, lastModified },
  ];

  const photographyRoutes: MetadataRoute.Sitemap = photographyProjects.map(
    (p) => ({
      url: `${SITE_URL}/portfolio/photography/${p.slug}/`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified,
    })
  );

  const videoRoutes: MetadataRoute.Sitemap = videoProjects.map((p) => ({
    url: `${SITE_URL}/portfolio/video/${p.slug}/`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified,
  }));

  const socialMediaRoutes: MetadataRoute.Sitemap = socialMediaProjects.map(
    (p) => ({
      url: `${SITE_URL}/portfolio/social-media/${p.slug}/`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified,
    })
  );

  return [
    ...staticRoutes,
    ...photographyRoutes,
    ...videoRoutes,
    ...socialMediaRoutes,
  ];
}
