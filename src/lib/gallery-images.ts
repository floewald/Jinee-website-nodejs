import fs from "fs";
import path from "path";

export interface GalleryImage {
  src: string;
  alt: string;
  srcFull: string;
  blur?: string;
}

export interface SlideshowImage {
  src: string;
  blur?: string;
}

interface ImageManifestItem {
  basename: string;
  thumb: string | null;
  md: string | null;
  lg: string | null;
  original: string | null;
  blur?: string;
}

/**
 * Returns all image src paths (-800.webp) from the images.json manifest
 * for use in card slideshows.  Falls back to an empty array when no manifest
 * exists (e.g. video projects that only have a thumbnail).
 */
const ASSET_FOLDER: Record<"photography" | "social-media" | "video", string> = {
  photography: "photography",
  "social-media": "social-media",
  video: "videography",
};

export function getProjectSlideshowImages(
  slug: string,
  type: "photography" | "social-media" | "video"
): SlideshowImage[] {
  const folder = ASSET_FOLDER[type];
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "assets",
    folder,
    slug,
    "images.json"
  );

  if (!fs.existsSync(manifestPath)) {
    console.warn(`[gallery-images] No manifest found for "${slug}" (${type}). Expected: ${manifestPath}`);
    return [];
  }

  const data: ImageManifestItem[] = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8")
  );

  const baseUrl = `/assets/${folder}/${slug}`;

  return data.filter((item) => item.md).map((item) => ({
    src: `${baseUrl}/${item.md}`,
    ...(item.blur ? { blur: item.blur } : {}),
  }));
}

/**
 * Reads the images.json manifest for a project at build time.
 * Returns images ready for use in GalleryGrid / Lightbox.
 */
export function getGalleryImages(
  slug: string,
  type: "photography" | "social-media" | "video"
): GalleryImage[] {
  const folder = ASSET_FOLDER[type];
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "assets",
    folder,
    slug,
    "images.json"
  );

  if (!fs.existsSync(manifestPath)) {
    console.warn(`[gallery-images] No manifest found for "${slug}" (${type}). Expected: ${manifestPath}`);
    return [];
  }

  const data: ImageManifestItem[] = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8")
  );

  const baseUrl = `/assets/${folder}/${slug}`;

  return data
    .filter((item) => item.md)
    .map((item) => ({
      src: `${baseUrl}/${item.md}`,
      alt: item.basename,
      srcFull: item.lg ? `${baseUrl}/${item.lg}` : `${baseUrl}/${item.md}`,
      ...(item.blur ? { blur: item.blur } : {}),
    }));
}
