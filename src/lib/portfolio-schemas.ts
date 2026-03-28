import { z } from "zod";
import type { ProjectType } from "@/types/portfolio";

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const PortfolioCardSchema = z.object({
  cardTitle: z.string().min(1),
  thumbnail: z.string().min(1),
  order: z.number().optional(),
  previewImages: z.array(z.string()).optional(),
});

const VideoItemSchema = z.object({
  title: z.string().min(1),
  embedUrl: z.string().url(),
  uploadDate: z.string().min(1),
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
  longDescription: z.string().optional(),
  videos: z.array(VideoItemSchema),
});

export const SocialMediaProjectSchema = BaseProjectSchema.extend({
  type: z.literal("social-media"),
  hasGallery: z.boolean(),
  imageCount: z.number().int().nonnegative().optional(),
  enableDownload: z.boolean().optional(),
  customContent: z.string().optional(),
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
