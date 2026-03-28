#!/usr/bin/env bash

# build-images.sh — Generate responsive image assets from assets-raw/.
#
# This is a thin wrapper around scripts/build-images.mjs so users can run:
#   bash scripts/build-images.sh
# and CI/npm can share the same entry point.

if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
  echo "[build-images] Do not source this script. Run: bash scripts/build-images.sh"
  return 1
fi

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GENERATOR="$ROOT/scripts/build-images.mjs"

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Usage: bash scripts/build-images.sh [--type <type>] [--slug <slug>] [--force]

Examples:
  bash scripts/build-images.sh
  bash scripts/build-images.sh --type video --slug re-old-times
  bash scripts/build-images.sh --type photography --slug event-photography --force
EOF
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[build-images] ERROR: Node.js is required but not found in PATH."
  exit 1
fi

if [ ! -f "$GENERATOR" ]; then
  echo "[build-images] ERROR: Generator not found at $GENERATOR"
  exit 1
fi

target_type=""
args=("$@")
for ((i = 0; i < ${#args[@]}; i++)); do
  if [[ "${args[$i]}" == "--type" && $((i + 1)) -lt ${#args[@]} ]]; then
    target_type="${args[$((i + 1))]}"
  fi
done

echo "[build-images] Generating assets from assets-raw/ into public/assets/ ..."
node "$GENERATOR" "$@"

# Generate app icons from assets-raw/photos/icon.png so CI/deploy can recreate
# all required non-WebP icon files without committing public/assets/photos.
ICON_SRC="$ROOT/assets-raw/photos/icon.png"
ICON_OUT_DIR="$ROOT/public/assets/photos"
if [[ -f "$ICON_SRC" && ( -z "$target_type" || "$target_type" == "photos" ) ]]; then
  echo "[build-images] Generating app icons from assets-raw/photos/icon.png ..."
  mkdir -p "$ICON_OUT_DIR"

  node --input-type=module <<'EOF'
import sharp from "sharp";
import path from "path";

const root = process.cwd();
const src = path.join(root, "assets-raw", "photos", "icon.png");
const out = path.join(root, "public", "assets", "photos");

await sharp(src).resize(32, 32).png().toFile(path.join(out, "icon-32.png"));
await sharp(src).resize(192, 192).png().toFile(path.join(out, "icon-192.png"));
await sharp(src).resize(180, 180).png().toFile(path.join(out, "apple-touch-icon.png"));
EOF

  if command -v magick >/dev/null 2>&1; then
    magick "$ICON_SRC" -define icon:auto-resize=16,32,48 "$ICON_OUT_DIR/favicon.ico"
  else
    cp "$ICON_OUT_DIR/icon-32.png" "$ICON_OUT_DIR/favicon.ico"
    echo "[build-images] Warning: ImageMagick not found, favicon.ico is PNG fallback."
  fi

  echo "[build-images] App icons generated."
fi

echo "[build-images] Done."
