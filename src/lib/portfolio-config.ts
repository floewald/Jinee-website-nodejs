import type {
  PhotographyProject,
  VideoProject,
  SocialMediaProject,
  SocialMediaSection,
  PortfolioProject,
  PortfolioIndexConfig,
  CollageImageConfig,
} from "@/types/portfolio";

import { validatePortfolioData, SocialMediaManifestSchema } from "@/lib/portfolio-schemas";
import { findImageManifestItemByPublicPath } from "@/lib/image-manifests";

import photographyData from "@/content/portfolio/photography.json";
import videoData from "@/content/portfolio/videography.json";
import socialMediaData from "@/content/portfolio/social-media.json";
import indexConfigData from "@/content/portfolio/index-config.json";

// ─── index-config.json raw shape ─────────────────────────────────────────────

interface SlugEntry {
  src: string;
  alt: string;
  objectPosition?: string;
}

interface PortfolioIndexRawConfig {
  slugs: Record<string, SlugEntry>;
  collageImages: string[];
  collageImagesMobile?: string[];
  slideshowImages?: string[];
  videoSectionTitle: string;
  heroFit?: string;
}

function resolveImages(
  keys: string[],
  slugs: Record<string, SlugEntry>
): CollageImageConfig[] {
  return keys.map((key) => {
    const entry = slugs[key];

    if (!entry) {
      throw new Error(
        `[portfolio-config] Unknown collage image key "${key}" in index-config.json.`
      );
    }

    const manifestItem = findImageManifestItemByPublicPath(entry.src);

    if (!manifestItem?.width || !manifestItem?.height) {
      throw new Error(
        `[portfolio-config] Could not read intrinsic dimensions for collage image "${key}" at "${entry.src}".`
      );
    }

    return {
      src: entry.src,
      alt: entry.alt,
      srcFull: entry.src,
      width: manifestItem.width,
      height: manifestItem.height,
      ...(entry.objectPosition ? { objectPosition: entry.objectPosition } : {}),
    };
  });
}

// ─── Cast the raw JSON to typed arrays ───────────────────────────────────────
export const photographyProjects = validatePortfolioData(
  "photography",
  photographyData
) as PhotographyProject[];

export const videoProjects = validatePortfolioData(
  "video",
  videoData
) as VideoProject[];

// social-media.json is a manifest object { sections, projects } — parse with full schema
const socialMediaManifest = SocialMediaManifestSchema.parse(socialMediaData);
export const socialMediaSections: SocialMediaSection[] = socialMediaManifest.sections;
export const socialMediaProjects = socialMediaManifest.projects as SocialMediaProject[];

const _raw = indexConfigData as unknown as PortfolioIndexRawConfig;

export const portfolioIndexConfig: PortfolioIndexConfig = {
  collageImages: resolveImages(_raw.collageImages, _raw.slugs),
  collageImagesMobile: _raw.collageImagesMobile
    ? resolveImages(_raw.collageImagesMobile, _raw.slugs)
    : undefined,
  slideshowImages: _raw.slideshowImages
    ? resolveImages(_raw.slideshowImages, _raw.slugs)
    : undefined,
  videoSectionTitle: _raw.videoSectionTitle,
  heroFit: _raw.heroFit as PortfolioIndexConfig["heroFit"],
};

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
