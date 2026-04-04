import path from "path";
import type { ProjectType } from "@/types/portfolio";

// Root of the repository — resolves correctly from any nested import location
const ROOT = path.resolve(__dirname, "../../..");

/**
 * Returns true when `slug` matches the allowed format:
 * lowercase letters, digits, and hyphens only.
 */
export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Returns the absolute path of the content JSON file for the given type.
 */
export function getContentJsonPath(type: ProjectType): string {
  return path.join(ROOT, "src", "content", "portfolio", `${type}.json`);
}

/**
 * Returns the directory path where raw images for a new project should be placed.
 */
export function getAssetsRawPath(type: ProjectType, slug: string): string {
  return path.join(ROOT, "assets-raw", type, slug);
}

type SkeletonEntry =
  | ReturnType<typeof photographySkeleton>
  | ReturnType<typeof videoSkeleton>
  | ReturnType<typeof socialMediaSkeleton>;

/**
 * Builds a skeleton portfolio JSON entry for the given type, slug, and title.
 * The result is a ready-to-insert object that satisfies the Zod schema.
 */
export function buildSkeletonEntry(
  type: ProjectType,
  slug: string,
  title: string
): SkeletonEntry {
  if (type === "photography") return photographySkeleton(slug, title);
  if (type === "video") return videoSkeleton(slug, title);
  return socialMediaSkeleton(slug, title);
}

// ── Private skeleton builders ────────────────────────────────────────────────

function photographySkeleton(slug: string, title: string) {
  return {
    type: "photography" as const,
    slug,
    title,
    description: `<!-- Add 120-160 character SEO description for ${title} -->`,
    heading: "📍 Singapore | Event Photography",
    ogImage: `https://jineechen.com/assets/photography/${slug}/${slug}-1-800.webp`,
    enableDownload: false,
    imageCount: 0,
    portfolioCard: {
      cardTitle: title,
      thumbnail: `/assets/photography/${slug}/${slug}-1-800.webp`,
    },
  };
}

function videoSkeleton(slug: string, title: string) {
  return {
    type: "video" as const,
    slug,
    title,
    description: `<!-- Add 120-160 character SEO description for ${title} -->`,
    longDescription: `<!-- Add longer paragraph for the project page -->`,
    heading: "Producer | Director",
    location: "📍 Singapore",
    ogImage: `https://jineechen.com/assets/video/${slug}/${slug}-1-800.webp`,
    videos: [
      {
        title: `<!-- Add video title -->`,
        embedUrl: "https://www.youtube.com/embed/REPLACE_THIS_ID",
        uploadDate: new Date().toISOString().replace(/\.\d+Z$/, "+08:00"),
      },
    ],
    portfolioCard: {
      cardTitle: title,
      thumbnail: `/assets/video/${slug}/${slug}-1-800.webp`,
    },
  };
}

function socialMediaSkeleton(slug: string, title: string) {
  return {
    type: "social-media" as const,
    slug,
    title,
    description: `<!-- Add 120-160 character SEO description for ${title} -->`,
    heading: "Content Creator | 📍 Singapore",
    ogImage: `https://jineechen.com/assets/social-media/${slug}/${slug}-1-800.webp`,
    hasGallery: true,
    portfolioCard: {
      cardTitle: title,
      thumbnail: `/assets/social-media/${slug}/${slug}-1-800.webp`,
    },
  };
}
