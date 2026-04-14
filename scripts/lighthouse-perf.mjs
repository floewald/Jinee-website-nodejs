#!/usr/bin/env node
/**
 * Lighthouse performance tracker.
 *
 * Builds the static export, serves it locally, runs Lighthouse on key pages,
 * saves the results to perf-results/latest.json, and compares against the
 * previous run stored in perf-results/previous.json.
 *
 * Usage:
 *   node scripts/lighthouse-perf.mjs              # audit default pages
 *   node scripts/lighthouse-perf.mjs /about /portfolio/  # audit specific paths
 *   node scripts/lighthouse-perf.mjs --skip-build  # skip npm run build:next
 */

import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RESULTS_DIR = path.join(ROOT, "perf-results");
const LATEST_FILE = path.join(RESULTS_DIR, "latest.json");
const PREVIOUS_FILE = path.join(RESULTS_DIR, "previous.json");

const DEFAULT_PATHS = ["/", "/portfolio/", "/portfolio/photography/"];
const PORT = 9123;

// ── Helpers ──────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function log(msg) {
  console.log(`\n\x1b[36m▸ ${msg}\x1b[0m`);
}

function waitForServer(url, timeoutMs = 15_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      fetch(url, { method: "HEAD" })
        .then((r) => {
          if (r.ok) resolve();
          else retry();
        })
        .catch(retry);
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server at ${url} did not start within ${timeoutMs}ms`));
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  });
}

// ── Parse args ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const pagePaths =
  args.filter((a) => a.startsWith("/")).length > 0
    ? args.filter((a) => a.startsWith("/"))
    : DEFAULT_PATHS;

// ── Ensure lighthouse is available ───────────────────────────────────────

try {
  createRequire(import.meta.url).resolve("lighthouse");
} catch {
  log("Installing lighthouse (one-time)…");
  execSync("npm install --save-dev lighthouse", { cwd: ROOT, stdio: "inherit" });
}

const lighthouse = (await import("lighthouse")).default;
const chromeLauncher = await import("chrome-launcher");

// ── Build ────────────────────────────────────────────────────────────────

if (!skipBuild) {
  log("Building static export (npm run build:next)…");
  execSync("npm run build:next", { cwd: ROOT, stdio: "inherit" });
}

if (!fs.existsSync(path.join(ROOT, "out"))) {
  console.error("Error: out/ directory not found. Run without --skip-build first.");
  process.exit(1);
}

// ── Serve ────────────────────────────────────────────────────────────────

log(`Starting local server on port ${PORT}…`);
const server = spawn("npx", ["serve", "out", "-l", String(PORT), "--no-clipboard"], {
  cwd: ROOT,
  stdio: "ignore",
  detached: true,
});

const baseUrl = `http://localhost:${PORT}`;

try {
  await waitForServer(baseUrl);

  // ── Run Lighthouse per page ──────────────────────────────────────────

  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless", "--no-sandbox"] });
  const results = { timestamp: new Date().toISOString(), pages: {} };

  for (const pagePath of pagePaths) {
    const url = `${baseUrl}${pagePath}`;
    log(`Auditing ${pagePath}…`);

    const run = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance"],
    });

    const audits = run.lhr.audits;
    const perfScore = run.lhr.categories.performance.score;

    results.pages[pagePath] = {
      score: Math.round(perfScore * 100),
      metrics: {
        FCP: Math.round(audits["first-contentful-paint"].numericValue),
        LCP: Math.round(audits["largest-contentful-paint"].numericValue),
        TBT: Math.round(audits["total-blocking-time"].numericValue),
        CLS: parseFloat(audits["cumulative-layout-shift"].numericValue.toFixed(4)),
        SI: Math.round(audits["speed-index"].numericValue),
      },
    };
  }

  await chrome.kill();

  // ── Save results ───────────────────────────────────────────────────────

  ensureDir(RESULTS_DIR);

  let previous = null;
  if (fs.existsSync(LATEST_FILE)) {
    previous = JSON.parse(fs.readFileSync(LATEST_FILE, "utf-8"));
    fs.writeFileSync(PREVIOUS_FILE, JSON.stringify(previous, null, 2));
  }

  fs.writeFileSync(LATEST_FILE, JSON.stringify(results, null, 2));
  log(`Results saved to perf-results/latest.json`);

  // ── Compare ────────────────────────────────────────────────────────────

  printResults(results, previous);
} finally {
  // Kill the server process group
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

// ── Reporting ────────────────────────────────────────────────────────────

function printResults(current, previous) {
  console.log("\n" + "═".repeat(72));
  console.log("  LIGHTHOUSE PERFORMANCE REPORT");
  console.log("  " + current.timestamp);
  console.log("═".repeat(72));

  const METRIC_UNITS = { FCP: "ms", LCP: "ms", TBT: "ms", CLS: "", SI: "ms" };
  // For ms-based metrics: lower is better. For CLS: lower is better.
  const lowerIsBetter = true;

  for (const [pagePath, page] of Object.entries(current.pages)) {
    const prevPage = previous?.pages?.[pagePath];

    console.log(`\n  ${pagePath}`);
    console.log(`  ${"─".repeat(68)}`);

    // Score
    const scoreDelta = prevPage ? page.score - prevPage.score : null;
    const scoreArrow = scoreDelta === null ? "" : deltaBadge(scoreDelta, false);
    console.log(`  Score:  ${page.score}/100  ${scoreArrow}`);

    // Metrics table
    console.log(`  ${"Metric".padEnd(8)} ${"Current".padStart(10)} ${"Previous".padStart(10)} ${"Delta".padStart(12)}`);

    for (const [key, value] of Object.entries(page.metrics)) {
      const unit = METRIC_UNITS[key] || "";
      const cur = formatMetric(value, unit);
      const prev = prevPage ? formatMetric(prevPage.metrics[key], unit) : "—".padStart(10);
      const delta =
        prevPage != null
          ? deltaBadge(value - prevPage.metrics[key], lowerIsBetter, unit)
          : "";
      console.log(`  ${key.padEnd(8)} ${cur.padStart(10)} ${prev.padStart(10)} ${delta.padStart(12)}`);
    }
  }

  console.log("\n" + "═".repeat(72));

  if (!previous) {
    console.log("  Baseline recorded. Run again after changes to see comparisons.");
  }

  console.log("");
}

function formatMetric(value, unit) {
  if (unit === "ms") return `${value} ms`;
  return `${value}`;
}

function deltaBadge(delta, lowerIsBetter, unit = "") {
  if (delta === 0) return "  =";
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const sign = delta > 0 ? "+" : "";
  const suffix = unit ? ` ${unit}` : "";
  const arrow = lowerIsBetter
    ? improved
      ? `\x1b[32m✓ ${sign}${delta}${suffix}\x1b[0m`
      : `\x1b[31m✗ ${sign}${delta}${suffix}\x1b[0m`
    : improved
      ? `\x1b[32m✓ ${sign}${delta}${suffix}\x1b[0m`
      : `\x1b[31m✗ ${sign}${delta}${suffix}\x1b[0m`;
  return arrow;
}
