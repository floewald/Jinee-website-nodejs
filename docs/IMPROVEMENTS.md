# Improvements & Technical Debt

This document captures findings from a comprehensive technical audit of the portfolio website.
Items are grouped by category and labelled **HIGH / MEDIUM / LOW** priority.

Use this as a living backlog — check off items as they are implemented.

---

## 1. Performance

### 1.1 ~~Missing `sizes` prop on fill images~~ — ✅ **DONE**

`sizes` props added to both `CardSlideshow` and `GalleryGrid` (portrait path) in this batch.

---

### 1.2 ~~`unoptimized: true` in `next.config.ts`~~ — ✅ **DONE**

Explanatory comment added to `next.config.ts` confirming this is intentional for static FTP deployment.

---

## 2. Loading / UX

### 2.1 ~~LQIP (Low Quality Image Placeholder / blur-up)~~ — ✅ **DONE**

Images appear as white/blank space until they finish loading. The **blur-up pattern** (used by
Unsplash, Instagram, Medium) shows a tiny blurred placeholder immediately, then sharpens once the
full image arrives. This is the single most visible UX improvement for visitors on slower connections.

**How it works with our stack:**
`placeholder="blur"` in Next.js is a pure client-side CSS feature — it sets the `blurDataURL` as a
`background-image` while the real image loads. It does **not** use the Next.js image CDN, so it is
fully compatible with `unoptimized: true` (our static FTP deployment).

**What was implemented:**

1. **`scripts/generate-lqip.mjs`** — standalone Node.js script (using `sharp`) that reads every
   `images.json` manifest under `Jinee_website/assets/`, generates an 8×8 px blurred WebP per image,
   base64-encodes it, and writes the result back as a `blur` field on each manifest entry.
   Run once: `node scripts/generate-lqip.mjs`. Re-run whenever new images are added.
2. **`blur` field added** to `ImageManifestItem` and `GalleryImage` interfaces in `gallery-images.ts`.
3. **`SlideshowImage` type** exported from `gallery-images.ts` — replaces the previous `string[]`
   return type of `getProjectSlideshowImages()` so blur data flows into `CardSlideshow`.
4. **`<Image>` components updated** in `GalleryGrid`, `Lightbox`, `CardSlideshow`, and `Slideshow`
   to pass `placeholder="blur" blurDataURL={img.blur}` when `blur` is present.
5. **All 4 callers of `CardSlideshow`** updated to normalise `previewImages` fallback to
   `SlideshowImage[]` (mapping bare `string` paths from `portfolioCard.previewImages` to `{src}`
   objects).

**To activate blur placeholders:**
```bash
npm install --save-dev sharp   # one-time
node scripts/generate-lqip.mjs  # re-run whenever images change
```

---

### 2.2 ~~No preload for next carousel image~~ — ✅ **DONE**

A `useEffect` in `CardSlideshow` now preloads the next image whenever `idx` changes:
```ts
useEffect(() => {
  if (images.length <= 1) return;
  const nextSrc = images[(idx + 1) % images.length].src;
  const img = new window.Image();
  img.src = nextSrc;
}, [idx, images]);
```
Covered by the "preloads the next image when the active slide changes" test in
`src/components/gallery/__tests__/CardSlideshow.test.tsx`.

---

## 3. Code Quality & Maintainability

### 3.1 ~~Remove orphaned `slugFromImage` function~~ — **RETRACTED**

~~`src/app/portfolio/page.tsx` line 19 defines `slugFromImage()` but never calls it.~~

**Update:** On deeper inspection `slugFromImage()` is called at line 129 to construct social-media
`href` values. The initial audit was incorrect. No action needed.

---

### 3.2 ~~Document hardcoded numeric constants~~ — ✅ **DONE**

`MAX_CARDS`, `SLIDESHOW_CYCLE_MS`, and `SLIDESHOW_PRIME_STEP` are now exported from
`src/lib/constants.ts` with explanatory JSDoc comments. `CardSlideshow` imports them
instead of using inline literals. `portfolio/page.tsx` imports `MAX_CARDS` from constants.

---

### 3.3 ~~Code duplication between category pages~~ — ✅ **DONE**

`src/components/portfolio/ProjectCardsGrid.tsx` — a Server Component that accepts
`projects`, `type`, and `fallbackImageHeight`. Both `photography/page.tsx` and
`video/page.tsx` are now thin wrappers (~10 lines each) that load their projects and
pass them to `<ProjectCardsGrid>`.

