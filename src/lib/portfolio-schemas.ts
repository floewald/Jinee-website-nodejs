import { z } from "zod";
import type { ProjectType } from "@/types/portfolio";

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const PLACEHOLDER_INSTAGRAM_TOKEN = "REPLACE_THIS";

function isInstagramPostUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const [kind, id] = url.pathname.split("/").filter(Boolean);
    return host === "instagram.com" && ["p", "reel"].includes(kind ?? "") && Boolean(id);
  } catch {
    return false;
  }
}

function hasPlaceholderInstagramId(value: string): boolean {
  return value.toUpperCase().includes(PLACEHOLDER_INSTAGRAM_TOKEN);
}

const PortfolioCardSchema = z.object({
  cardTitle: z.string().min(1),
  thumbnail: z.string().min(1),
  order: z.number().optional(),
  previewImages: z.array(z.string()).optional(),
});

const VideoItemSchema = z.object({
  title: z.string().min(1),
  embedUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  previewImage: z.string().optional(),
  description: z.union([z.string(), z.array(z.string())]).optional(),
  uploadDate: z.string().min(1),
}).refine((v) => v.embedUrl || v.linkUrl, {
  message: "VideoItem must have either embedUrl or linkUrl",
});

const BaseProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric and hyphens only"),
  title: z.string().min(1),
  description: z.string().min(1),
  heading: z.string().min(1),
  ogImage: z.string().url(),
  visible: z.boolean().optional(),
  portfolioCard: PortfolioCardSchema.optional(),
});

// ── Per-type schemas ─────────────────────────────────────────────────────────

export const PhotographyProjectSchema = BaseProjectSchema.extend({
  type: z.literal("photography"),
  enableDownload: z.boolean(),
  imageCount: z.number().int().nonnegative(),
  showSlideshow: z.boolean().optional(),
});

export const VideoProjectSchema = BaseProjectSchema.extend({
  type: z.literal("video"),
  location: z.string().optional(),
  longDescription: z.union([z.string(), z.array(z.string())]).optional(),
  videos: z.array(VideoItemSchema),
});

export const SocialMediaProjectSchema = BaseProjectSchema.extend({
  type: z.literal("social-media"),
  hasGallery: z.boolean(),
  imageCount: z.number().int().nonnegative().optional(),
  enableDownload: z.boolean().optional(),
  customContent: z.string().optional(),
  instagramUrl: z.string().url().optional(),
  category: z.enum(["lifestyle", "editorial"]).optional(),
  tags: z.array(z.string()).optional(),
}).superRefine((project, ctx) => {
  const isVisible = project.visible !== false;

  if (project.instagramUrl && !isInstagramPostUrl(project.instagramUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["instagramUrl"],
      message: "instagramUrl must be a direct Instagram post or reel URL",
    });
  }

  if (!isVisible) return;

  if (!project.instagramUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["instagramUrl"],
      message: "Visible social-media projects must define instagramUrl",
    });
  } else if (hasPlaceholderInstagramId(project.instagramUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["instagramUrl"],
      message: "Replace the scaffold instagramUrl placeholder before publishing",
    });
  }

  if (!project.category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["category"],
      message: "Visible social-media projects must define category",
    });
  }
});

// ── Social-media manifest (sections + projects) ─────────────────────────────

export const SocialMediaSectionSchema = z.object({
  key: z.enum(["lifestyle", "editorial"]),
  label: z.string().min(1),
});

export const SocialMediaManifestSchema = z.object({
  sections: z.array(SocialMediaSectionSchema),
  projects: z.array(SocialMediaProjectSchema),
});

// ── Typed union ──────────────────────────────────────────────────────────────

const schemaByType = {
  photography: z.array(PhotographyProjectSchema),
  video: z.array(VideoProjectSchema),
  "social-media": z.array(SocialMediaProjectSchema),
} as const;

/**
 * Validates a raw JSON array against the schema for the given portfolio type.
 * Throws a `ZodError` with a clear field-level message if validation fails.
 *
 * Called from `portfolio-config.ts` at module load time so that any malformed
 * content JSON causes an immediate, actionable error during `npm run build`.
 */
export function validatePortfolioData(
  type: ProjectType,
   
  data: unknown[]
): unknown[] {
  return schemaByType[type].parse(data);
}
