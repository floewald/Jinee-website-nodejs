import type {
  PhotographyProject,
  VideoProject,
  SocialMediaProject,
  PortfolioProject,
  PortfolioIndexConfig,
} from "@/types/portfolio";

import { validatePortfolioData } from "@/lib/portfolio-schemas";

import photographyData from "@/content/portfolio/photography.json";
import videoData from "@/content/portfolio/video.json";
import socialMediaData from "@/content/portfolio/social-media.json";
import indexConfigData from "@/content/portfolio/index-config.json";

// Cast the raw JSON to typed arrays
export const photographyProjects = validatePortfolioData(
  "photography",
  photographyData
) as PhotographyProject[];

export const videoProjects = validatePortfolioData(
  "video",
  videoData
) as VideoProject[];

export const socialMediaProjects = validatePortfolioData(
  "social-media",
  socialMediaData
) as SocialMediaProject[];

export const portfolioIndexConfig =
  indexConfigData as PortfolioIndexConfig;

/** All projects across every category, in original order */
export const allProjects: PortfolioProject[] = [
  ...photographyProjects,
  ...videoProjects,
  ...socialMediaProjects,
];

/** Look up a project by its URL slug, regardless of type */
export function getProjectBySlug(
  slug: string
): PortfolioProject | undefined {
  return allProjects.find((p) => p.slug === slug);
}

/** All photography projects that have a portfolioCard and are visible, in JSON array order */
export function getPhotographyCards(): PhotographyProject[] {
  return photographyProjects.filter((p) => p.portfolioCard && p.visible !== false);
}

/** All video projects that have a portfolioCard, in JSON array order */
export function getVideoCards(): VideoProject[] {
  return videoProjects.filter((p) => p.portfolioCard);
}

/** All social-media projects that have a portfolioCard, in JSON array order */
export function getSocialMediaCards(): SocialMediaProject[] {
  return socialMediaProjects.filter((p) => p.portfolioCard);
}

/** Canonical URL path for a project */
export function projectPath(project: PortfolioProject): string {
  return `/portfolio/${project.type}/${project.slug}/`;
}

/** All slugs that should be statically generated for a given type */
export function getSlugsByType(
  type: PortfolioProject["type"]
): string[] {
  return allProjects
    .filter((p) => p.type === type && p.visible !== false)
    .map((p) => p.slug);
}
