#!/usr/bin/env node
/**
 * download-youtube-thumbnail.mjs — Wrap the sibling yt-thumb-down repo so this
 * portfolio can download a YouTube thumbnail straight into assets-raw/.
 *
 * Default tool location:
 *   ../yt-thumb-down
 *
 * Override with:
 *   YT_THUMB_DOWN_PATH=/absolute/path/to/yt-thumb-down
 *
 * Usage:
 *   npm run download:youtube-thumbnail -- --type video --slug my-project --youtube https://youtu.be/dQw4w9WgXcQ
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ASSET_DIR = {
  photography: "photography",
  video: "videography",
  "social-media": "social-media",
};

function usage(exitCode = 0) {
  console.log(`Usage: node scripts/download-youtube-thumbnail.mjs --type <type> --slug <slug> --youtube <url-or-id> [--force]

Examples:
  npm run download:youtube-thumbnail -- --type video --slug retirement-aging --youtube https://www.youtube.com/watch?v=x7U6OarM2vk
  YT_THUMB_DOWN_PATH=/path/to/yt-thumb-down npm run download:youtube-thumbnail -- --type video --slug my-project --youtube dQw4w9WgXcQ
`);
  process.exit(exitCode);
}

function fail(message) {
  console.error(`[download-youtube-thumbnail] ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const parsed = {
    type: "video",
    slug: "",
    youtube: "",
    force: false,
    toolPath: process.env.YT_THUMB_DOWN_PATH || path.resolve(ROOT, "..", "yt-thumb-down"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") usage(0);
    if (arg === "--type" && argv[index + 1]) {
      parsed.type = argv[++index];
      continue;
    }
    if (arg === "--slug" && argv[index + 1]) {
      parsed.slug = argv[++index];
      continue;
    }
    if (arg === "--youtube" && argv[index + 1]) {
      parsed.youtube = argv[++index];
      continue;
    }
    if (arg === "--tool-path" && argv[index + 1]) {
      parsed.toolPath = argv[++index];
      continue;
    }
    if (arg === "--force") {
      parsed.force = true;
      continue;
    }
    fail(`Unknown or incomplete argument: ${arg}`);
  }

  return parsed;
}

function validateSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

function findDownloadedFile(rootDir) {
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && /\.jpe?g$/i.test(entry.name)) {
        return fullPath;
      }
    }
  }

  return null;
}

function hasGo() {
  const result = spawnSync("go", ["version"], { encoding: "utf-8" });
  return result.status === 0;
}

function runDownloader(toolPath, tempDir, youtube) {
  const builtBinary = path.join(toolPath, "yt-thumb-down");

  if (fs.existsSync(builtBinary)) {
    return spawnSync(builtBinary, ["--out", tempDir, youtube], {
      cwd: toolPath,
      encoding: "utf-8",
    });
  }

  if (!hasGo()) {
    fail("Go is required because no local yt-thumb-down binary was found.");
  }

  return spawnSync("go", ["run", "./cmd/yt-thumb-down", "--out", tempDir, youtube], {
    cwd: toolPath,
    encoding: "utf-8",
  });
}

const args = parseArgs(process.argv.slice(2));

if (!(args.type in ASSET_DIR)) {
  fail(`Unsupported type "${args.type}". Expected photography, video, or social-media.`);
}
if (!validateSlug(args.slug)) {
  fail('Slug must match /^[a-z0-9-]+$/.');
}
if (!args.youtube.trim()) {
  fail("Missing --youtube value.");
}
if (!fs.existsSync(args.toolPath)) {
  fail(`yt-thumb-down repo not found at ${args.toolPath}`);
}
if (!fs.existsSync(path.join(args.toolPath, "cmd", "yt-thumb-down", "main.go"))) {
  fail(`Expected Go CLI entrypoint at ${path.join(args.toolPath, "cmd", "yt-thumb-down", "main.go")}`);
}

const outputDir = path.join(ROOT, "assets-raw", ASSET_DIR[args.type], args.slug);
const destination = path.join(outputDir, `${args.slug}-1.jpg`);

fs.mkdirSync(outputDir, { recursive: true });

if (fs.existsSync(destination) && !args.force) {
  console.log(`[download-youtube-thumbnail] Reusing existing ${path.relative(ROOT, destination)}`);
  process.exit(0);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "yt-thumb-down-"));

try {
  const result = runDownloader(args.toolPath, tempDir, args.youtube);
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || "yt-thumb-down failed.");
  }

  const downloadedFile = findDownloadedFile(tempDir);
  if (!downloadedFile) {
    throw new Error("yt-thumb-down completed but no JPG file was produced.");
  }

  fs.copyFileSync(downloadedFile, destination);
  console.log(`[download-youtube-thumbnail] Saved ${path.relative(ROOT, destination)}`);
} catch (error) {
  console.error(
    `[download-youtube-thumbnail] ERROR: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
