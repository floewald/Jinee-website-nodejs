#!/usr/bin/env node
/**
 * generate-lqip.mjs — LQIP (Low Quality Image Placeholder) generator
 *
 * Reads every images.json manifest under Jinee_website/assets/, generates an
 * 8×8 px blurred WebP for each image entry, base64-encodes it, and writes the
 * result back as a `blur` field on each manifest entry.
 *
 * Run once after adding new images:
 *   node scripts/generate-lqip.mjs
 *
 * Requires: npm install --save-dev sharp
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS_BASE = path.join(ROOT, "Jinee_website", "assets");

// Dynamically import sharp so the script gives a clear error if not installed.
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "[generate-lqip] ERROR: 'sharp' is not installed.\n" +
    "  Run: npm install --save-dev sharp\n"
  );
  process.exit(1);
}

const TYPES = ["photography", "social-media", "video"];
let total = 0;
let skipped = 0;

for (const type of TYPES) {
  const typeDir = path.join(ASSETS_BASE, type);
  if (!fs.existsSync(typeDir)) continue;

  for (const slug of fs.readdirSync(typeDir)) {
    const manifestPath = path.join(typeDir, slug, "images.json");
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    let changed = false;

    for (const item of manifest) {
      // Use the medium (-800) variant as the blur source; fall back to thumb.
      const imageName = item.md ?? item.thumb;
      if (!imageName) continue;

      const imagePath = path.join(typeDir, slug, imageName);
      if (!fs.existsSync(imagePath)) {
        console.warn(`[generate-lqip] Image not found: ${imagePath}`);
        skipped++;
        continue;
      }

      try {
        const buf = await sharp(imagePath)
          .resize(8, 8)
          .blur(1)
          .webp({ quality: 20 })
          .toBuffer();
        item.blur = `data:image/webp;base64,${buf.toString("base64")}`;
        changed = true;
        total++;
      } catch (err) {
        console.warn(`[generate-lqip] Failed to process ${imagePath}: ${err.message}`);
        skipped++;
      }
    }

    if (changed) {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
      console.log(`[generate-lqip] Updated ${type}/${slug}/images.json (${manifest.length} entries)`);
    }
  }
}

console.log(`\n[generate-lqip] Done. ${total} blur placeholders generated, ${skipped} skipped.`);
