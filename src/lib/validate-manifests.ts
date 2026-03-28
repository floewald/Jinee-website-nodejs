import fs from "fs";
import path from "path";

export interface ManifestEntry {
  type: "photography" | "video" | "social-media";
  slug: string;
}

/**
 * Given a list of portfolio entries and a base assets path, returns only those
 * entries whose `images.json` manifest is absent.
 *
 * Used by `scripts/validate-manifests.mjs` to catch missing manifests at build
 * time — before `next build` silently renders empty galleries.
 */
export function findMissingManifests(
  entries: ManifestEntry[],
  assetsBasePath: string
): ManifestEntry[] {
  return entries.filter(({ type, slug }) => {
    const manifestPath = path.join(assetsBasePath, type, slug, "images.json");
    return !fs.existsSync(manifestPath);
  });
}
