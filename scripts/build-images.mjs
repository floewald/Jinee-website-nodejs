#!/usr/bin/env node
/**
 * build-images.mjs — Generate responsive WebP variants from raw source images.
 *
 * Reads originals from  assets-raw/{type}/{slug}/
 * Writes WebP variants to public/assets/{type}/{slug}/
 * Writes images.json manifest per portfolio project (photography, social-media, video).
 *
 * Four variants are generated per image:
 *   {basename}.webp        — full-quality at original dimensions (used for OG/cards)
 *   {basename}-320.webp    — thumb (320 px wide)
 *   {basename}-800.webp    — medium, for gallery slideshows
 *   {basename}-1600.webp   — large, for lightbox/zoom
 *
 * Flat directories (e.g. assets-raw/photos/) are processed without manifests.
 * Existing files are skipped unless --force is passed.
 * Existing LQIP blur data in images.json is preserved across regenerations.
 *
 * Usage:
 *   node scripts/build-images.mjs                         # all types and slugs
 *   node scripts/build-images.mjs --slug event-photography
 *   node scripts/build-images.mjs --slug event-photography --type photography
 *   node scripts/build-images.mjs --force                 # overwrite existing files
 *
 * Requires: sharp  (already declared in devDependencies)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW_BASE = path.join(ROOT, "assets-raw");
const OUT_BASE = path.join(ROOT, "public", "assets");

/** Types that are organised in slug sub-directories and need an images.json manifest. */
const PORTFOLIO_TYPES = ["photography", "social-media", "video"];

/** Width breakpoints for responsive variants. */
const SIZES = [
  { suffix: "-320",  width: 320  },
  { suffix: "-800",  width: 800  },
  { suffix: "-1600", width: 1600 },
];

const QUALITY = 85;
const SUPPORTED = /\.(jpe?g|png|tiff?)$/i;

// ── Parse CLI arguments ───────────────────────────────────────────────────────

const args = process.argv.slice(2);
let filterSlug = null;
let filterType = null;
let force = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--slug" && args[i + 1]) { filterSlug = args[++i]; continue; }
  if (args[i] === "--type" && args[i + 1]) { filterType = args[++i]; continue; }
  if (args[i] === "--force") { force = true; continue; }
  if (args[i] === "--help") {
    console.log(
      "Usage: node scripts/build-images.mjs [--slug <slug>] [--type <type>] [--force]\n\n" +
      "  --slug <slug>   Process only the given project slug (applies to portfolio types)\n" +
      "  --type <type>   Limit to a single type directory (photography|social-media|video|photos|…)\n" +
      "  --force         Re-generate WebP files even if they already exist\n"
    );
    process.exit(0);
  }
}

// ── Load sharp ────────────────────────────────────────────────────────────────

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "[build-images] ERROR: 'sharp' is not installed.\n" +
    "  Run: npm install --save-dev sharp\n"
  );
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a single source image to WebP.
 * Resizes to `width` px when provided; otherwise keeps original dimensions.
 * Returns true on success, false on failure.
 */
async function convertToWebP(srcPath, destPath, width = null) {
  if (!force && fs.existsSync(destPath)) {
    process.stdout.write(`  ↷ ${path.basename(destPath)} (exists)\n`);
    return "skip";
  }

  try {
    let pipeline = sharp(srcPath);
    if (width !== null) {
      pipeline = pipeline.resize(width, null, { withoutEnlargement: true });
    }
    await pipeline.webp({ quality: QUALITY }).toFile(destPath);
    process.stdout.write(`  ✓ ${path.basename(destPath)}\n`);
    return "ok";
  } catch (err) {
    process.stderr.write(`  ✗ ${path.basename(destPath)} — ${err.message}\n`);
    return "fail";
  }
}

/**
 * Process a slug directory that belongs to a portfolio type.
 * Writes images.json manifest and preserves any existing LQIP blur data.
 */
