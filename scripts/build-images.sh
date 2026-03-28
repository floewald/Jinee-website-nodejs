#!/usr/bin/env bash
set -euo pipefail

# build-images.sh — Pre-build step for the Next.js project.
#
# Verifies that public/assets/ exists so that `next build` can serve images.
# The directory is populated by running `npm run build:images` after placing
# raw originals in assets-raw/{type}/{slug}/.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS_DIR="$ROOT/public/assets"

if [ -d "$ASSETS_DIR" ]; then
  echo "[build-images] public/assets directory exists — ready for build."
else
  echo "[build-images] Warning: public/assets/ not found. Run 'npm run build:images' to generate assets."
fi

exit 0
