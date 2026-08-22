#!/usr/bin/env node
/**
 * create-project.mjs — Interactive CLI to scaffold a new portfolio project.
 *
 * Prompts for type, slug, title, and optionally a YouTube URL for video
 * projects, then:
 *  1. Validates the slug format (lowercase, alphanumeric, hyphens only)
 *  2. Creates the assets-raw/{type}/{slug}/ directory
 *  3. Appends a skeleton JSON entry to the appropriate content file
 *  4. Downloads the YouTube thumbnail for video projects when requested
 *  5. Prints the next steps
 *
 * Business logic lives in `src/lib/scaffold-project.ts` (Jest-tested separately).
 * This script is intentionally thin — just I/O around the pure functions.
 *
 * Usage:
 *   npm run create-project
 *   npm run create-project -- --type video --slug retirement-aging --title "8world | Presenter Insights" --youtube https://www.youtube.com/watch?v=x7U6OarM2vk
 *
 * NOTE: Because scaffold-project.ts is TypeScript, this ESM script duplicates
 * the small helper logic it needs so the CLI stays dependency-free at runtime.
 */

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TYPES = ["photography", "video", "social-media"];

const ASSET_DIR = { photography: "photography", video: "videography", "social-media": "social-media" };
const CONTENT_JSON_FILE = { photography: "photography", video: "videography", "social-media": "social-media" };

function printUsage() {
  console.log(`Usage: npm run create-project -- [options]

Options:
  --type <type>        photography | video | social-media
  --slug <slug>        lowercase, alphanumeric, hyphens only
  --title <title>      display title shown in the portfolio
  --youtube <url-or-id>
                      optional YouTube URL or ID for video projects

When options are omitted, the CLI falls back to interactive prompts.
`);
}

function parseArgs(argv) {
  const parsed = {
    type: "",
    slug: "",
    title: "",
    youtube: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    if (arg === "--type" && argv[index + 1]) {
      parsed.type = argv[++index].trim().toLowerCase();
      continue;
    }
    if (arg === "--slug" && argv[index + 1]) {
      parsed.slug = argv[++index].trim();
      continue;
    }
    if (arg === "--title" && argv[index + 1]) {
      parsed.title = argv[++index].trim();
      continue;
    }
    if (arg === "--youtube" && argv[index + 1]) {
      parsed.youtube = argv[++index].trim();
      continue;
    }

    console.error(`\n\x1b[31mUnknown or incomplete argument:\x1b[0m ${arg}`);
    printUsage();
    process.exit(1);
  }

  return parsed;
}

// ── Pure helpers (mirrors src/lib/scaffold-project.ts) ──────────────────────

function validateSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

function buildYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

function extractYouTubeVideoId(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }

  const raw = trimmed.includes("://") ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^(www|m)\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id ?? "") ? id : null;
    }

    if (host !== "youtube.com" && host !== "youtube-nocookie.com") {
      return null;
    }

    const watchId = url.searchParams.get("v");
    if (/^[A-Za-z0-9_-]{11}$/.test(watchId ?? "")) {
      return watchId;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && (parts[0] === "embed" || parts[0] === "shorts")) {
      return /^[A-Za-z0-9_-]{11}$/.test(parts[1]) ? parts[1] : null;
    }
  } catch {
    return null;
  }

  return null;
}

function runThumbnailDownloader(type, slug, youtubeInput) {
  if (type !== "video" || !youtubeInput.trim()) {
    return { attempted: false, ok: false };
  }

  const downloaderPath = path.join(ROOT, "scripts", "download-youtube-thumbnail.mjs");
  const result = spawnSync(
    process.execPath,
    [downloaderPath, "--type", type, "--slug", slug, "--youtube", youtubeInput],
    {
      cwd: ROOT,
      stdio: "inherit",
    }
  );

  return {
    attempted: true,
    ok: result.status === 0,
  };
}

function getContentJsonPath(type) {
  return path.join(ROOT, "src", "content", "portfolio", `${CONTENT_JSON_FILE[type]}.json`);
}

function getAssetsRawPath(type, slug) {
  return path.join(ROOT, "assets-raw", ASSET_DIR[type], slug);
}

