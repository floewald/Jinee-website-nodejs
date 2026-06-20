import fs from "fs";
import path from "path";
import type { ImageManifestItem } from "@/types/portfolio";

const manifestCache = new Map<string, ImageManifestItem[]>();

function manifestCacheKey(folder: string, slug: string): string {
  return `${folder}/${slug}`;
}

function manifestPath(folder: string, slug: string): string {
  return path.join(process.cwd(), "public", "assets", folder, slug, "images.json");
}

export function clearImageManifestCache(): void {
  manifestCache.clear();
}

export function readImageManifest(folder: string, slug: string): ImageManifestItem[] | undefined {
  const cacheKey = manifestCacheKey(folder, slug);

  if (manifestCache.has(cacheKey)) {
    return manifestCache.get(cacheKey);
  }

  const filePath = manifestPath(folder, slug);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ImageManifestItem[];
  manifestCache.set(cacheKey, data);
  return data;
}

export function findImageManifestItemByPublicPath(publicAssetPath: string): ImageManifestItem | undefined {
  const segments = decodeURIComponent(publicAssetPath)
    .split("/")
    .filter(Boolean);

  if (segments.length !== 4 || segments[0] !== "assets") {
    return undefined;
  }

  const [, folder, slug, filename] = segments;
  const manifest = readImageManifest(folder, slug);
  if (!manifest) return undefined;

  return manifest.find((item) =>
    [`${item.basename}.webp`, item.thumb, item.md, item.lg].includes(filename)
  );
}
