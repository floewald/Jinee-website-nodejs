#!/usr/bin/env bash
# build-preview-zip.sh
#
# Builds the static frontend and packages it into a dated ZIP for customer review.
# The ZIP contains only HTML/CSS/JS — no PHP backend, no secrets.
# Launcher scripts are bundled so the customer can open the site with one double-click.
#
# Usage:
#   npm run preview
#   bash scripts/build-preview-zip.sh   (if out/ already exists)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATE="$(date +%Y-%m-%d)"
OUT_DIR="$REPO_ROOT/out"
ZIP_NAME="jinee-preview-$DATE.zip"
ZIP_PATH="$OUT_DIR/$ZIP_NAME"

# ── 1. Verify the build output exists ──────────────────────────────────────
if [ ! -d "$OUT_DIR" ]; then
  echo "ERROR: out/ directory not found. Run 'npm run build:next' first." >&2
  exit 1
fi

if [ ! -f "$OUT_DIR/index.html" ]; then
  echo "ERROR: out/index.html missing — build may have failed." >&2
  exit 1
fi

# ── 2. Remove any old ZIP with the same name ───────────────────────────────
rm -f "$ZIP_PATH"

# ── 3. Write launcher scripts into out/ (removed after zipping) ─────────────

MAC_LAUNCHER="$OUT_DIR/START HERE (Mac).command"
WIN_LAUNCHER="$OUT_DIR/START HERE (Windows).bat"

cat > "$MAC_LAUNCHER" <<'MACEOF'
#!/usr/bin/env bash
# Double-click this file in Finder to open the preview in your browser.
# Requires Python 3 (pre-installed on all modern Macs) or Node.js.
cd "$(dirname "$0")"
PORT=3737
if command -v python3 &>/dev/null; then
  python3 -m http.server $PORT &>/dev/null &
elif command -v npx &>/dev/null; then
  npx --yes serve -p $PORT -s . &>/dev/null &
else
  osascript -e 'display alert "Please install Python 3 or Node.js to open the preview." as critical'
  exit 1
fi
sleep 1
open "http://localhost:$PORT"
MACEOF
chmod +x "$MAC_LAUNCHER"

cat > "$WIN_LAUNCHER" <<'WINEOF'
@echo off
:: Double-click this file in Explorer to open the preview in your browser.
:: Uses PowerShell — built into every Windows 10/11 machine, no installs needed.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=3737; $root=Split-Path $MyInvocation.MyCommand.Path; $l=New-Object Net.HttpListener; $l.Prefixes.Add('http://localhost:'+$port+'/'); $l.Start(); Start-Process ('http://localhost:'+$port); while($l.IsListening){ $ctx=$l.GetContext(); $p=$ctx.Request.Url.LocalPath; if($p -eq '/'){$p='/index.html'}; $f=Join-Path $root $p.Replace('/','\'); if(Test-Path $f){ $b=[IO.File]::ReadAllBytes($f); $ctx.Response.ContentLength64=$b.Length; $ctx.Response.OutputStream.Write($b,0,$b.Length) }; $ctx.Response.Close() }"
WINEOF

# ── 4. Create the ZIP ──────────────────────────────────────────────────────
cd "$OUT_DIR"
zip -r "$ZIP_PATH" . --quiet
cd "$REPO_ROOT"

# ── 5. Remove launchers from out/ (keep out/ clean for normal deploys) ─────
rm -f "$MAC_LAUNCHER" "$WIN_LAUNCHER"

# ── 6. Report ──────────────────────────────────────────────────────────────
FILE_COUNT=$(find "$OUT_DIR" -type f | wc -l | tr -d ' ')
ZIP_SIZE=$(du -sh "$ZIP_PATH" | cut -f1)

echo ""
echo "Preview ZIP ready:"
echo "  File : $ZIP_NAME"
echo "  Size : $ZIP_SIZE  ($FILE_COUNT source files)"
echo ""
echo "Send '$ZIP_NAME' to the customer."
echo "  Mac     → double-click 'START HERE (Mac).command'"
echo "  Windows → double-click 'START HERE (Windows).bat'"
