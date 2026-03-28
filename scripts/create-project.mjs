#!/usr/bin/env node
/**
 * create-project.mjs — Interactive CLI to scaffold a new portfolio project.
 *
 * Prompts for type, slug, and title then:
 *  1. Validates the slug format (lowercase, alphanumeric, hyphens only)
 *  2. Creates the assets-raw/{type}/{slug}/ directory
 *  3. Appends a skeleton JSON entry to the appropriate content file
 *  4. Prints the next steps
 *
 * Business logic lives in `src/lib/scaffold-project.ts` (Jest-tested separately).
 * This script is intentionally thin — just I/O around the pure functions.
 *
 * Usage:
 *   npm run create-project
 *
 * Requires: compiled TypeScript or ts-node. This script calls the compiled
 * output, which is auto-built by the Next.js build. For standalone use before
 * a build, you can run `npx ts-node --project tsconfig.json` wrappers — but in
 * practice, `npm run build` compiles everything and this script is intended as a
 * pre-build DX helper.
 *
 * NOTE: Because scaffold-project.ts is TypeScript, this ESM script imports Zod
 * validated helpers by dynamically compiling via ts-fest-style inline path.
 * To avoid requiring ts-node as a runtime dependency we instead duplicate the
 * minimal pure-JS logic inline here, keeping parity with the TypeScript module.
 */

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TYPES = ["photography", "video", "social-media"];

// ── Pure helpers (mirrors src/lib/scaffold-project.ts) ──────────────────────

function validateSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

function getContentJsonPath(type) {
  return path.join(ROOT, "src", "content", "portfolio", `${type}.json`);
}

function getAssetsRawPath(type, slug) {
  return path.join(ROOT, "assets-raw", type, slug);
}

function buildSkeleton(type, slug, title) {
  const base = {
    type,
    slug,
    title,
    description: `<!-- Add 120-160 character SEO description for ${title} -->`,
    heading: type === "video" ? "Producer | Director | \uD83D\uDCCD Singapore" : "\uD83D\uDCCD Singapore | Photographer",
    ogImage: `https://jineechen.com/assets/${type}/${slug}/${slug}-1-800.webp`,
    portfolioCard: {
      cardTitle: title,
      thumbnail: `/assets/${type}/${slug}/${slug}-1-800.webp`,
    },
  };

  if (type === "photography") {
    return { ...base, enableDownload: false, imageCount: 0 };
  }
  if (type === "video") {
    return {
      ...base,
      longDescription: `<!-- Add longer paragraph for the project page -->`,
      videos: [
        {
          title: `<!-- Add video title -->`,
          embedUrl: "https://www.youtube.com/embed/REPLACE_THIS_ID",
          uploadDate: new Date().toISOString().replace(/\.\d+Z$/, "+08:00"),
        },
      ],
    };
  }
  // social-media
  return { ...base, hasGallery: true };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input, output });

console.log("\n\x1b[1mCreate a new portfolio project\x1b[0m");
console.log("─────────────────────────────\n");

// 1 — Type
let type = "";
while (!TYPES.includes(type)) {
  type = (
    await rl.question(`Project type (${TYPES.join(" / ")}): `)
  ).trim().toLowerCase();
  if (!TYPES.includes(type)) {
    console.log(`  \x1b[31mMust be one of: ${TYPES.join(", ")}\x1b[0m`);
  }
}

// 2 — Slug
let slug = "";
while (!validateSlug(slug)) {
  slug = (await rl.question("Slug (lowercase, hyphens only, e.g. my-project): ")).trim();
  if (!validateSlug(slug)) {
    console.log("  \x1b[31mSlug must match /^[a-z0-9-]+$/\x1b[0m");
  }
}

// 3 — Title
const title = (await rl.question("Display title (e.g. My Project): ")).trim() || slug;

rl.close();

// 4 — Check content file exists
const jsonPath = getContentJsonPath(type);
if (!fs.existsSync(jsonPath)) {
  console.error(`\n\x1b[31mContent file not found:\x1b[0m ${jsonPath}`);
  process.exit(1);
}

// 5 — Check for duplicate slug
const existing = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
if (existing.some((p) => p.slug === slug)) {
  console.error(`\n\x1b[31mSlug "${slug}" already exists in ${type}.json\x1b[0m`);
  process.exit(1);
}

// 6 — Create assets-raw directory
const assetsDir = getAssetsRawPath(type, slug);
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log(`\n\x1b[32m✔\x1b[0m Created ${path.relative(ROOT, assetsDir)}/`);
} else {
  console.log(`\n  ℹ  ${path.relative(ROOT, assetsDir)}/ already exists`);
}

// 7 — Append skeleton entry to JSON
const skeleton = buildSkeleton(type, slug, title);
existing.push(skeleton);
fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
console.log(`\x1b[32m✔\x1b[0m Appended skeleton to ${path.relative(ROOT, jsonPath)}`);

// 8 — Next steps
console.log(`
\x1b[1mNext steps:\x1b[0m
  1. Add images to:  assets-raw/${type}/${slug}/
  2. Run:            npm run build:images
  3. Edit:           src/content/portfolio/${type}.json  (fill in placeholders)
  4. Run:            npm run build
`);