async function processSlugDir(type, slug, rawDir, outDir, stats) {
  fs.mkdirSync(outDir, { recursive: true });

  const images = fs.readdirSync(rawDir)
    .filter(f => SUPPORTED.test(f))
    .sort();

  if (images.length === 0) {
    console.log(`[build-images] ${type}/${slug}: no source images found — skipping.`);
    return;
  }

  console.log(`\n[build-images] ${type}/${slug} (${images.length} source image${images.length !== 1 ? "s" : ""})`);

  // Preserve existing LQIP blur data keyed by basename
  const manifestPath = path.join(outDir, "images.json");
  const existing = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
    : [];
  const blurByBasename = Object.fromEntries(
    existing.map(item => [item.basename, item.blur ?? null])
  );

  const manifest = [];

  for (const filename of images) {
    const basename = filename.replace(/\.[^.]+$/, "");
    const srcPath = path.join(rawDir, filename);

    // Full-quality base variant (original dimensions)
    const baseResult = await convertToWebP(srcPath, path.join(outDir, `${basename}.webp`));
    stats[baseResult]++;

    // Responsive sized variants
    for (const { suffix, width } of SIZES) {
      const result = await convertToWebP(srcPath, path.join(outDir, `${basename}${suffix}.webp`), width);
      stats[result]++;
    }

    const entry = {
      basename,
      thumb:    `${basename}-320.webp`,
      md:       `${basename}-800.webp`,
      lg:       `${basename}-1600.webp`,
      original: null,
    };
    if (blurByBasename[basename]) entry.blur = blurByBasename[basename];
    manifest.push(entry);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  → wrote images.json (${manifest.length} entries)`);
}

/**
 * Process a flat assets directory (e.g. photos/) — no sub-slugs, no manifest.
 */
async function processFlatDir(type, rawDir, outDir, stats) {
  fs.mkdirSync(outDir, { recursive: true });

  const images = fs.readdirSync(rawDir)
    .filter(f => SUPPORTED.test(f))
    .sort();

  if (images.length === 0) return;

  console.log(`\n[build-images] ${type}/ flat (${images.length} source image${images.length !== 1 ? "s" : ""})`);

  for (const filename of images) {
    const basename = filename.replace(/\.[^.]+$/, "");
    const srcPath = path.join(rawDir, filename);

    const baseResult = await convertToWebP(srcPath, path.join(outDir, `${basename}.webp`));
    stats[baseResult]++;

    for (const { suffix, width } of SIZES) {
      const result = await convertToWebP(srcPath, path.join(outDir, `${basename}${suffix}.webp`), width);
      stats[result]++;
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!fs.existsSync(RAW_BASE)) {
  console.error(`[build-images] ERROR: assets-raw/ directory not found at ${RAW_BASE}`);
  process.exit(1);
}

const stats = { ok: 0, skip: 0, fail: 0 };
const typeDirs = fs.readdirSync(RAW_BASE).filter(name =>
  fs.statSync(path.join(RAW_BASE, name)).isDirectory()
);

for (const type of typeDirs) {
  if (filterType && type !== filterType) continue;

  const rawTypeDir = path.join(RAW_BASE, type);
  const outTypeDir = path.join(OUT_BASE, type);
  const isPortfolio = PORTFOLIO_TYPES.includes(type);

  if (isPortfolio) {
    // Slug-based sub-directories
    const slugs = fs.readdirSync(rawTypeDir)
      .filter(name => fs.statSync(path.join(rawTypeDir, name)).isDirectory());

    for (const slug of slugs) {
      if (filterSlug && slug !== filterSlug) continue;
      await processSlugDir(
        type, slug,
        path.join(rawTypeDir, slug),
        path.join(outTypeDir, slug),
        stats
      );
    }
  } else {
    // Flat directory — filterSlug has no meaning here; skip if a slug filter is set
    if (filterSlug) continue;
    await processFlatDir(type, rawTypeDir, outTypeDir, stats);
  }
}

console.log(
  `\n[build-images] Done — ${stats.ok} generated, ${stats.skip} skipped, ${stats.fail} failed.`
);
if (stats.fail > 0) process.exit(1);