Covered by 5 unit tests in
`src/components/portfolio/__tests__/ProjectCardsGrid.test.tsx`.

---

### 3.4 ~~Add comment to `next.config.ts` about `unoptimized: true`~~ — ✅ **DONE**

See 1.2 above. Comment added.

---

### 3.5 ~~`getGalleryImages()` fails silently~~ — ✅ **DONE**

`console.warn` added to both `getGalleryImages()` and `getProjectSlideshowImages()` when the
manifest is missing. Covered by tests in `src/lib/__tests__/gallery-images.test.ts`.

---

### 3.6 ~~Sitemap uses a static `lastModified` date~~ — ✅ **DONE**

`src/app/sitemap.ts` now uses `new Date()` so every build reflects the actual deploy date.

---

## 4. Error Handling & Robustness

### 4.1 ~~No custom 404 page~~ — ✅ **DONE**

`src/app/not-found.tsx` created with a branded 404 heading and a "Back to Home" link.
Covered by 2 tests in `src/app/__tests__/not-found.test.tsx`.

---

### 4.2 ~~No React error boundary~~ — ✅ **DONE**

`src/app/error.tsx` created with a branded error page and retry button.
Covered by tests in `src/app/__tests__/error.test.tsx`.

---

## 5. Adding New Projects (DX)

### 5.1 ~~No build-time validation of project manifests~~ — ✅ **DONE**

When a new project is added to a JSON config file but `npm run build:images` has not been run,
the gallery silently renders empty. There is no build step that checks every project slug has
a corresponding `images.json`.

**`scripts/validate-manifests.mjs`** reads all three JSON configs, checks each project with a
`portfolioCard` has a corresponding `Jinee_website/assets/{type}/{slug}/images.json`, and exits 1
with a clear actionable message listing every offender. If the `Jinee_website/assets/` directory
is absent (fresh checkout / CI-only builds) the check is skipped gracefully.

The core logic lives in the testable TypeScript module **`src/lib/validate-manifests.ts`**
(`findMissingManifests()`), covered by 5 unit tests in
`src/lib/__tests__/validate-manifests.test.ts`.

Integrated into `npm run build`:
```json
"build": "npm run build:images && npm run validate:manifests && next build"
```

Run standalone: `npm run validate:manifests`

---

### 5.2 ~~Manual `npm run build:images` step easy to forget~~ — ✅ **DONE**

The workflow for adding images is:

1. Copy images to `Jinee_website/assets-raw/{type}/{slug}/`
2. `npm run build:images` → generates WebP + `images.json`
3. `npm run build` → Next.js static export

`build:images` now runs automatically as the first step of `npm run build` (see 5.1 above).
The manifest validation step that follows ensures the build fails early with a clear message
if images were not processed.

---

### 5.3 ~~No CLI project scaffolding tool~~ — ✅ **DONE**

`scripts/create-project.mjs` interactive CLI added (`npm run create-project`). It:
1. Prompts for type, slug (validated as `/^[a-z0-9-]+$/`), and title
2. Creates `Jinee_website/assets-raw/{type}/{slug}/`
3. Checks for duplicate slugs and appends a typed skeleton entry to the JSON config
4. Prints the next steps

Pure business logic (slug validation, skeleton builders, path helpers) lives in
`src/lib/scaffold-project.ts` and is covered by 14 unit tests in
`src/lib/__tests__/scaffold-project.test.ts`.

---

### 5.4 ~~No JSON schema validation for content config~~ — ✅ **DONE**

`src/lib/portfolio-schemas.ts` defines [Zod](https://zod.dev) schemas (`PhotographyProjectSchema`,
`VideoProjectSchema`, `SocialMediaProjectSchema`) that mirror the TypeScript types in
`src/types/portfolio.ts`. `portfolio-config.ts` calls `validatePortfolioData()` at module load
time — a malformed JSON entry now causes `next build` to fail immediately with a
field-level Zod error instead of a cryptic TypeScript complaint.

Covered by 14 unit tests in `src/lib/__tests__/portfolio-schemas.test.ts` (including
real-JSON smoke tests for all three content files).

---

## 6. CI/CD Workflow

### 6.1 ~~Asset deploy condition fragile~~ — ✅ **DONE**

`.github/workflows/deploy.yml` uses `github.event.head_commit.modified` to decide whether to
re-upload the `assets/` directory:

```yaml
if: |
  contains(github.event.head_commit.modified, 'Jinee_website/assets-raw/') ||
  contains(github.event.head_commit.added, 'Jinee_website/assets-raw/')
```

