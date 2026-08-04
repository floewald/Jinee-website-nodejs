import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getSlugsByType } from "@/lib/portfolio-config";

// Required for Next.js static export (`output: 'export'`)
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0, lastModified },
    { url: `${SITE_URL}/about/`, changeFrequency: "yearly", priority: 0.6, lastModified },
    { url: `${SITE_URL}/contact/`, changeFrequency: "yearly", priority: 0.5, lastModified },
    { url: `${SITE_URL}/portfolio/`, changeFrequency: "monthly", priority: 0.8, lastModified },
    { url: `${SITE_URL}/portfolio/photography/`, changeFrequency: "monthly", priority: 0.7, lastModified },
    { url: `${SITE_URL}/portfolio/video/`, changeFrequency: "monthly", priority: 0.7, lastModified },
    { url: `${SITE_URL}/portfolio/social-media/`, changeFrequency: "monthly", priority: 0.7, lastModified },
    { url: `${SITE_URL}/imprint/`, changeFrequency: "yearly", priority: 0.2, lastModified },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "yearly", priority: 0.2, lastModified },
  ];

  const photographyRoutes: MetadataRoute.Sitemap = getSlugsByType("photography").map(
    (slug) => ({
      url: `${SITE_URL}/portfolio/photography/${slug}/`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified,
    })
  );

  const videoRoutes: MetadataRoute.Sitemap = getSlugsByType("video").map((slug) => ({
    url: `${SITE_URL}/portfolio/video/${slug}/`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified,
  }));

  return [
    ...staticRoutes,
    ...photographyRoutes,
    ...videoRoutes,
  ];
}
