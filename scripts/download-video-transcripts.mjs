#!/usr/bin/env node
/** Collect source captions and publish dates for editorial review, never at build time. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "research", "video-transcripts");
const LANGUAGES = ["en", "zh-Hans", "zh-Hant", "zh", "zh-TW", "zh-CN"];

export function getVideoId(value) {
  try {
    const url = new URL(value);
    if (!["youtube.com", "youtube-nocookie.com"].includes(url.hostname.replace(/^www\./, ""))) return null;
    return url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})\/?$/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function parsePublishDate(html) {
  const value = html.match(/"publishDate":"([^"]+)"/)?.[1];
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const date = new Date(value);
  const day = value.slice(0, 10);
  if (!Number.isFinite(date.getTime()) || new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) return null;
  return value;
}

export function validateTranscript(data, id) {
  return data?.video_id === id && Array.isArray(data.segments) && data.segments.length > 0 &&
    data.segment_count === data.segments.length && data.segments.every((segment) =>
      segment !== null && typeof segment === "object" &&
      Number.isFinite(segment.start) && segment.start >= 0 &&
      Number.isFinite(segment.duration) && segment.duration >= 0 &&
      typeof segment.text === "string" && segment.text.trim().length > 0);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function saveJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  let slug;
  let force = false;
  let metadataOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--help") {
      console.log("Usage: npm run download:video-transcripts -- [--slug <project-slug>] [--force] [--metadata-only]\nUses ../yt-transcript/.venv/bin/yt-transcript; override with YT_TRANSCRIPT_PATH.");
      return;
    }
    if (args[i] === "--force") force = true;
    else if (args[i] === "--metadata-only") metadataOnly = true;
    else if (args[i] === "--slug" && /^[a-z0-9-]+$/.test(args[i + 1] ?? "")) slug = args[++i];
    else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  const projects = readJson(path.join(ROOT, "src/content/portfolio/videography.json"));
  if (!Array.isArray(projects)) throw new Error("The videography manifest is missing or invalid.");
  if (slug && !projects.some((project) => project.slug === slug)) throw new Error(`Unknown project: ${slug}`);
  const toolPath = path.resolve(process.env.YT_TRANSCRIPT_PATH || path.join(ROOT, "..", "yt-transcript"));
  const cli = path.join(toolPath, ".venv", "bin", "yt-transcript");
  if (!fs.existsSync(cli)) throw new Error(`Transcriber not installed at ${cli}. Follow the sibling README to install it.`);
  const indexFile = path.join(OUT, "index.json");
  const previous = readJson(indexFile)?.videos ?? [];
  const entries = [];
  let failures = 0;
  let requestsBlocked = false;
  for (const project of projects) {
    for (const video of project.videos) {
      const sourceUrl = video.embedUrl || video.linkUrl;
      const old = previous.find((entry) => entry.slug === project.slug && entry.sourceUrl === sourceUrl);
      if (slug && project.slug !== slug) {
        if (old) entries.push(old);
        continue;
      }
      const id = getVideoId(video.embedUrl);
      const entry = { slug: project.slug, title: video.title, sourceUrl, videoId: id };
      if (!id) {
        entries.push({ ...entry, status: "external-platform", reason: "The YouTube transcriber cannot retrieve mewatch captions." });
        continue;
      }
      const file = path.join(OUT, id, "transcript.json");
      const metadataFile = path.join(OUT, id, "metadata.json");
      let metadata = readJson(metadataFile);
      if (typeof metadata?.description !== "string" || force) {
        try {
          const watchUrl = `https://www.youtube.com/watch?v=${id}`;
          const response = await fetch(watchUrl, { signal: AbortSignal.timeout(15000) });
          if (!response.ok) throw new Error(`YouTube HTTP ${response.status}`);
          const html = await response.text();
          const publishDate = parsePublishDate(html);
          const rawDescription = html.match(/"shortDescription":("(?:\\.|[^"\\])*")/)?.[1];
          const description = rawDescription ? JSON.parse(rawDescription) : undefined;
          if (publishDate) {
            metadata = { videoId: id, sourceUrl: watchUrl, publishDate, description, retrievedAt: new Date().toISOString() };
            saveJson(metadataFile, metadata);
          } else entry.metadataError = "YouTube did not expose a verifiable publish timestamp.";
        } catch (error) { entry.metadataError = error.message; }
      }
      if (metadata?.publishDate) entry.publishDate = metadata.publishDate;
      let data = readJson(file);
      let result;
      if (!metadataOnly && !requestsBlocked && (force || (!validateTranscript(data, id) && old?.status !== "captions-disabled"))) {
        // Keep the batch modest; stop caption requests on a provider IP block.
        await new Promise((resolve) => setTimeout(resolve, 1500));
        result = spawnSync(cli, [id, "--out", OUT, ...LANGUAGES.flatMap((language) => ["--lang", language])], {
          encoding: "utf8", timeout: 45000, maxBuffer: 1024 * 1024,
        });
        data = readJson(file);
      }
      // A failed refresh must not be labelled as a fresh successful download.
      if ((!result || result.status === 0) && validateTranscript(data, id)) {
        entries.push({ ...entry, status: "available", segmentCount: data.segment_count,
          transcript: `${id}/transcript.json`, retrievedAt: result ? new Date().toISOString() : (old?.retrievedAt ?? fs.statSync(file).mtime.toISOString()) });
        console.log(`${project.slug}: ${id} — ${data.segment_count} caption segments`);
      } else {
        const error = result?.error?.message || result?.stderr || old?.reason || (requestsBlocked ? "YouTube blocked caption requests; remaining downloads deferred." : "Captions not requested.");
        if (/blocking requests from your IP|IP has been blocked/.test(error)) requestsBlocked = true;
        const status = /Subtitles are disabled/.test(error) ? "captions-disabled"
          : requestsBlocked ? "request-blocked" : old?.status ?? "unavailable";
        entries.push({ ...entry, status, checkedAt: result ? new Date().toISOString() : old?.checkedAt, reason: error.trim().slice(0, 1800) });
        if (!metadataOnly && ["unavailable", "request-blocked"].includes(status)) failures++;
        console.log(`${project.slug}: ${id} — ${status}`);
      }
      if (entry.metadataError) failures++;
      saveJson(indexFile, { preferredLanguages: LANGUAGES, videos: [...entries,
        ...previous.filter((item) => !entries.some((next) => next.sourceUrl === item.sourceUrl && next.slug === item.slug))] });
    }
  }
  saveJson(indexFile, { preferredLanguages: LANGUAGES, videos: entries });
  console.log(`Recorded ${entries.length} videos in research/video-transcripts/index.json.`);
  if (failures) {
    console.error(`${failures} downloads failed; inspect index.json and rerun to retry. Caption-disabled and external videos are expected omissions.`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