The job-level `if:` was removed and replaced with a **"Check for asset changes" step** that
runs `git diff --name-only "$BEFORE" "$AFTER"` to detect files changed under
`Jinee_website/assets-raw/`. All subsequent steps in the job carry
`if: steps.asset_changes.outputs.changed == 'true'` so they are skipped when no assets changed.

Edge cases handled:
- **Force-push / first push** (before SHA = `0000…000`): uses `git show --name-only HEAD` instead.
- **workflow_dispatch**: git diff returns no output, so asset steps are skipped (safe default).

The checkout step uses `fetch-depth: 0` so `git diff` works across any push depth.

---

### 6.2 ~~No build output verification~~ — ✅ **DONE**

Build verification step added to `.github/workflows/deploy.yml` (checks `out/` dir and `index.html`).
A Git LFS quota warning step (fires at 90 % of the 1 GB free tier) was also added alongside it.

---

## 6.3 Mobile UX improvements — ✅ **DONE** (batch 1)

- **`sizes` prop** added to `CardSlideshow` and `GalleryGrid` (correct resolution per device, see 1.1 ✅)
- **Swipe left/right** added to `CardSlideshow` via `useSwipe` hook (parity with Lightbox and Slideshow).
  Covered by tests in `src/components/gallery/__tests__/CardSlideshow.test.tsx`.
- **LQIP blur-up** — see item 2.1 (planned for next batch, requires build pipeline changes).

---

## 7. Strengths — What's Already Good

| Area | Details |
|------|---------|
| **Font loading** | Self-hosted `inter-latin.woff2`, `font-display: swap`, preloaded — zero layout shift, GDPR-compliant (no Google Fonts) |
| **TypeScript** | Zero `any` types; comprehensive discriminated union types in `src/types/portfolio.ts`; all data strongly typed |
| **Security — contact form** | CSRF token, honeypot field, input sanitisation (`strip_tags`, header-injection prevention), email validation |
| **Security — download system** | Path-traversal protection (`realpath` + prefix check), per-IP rate limiting, timing-safe password comparison (`hash_equals`), structured request logging |
| **Bundle size** | Only `next`, `react`, `react-dom` as runtime dependencies — minimal JavaScript shipped |
| **Image pipeline** | `build:images` generates responsive WebP thumbnails (`-400`, `-800`, `-1600`) and `images.json` manifests automatically |
| **Slideshow stagger** | `CardSlideshow` offsets each card by `(index * 997) % CYCLE_MS` (prime modulus) so multiple cards never rotate simultaneously — elegant solution |
| **Sitemap** | Dynamically generated from portfolio config, includes all pages, compatible with static export |

---

## 8. Priority Summary

| # | Item | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 3.5 | `getGalleryImages()` silently returns empty on missing manifest | MEDIUM | Small (3 lines) | ✅ Done |
| 4.2 | Add React error boundary (`error.tsx`) | MEDIUM | Small (20 lines) | ✅ Done |
| 6.2 | Build output verification + LFS quota warning in CI | LOW | Small | ✅ Done |
| 1.1 | Add `sizes` prop to fill images | MEDIUM | Small (2 lines) | ✅ Done |
| 1.2 / 3.4 | Comment `unoptimized: true` in `next.config.ts` | LOW | Trivial | ✅ Done |
| 3.6 | Use `new Date()` in sitemap | LOW | Trivial | ✅ Done |
| Mobile | Swipe on CardSlideshow | HIGH UX | Small | ✅ Done |
| 2.1 | LQIP blur-up placeholder | MEDIUM | Medium | 🔄 Next batch |
| 5.1 | Build-time validation that all project slugs have manifests | MEDIUM | Small script | ✅ Done |
| 5.2 | `npm run build:images` easy to skip — hook into prebuild | MEDIUM | 2-line change | ✅ Done |
| 6.1 | Fix fragile asset deploy condition in GitHub Actions | MEDIUM | Medium (YAML rewrite) | ✅ Done |
| 3.2 | Move magic constants to `constants.ts` | LOW | Small | ✅ Done |
| 3.3 | Extract `<ProjectCardsGrid>` component | LOW | Medium | ✅ Done |
| 4.1 | Create custom 404 page | LOW | Small | ✅ Done |
| 2.2 | Preload next carousel image | LOW | Small | ✅ Done |
| 5.3 | CLI project scaffolding tool | LOW | Medium | Open |
| 5.4 | Zod validation for content JSON | LOW | Medium | Open |