function buildSkeleton(type, slug, title, { videoId = null } = {}) {
  if (type === "photography") {
    return {
      type,
      slug,
      title,
      description: `<!-- Add 120-160 character SEO description for ${title} -->`,
      heading: "\uD83D\uDCCD Singapore | Event Photography",
      ogImage: `https://jineechen.com/assets/photography/${slug}/${slug}-1-800.webp`,
      enableDownload: false,
      imageCount: 0,
      portfolioCard: {
        cardTitle: title,
        thumbnail: `/assets/photography/${slug}/${slug}-1-800.webp`,
      },
    };
  }

  if (type === "video") {
    return {
      type,
      slug,
      title,
      description: `<!-- Add 120-160 character SEO description for ${title} -->`,
      longDescription: `<!-- Add longer paragraph for the project page -->`,
      heading: "Producer | Director",
      location: "\uD83D\uDCCD Singapore",
      ogImage: `https://jineechen.com/assets/videography/${slug}/${slug}-1-800.webp`,
      videos: [
        {
          title: `<!-- Add video title -->`,
          embedUrl: videoId ? buildYouTubeEmbedUrl(videoId) : "https://www.youtube.com/embed/REPLACE_THIS_ID",
          uploadDate: new Date().toISOString().replace(/\.\d+Z$/, "+08:00"),
        },
      ],
      portfolioCard: {
        cardTitle: title,
        thumbnail: `/assets/videography/${slug}/${slug}-1-800.webp`,
      },
    };
  }

  return {
    type,
    slug,
    title,
    description: `<!-- Add 120-160 character SEO description for ${title} -->`,
    heading: "Content Creator | \uD83D\uDCCD Singapore",
    ogImage: `https://jineechen.com/assets/social-media/${slug}/${slug}-1-800.webp`,
    visible: false,
    hasGallery: false,
    instagramUrl: "https://www.instagram.com/reel/REPLACE_THIS/",
    category: "lifestyle",
    tags: ["#tag1", "#tag2", "#tag3"],
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const cliArgs = parseArgs(process.argv.slice(2));
const needsPrompt =
  !cliArgs.type ||
  !cliArgs.slug ||
  !cliArgs.title ||
  (cliArgs.type === "video" && cliArgs.youtube === undefined);
const rl = needsPrompt ? readline.createInterface({ input, output }) : null;

console.log("\n\x1b[1mCreate a new portfolio project\x1b[0m");
console.log("─────────────────────────────\n");

// 1 — Type
let type = cliArgs.type;
while (!TYPES.includes(type)) {
  if (type && !TYPES.includes(type)) {
    console.log(`  \x1b[31mMust be one of: ${TYPES.join(", ")}\x1b[0m`);
  }
  if (!rl) {
    printUsage();
    process.exit(1);
  }
  type = (
    await rl.question(`Project type (${TYPES.join(" / ")}): `)
  ).trim().toLowerCase();
}

// 2 — Slug
let slug = cliArgs.slug;
while (!validateSlug(slug)) {
  if (slug && !validateSlug(slug)) {
    console.log("  \x1b[31mSlug must match /^[a-z0-9-]+$/\x1b[0m");
  }
  if (!rl) {
    printUsage();
    process.exit(1);
  }
  slug = (await rl.question("Slug (lowercase, hyphens only, e.g. my-project): ")).trim();
}

// 3 — Title
let title = cliArgs.title;
if (!title) {
  if (!rl) {
    printUsage();
    process.exit(1);
  }
  title = (await rl.question("Display title (e.g. My Project): ")).trim() || slug;
}

// 4 — Optional YouTube input for video projects
let youtubeInput = cliArgs.youtube ?? "";
if (type === "video") {
  if (cliArgs.youtube === undefined) {
    if (!rl) {
      printUsage();
      process.exit(1);
    }
    youtubeInput = (
      await rl.question("YouTube URL or ID (optional, used for embed + thumbnail): ")
    ).trim();
  }
}

rl?.close();

const videoId = type === "video" && youtubeInput ? extractYouTubeVideoId(youtubeInput) : null;
if (type === "video" && youtubeInput && !videoId) {
  console.log("  \x1b[33mWarning:\x1b[0m Could not parse a YouTube video ID. The scaffold will use the placeholder embed URL.");
}

// 5 — Check content file exists
const jsonPath = getContentJsonPath(type);
if (!fs.existsSync(jsonPath)) {
  console.error(`\n\x1b[31mContent file not found:\x1b[0m ${jsonPath}`);
  process.exit(1);
}

// 6 — Check for duplicate slug
const existing = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
const existingProjects = type === "social-media" ? existing.projects : existing;

if (!Array.isArray(existingProjects)) {
  console.error(`\n\x1b[31mUnexpected content shape in:\x1b[0m ${jsonPath}`);
  process.exit(1);
}

if (existingProjects.some((p) => p.slug === slug)) {
  console.error(
    `\n\x1b[31mSlug "${slug}" already exists in ${CONTENT_JSON_FILE[type]}.json\x1b[0m`
  );
  process.exit(1);
}

// 7 — Create assets-raw directory
const assetsDir = getAssetsRawPath(type, slug);
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log(`\n\x1b[32m✔\x1b[0m Created ${path.relative(ROOT, assetsDir)}/`);
} else {
  console.log(`\n  ℹ  ${path.relative(ROOT, assetsDir)}/ already exists`);
}

// 8 — Append skeleton entry to JSON
const skeleton = buildSkeleton(type, slug, title, { videoId });
existingProjects.push(skeleton);
fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
console.log(`\x1b[32m✔\x1b[0m Appended skeleton to ${path.relative(ROOT, jsonPath)}`);

// 9 — Optional thumbnail download for video projects
const thumbnailDownload = runThumbnailDownloader(type, slug, youtubeInput);
if (thumbnailDownload.attempted && !thumbnailDownload.ok) {
  console.log(
    `\x1b[33m!\x1b[0m Thumbnail download failed. You can retry later with:\n` +
      `  npm run download:youtube-thumbnail -- --type video --slug ${slug} --youtube "${youtubeInput}"`
  );
}

// 10 — Next steps
console.log(`
\x1b[1mNext steps:\x1b[0m
  1. ${type === "video" && thumbnailDownload.ok
    ? `Thumbnail downloaded to: assets-raw/${ASSET_DIR[type]}/${slug}/${slug}-1.jpg`
    : `Add images to:             assets-raw/${ASSET_DIR[type]}/${slug}/`}
  2. Run:                       npm run build:images
  3. Edit:                      src/content/portfolio/${CONTENT_JSON_FILE[type]}.json  (fill in placeholders)
  4. Run:                       npm run build
`);
