#!/usr/bin/env bash
set -euo pipefail

# build-images.sh — Pre-build step for the Next.js project.
#
# In development, public/assets is a symlink to Jinee_website/assets/.
# For production builds (CI or deployment), this script copies the legacy
# assets into public/ so that `next build` can include them in out/.
#
# If the symlink is already in place (local dev), this is a no-op.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS_DIR="$ROOT/public/assets"
LEGACY_ASSETS="$ROOT/Jinee_website/assets"

if [ -L "$ASSETS_DIR" ]; then
  echo "[build-images] public/assets is a symlink — skipping copy (dev mode)."
elif [ -d "$ASSETS_DIR" ]; then
  echo "[build-images] public/assets directory exists — skipping copy."
elif [ -d "$LEGACY_ASSETS" ]; then
  echo "[build-images] Copying assets from Jinee_website/ to public/assets/..."
  cp -R "$LEGACY_ASSETS" "$ASSETS_DIR"
  echo "[build-images] Done."
else
  echo "[build-images] Warning: No assets source found. Skipping."
fi

exit 0
