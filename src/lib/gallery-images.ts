import fs from "fs";
import path from "path";

export interface GalleryImage {
  src: string;
  alt: string;
  srcFull: string;
  blur?: string;
  width?: number;
  height?: number;
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

const webpDimensionsCache = new Map<string, { width: number; height: number } | null>();

function readWebPDimensions(filePath: string): { width: number; height: number } | undefined {
  if (webpDimensionsCache.has(filePath)) {
    return webpDimensionsCache.get(filePath) ?? undefined;
  }

  try {
    const buffer = fs.readFileSync(filePath);
    if (!Buffer.isBuffer(buffer)) {
      webpDimensionsCache.set(filePath, null);
      return undefined;
    }

    if (
      buffer.toString("ascii", 0, 4) !== "RIFF" ||
      buffer.toString("ascii", 8, 12) !== "WEBP"
    ) {
      webpDimensionsCache.set(filePath, null);
      return undefined;
    }

    const chunkType = buffer.toString("ascii", 12, 16);
    let dimensions: { width: number; height: number } | undefined;

    if (chunkType === "VP8 ") {
      dimensions = {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    } else if (chunkType === "VP8L") {
      const byte0 = buffer[21];
      const byte1 = buffer[22];
      const byte2 = buffer[23];
      const byte3 = buffer[24];
      dimensions = {
        width: 1 + (((byte1 & 0x3f) << 8) | byte0),
        height: 1 + (((byte3 & 0x0f) << 10) | (byte2 << 2) | ((byte1 & 0xc0) >> 6)),
      };
    } else if (chunkType === "VP8X") {
      dimensions = {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }

    webpDimensionsCache.set(filePath, dimensions ?? null);
    return dimensions;
  } catch {
    webpDimensionsCache.set(filePath, null);
    return undefined;
  }
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
      src: `${baseUrl}/${item.md!}`,
      alt: item.basename,
      srcFull: item.lg ? `${baseUrl}/${item.lg}` : `${baseUrl}/${item.md!}`,
      ...readWebPDimensions(path.join(process.cwd(), "public", "assets", folder, slug, item.md!)),
      ...(item.blur ? { blur: item.blur } : {}),
    }));
}
