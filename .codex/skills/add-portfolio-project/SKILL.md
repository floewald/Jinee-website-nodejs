---
name: add-portfolio-project
description: Use when adding or updating a photography, video, or social-media portfolio project in this repo, especially when starting from a GitHub issue, YouTube link, or raw asset folder. Follow the local scaffold, thumbnail, image-build, and validation workflow instead of inventing a new one.
---

# Add Portfolio Project

Use this skill when the task is to add a new portfolio project or finish a scaffolded one.

## Workflow

1. Read the source brief first.
   Extract project type, display title, slug hints, role, location, media links, and whether new raw images are needed.

2. Choose the slug before editing content.
   Use lowercase hyphenated words. If the natural name is only one broad word, add a second descriptive word.

3. Start with the local scaffold.

```bash
npm run create-project -- --type <photography|video|social-media> --slug <slug> --title "<title>"
```

For video projects, include the YouTube URL or ID:

```bash
npm run create-project -- --type video --slug <slug> --title "<title>" --youtube "<url-or-id>"
```

4. Use the existing thumbnail tool through the repo wrapper.
   `npm run create-project` already calls `npm run download:youtube-thumbnail` for video projects when `--youtube` is provided.

   The wrapper uses the sibling `../yt-thumb-down` repo by default.
   If the downloader lives elsewhere, set `YT_THUMB_DOWN_PATH`.

5. Fill the generated content entry.
   Main files:
   - `src/content/portfolio/photography.json`
   - `src/content/portfolio/videography.json`
   - `src/content/portfolio/social-media.json`

   Keep `portfolioCard.thumbnail` and `ogImage` aligned with the first generated `-800.webp` image.
   For video projects, use the source upload timestamp when available instead of today’s date.

6. Build images when raw assets changed.

```bash
npm run build:images
```

7. Validate the final result with the real production path.

```bash
npm run build
```

## Tooling Notes

- Human-facing workflow guide: `docs/ADDING-PROJECTS.md`
- Project scaffold: `scripts/create-project.mjs`
- YouTube thumbnail wrapper: `scripts/download-youtube-thumbnail.mjs`
- Existing downloader used by the wrapper: sibling `yt-thumb-down` repo
- Image pipeline: `scripts/build-images.mjs`

## Guardrails

- Do not create duplicate slugs.
- Prefer updating an existing entry when the project already exists.
- For video projects, keep the first raw thumbnail named `<slug>-1.jpg` or `<slug>-1.png` so the generated paths stay predictable.
- After scaffolding, replace placeholders instead of leaving generic copy behind.
