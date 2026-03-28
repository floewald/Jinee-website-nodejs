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

echo "[build-images] Generating assets from assets-raw/ into public/assets/ ..."
node "$GENERATOR" "$@"
echo "[build-images] Done."
