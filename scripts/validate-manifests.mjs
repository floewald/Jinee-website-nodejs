#!/usr/bin/env node
/**
 * validate-manifests.mjs — Build-time guard for missing image manifests.
 *
 * Reads all three portfolio JSON files (photography, video, social-media),
 * and for every project that has a `portfolioCard` verifies that the
 * corresponding `public/assets/{type}/{slug}/images.json` exists.
 *
 * If any manifests are missing the script logs a clear warning and exits 1,
 * so the Next.js build fails early with an actionable message instead of
 * silently rendering empty galleries.
 *
 * If the `public/assets/` directory is not present (e.g. a fresh
 * checkout without the asset tree) the check is skipped entirely.
 *
 * Usage:
 *   node scripts/validate-manifests.mjs
 *
 * This script is called automatically by `npm run build` via the
 * `validate:manifests` entry in package.json.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS_BASE = path.join(ROOT, "public", "assets");
const CONTENT_BASE = path.join(ROOT, "src", "content", "portfolio");

// Skip the entire check when the assets tree is absent (fresh checkout / CI-only builds)
if (!fs.existsSync(ASSETS_BASE)) {
  console.log("[validate-manifests] public/assets/ not found — skipping manifest validation.");
  process.exit(0);
}

const TYPES = /** @type {const} */ (["photography", "video", "social-media"]);

/** @type {{ type: string; slug: string }[]} */
const missing = [];

for (const type of TYPES) {
  const jsonPath = path.join(CONTENT_BASE, type === "social-media" ? "social-media.json" : `${type}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.warn(`[validate-manifests] Content file not found: ${jsonPath}`);
    continue;
  }

  /** @type {Array<{ slug: string; portfolioCard?: unknown }>} */
  const projects = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  for (const project of projects) {
    // Only validate projects that are shown as portfolio cards
    if (!project.portfolioCard) continue;

    const manifestPath = path.join(ASSETS_BASE, type, project.slug, "images.json");
    if (!fs.existsSync(manifestPath)) {
      missing.push({ type, slug: project.slug });
    }
  }
}

if (missing.length > 0) {
  console.error("\n[validate-manifests] ERROR: Missing image manifests detected!\n");
  console.error("The following projects have a portfolioCard but no images.json:");
  for (const { type, slug } of missing) {
    console.error(`  • ${type}/${slug}  →  public/assets/${type}/${slug}/images.json`);
  }
  console.error(
    "\nTo fix: add images to assets-raw/{type}/{slug}/ then run:\n" +
    "  npm run build:images\n"
  );
  process.exit(1);
}

const total = TYPES.reduce((sum, type) => {
  const jsonPath = path.join(CONTENT_BASE, type === "social-media" ? "social-media.json" : `${type}.json`);
  if (!fs.existsSync(jsonPath)) return sum;
  const projects = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  return sum + projects.filter((/** @type {{ portfolioCard?: unknown }} */ p) => p.portfolioCard).length;
}, 0);

console.log(`[validate-manifests] All ${total} portfolio manifests present. ✓`);
