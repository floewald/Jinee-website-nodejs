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

### 2.2 No preload for next carousel image — **LOW**

`CardSlideshow` rotates images every 4 000 ms but only loads the current image.
The next image fetches from the network when the interval fires, causing a brief blank frame on
slower connections.

**Recommendation:** When `currentIndex` is updated, call
`new Image().src = images[nextIndex]` in a `useEffect` to prime the browser cache.

---

## 3. Code Quality & Maintainability

### 3.1 ~~Remove orphaned `slugFromImage` function~~ — **RETRACTED**

~~`src/app/portfolio/page.tsx` line 19 defines `slugFromImage()` but never calls it.~~

**Update:** On deeper inspection `slugFromImage()` is called at line 129 to construct social-media
`href` values. The initial audit was incorrect. No action needed.

---

### 3.2 Document hardcoded numeric constants — **LOW**

Several magic numbers live close to where they are used:

| File | Constant | Suggestion |
|------|----------|-----------|
| `src/app/portfolio/page.tsx` line 23 | `MAX_CARDS = 6` | Move to `src/lib/constants.ts` |
| `src/components/gallery/CardSlideshow.tsx` line 16 | `CYCLE_MS = 4000` | Move to `src/lib/constants.ts` |
| `src/lib/gallery-images.ts` line 24–28 | Hardcoded path `Jinee_website/assets/{type}/{slug}` | Already functionally correct; add a comment explaining the path convention |

Moving them to `constants.ts` makes site-wide tuning a one-line change.

---

### 3.3 Code duplication between category pages — **LOW**

`src/app/portfolio/photography/page.tsx` and `src/app/portfolio/video/page.tsx` contain
nearly identical JSX: load cards, load slideshow images, render a `<section>` with
`<CardSlideshow>` per card.

**Recommendation:** Extract a shared `<ProjectCardsGrid>` Server Component that accepts a
`cards` array and a `getImages(slug)` function. Both pages become a thin wrapper that calls
the appropriate data-fetching function.

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

### 4.1 No custom 404 page — **LOW**

When a visitor lands on an unknown URL, Next.js serves its generic 404 page.

**Recommendation:** Create `src/app/not-found.tsx` with the site header, footer, and a branded
message. This is a 20-line file and improves the visitor experience noticeably.

---

### 4.2 ~~No React error boundary~~ — ✅ **DONE**

`src/app/error.tsx` created with a branded error page and retry button.
Covered by tests in `src/app/__tests__/error.test.tsx`.

---

## 5. Adding New Projects (DX)

### 5.1 No build-time validation of project manifests — **MEDIUM**

When a new project is added to a JSON config file but `npm run build:images` has not been run,
the gallery silently renders empty. There is no build step that checks every project slug has
a corresponding `images.json`.

**Recommendation:** Add a validation step to the build script or as a separate
`scripts/validate-manifests.js`:

```js
// Check that every project slug in photography.json / video.json / social-media.json
// has a matching Jinee_website/assets/{type}/{slug}/images.json
```

Run it as part of `npm run build` (prepend it in `package.json`):
```json
"build": "node scripts/validate-manifests.js && next build"
```

---

### 5.2 Manual `npm run build:images` step easy to forget — **MEDIUM**

The workflow for adding images is:

1. Copy images to `Jinee_website/assets-raw/{type}/{slug}/`
2. `npm run build:images` → generates WebP + `images.json`
3. `npm run build` → Next.js static export

Step 2 is easy to skip. The build will succeed but the new images will be absent.

**Recommendation:** Make `build:images` a dependency in `package.json`:
```json
"prebuild": "node scripts/build-images.sh || true"
```

Or document step 2 prominently in `docs/ADDING-PROJECTS.md` (already done, can add a warning
block to reinforce it).

---

### 5.3 No CLI project scaffolding tool — **LOW**

Adding a new project requires manually editing a JSON file for the slug, title, description,
ordering, thumbnail path, etc. Every key must be correct and no schema validation is run.

**Recommendation:** A small Node.js script `npm run create-project` that:
1. Prompts for slug, title, type (photography / video / social-media)
2. Creates the `assets-raw/{type}/{slug}/` directory
3. Appends a skeleton entry to the appropriate JSON config
4. Prints the next steps

This dramatically reduces onboarding friction for new content.

---

### 5.4 No JSON schema validation for content config — **LOW**

Typos in `photography.json`, `video.json`, or `social-media.json` (missing required fields,
wrong types) cause cryptic TypeScript errors at build time rather than helpful messages.

**Recommendation:** Add [Zod](https://zod.dev) schemas that mirror the TypeScript types in
`src/types/portfolio.ts` and validate each JSON file at build time:

```ts
const PhotographyProjectSchema = z.object({ slug: z.string(), ... });
PhotographyProjectSchema.parse(rawJson); // throws with clear message on error
```

---

## 6. CI/CD Workflow

### 6.1 Asset deploy condition fragile — **MEDIUM**

`.github/workflows/deploy.yml` uses `github.event.head_commit.modified` to decide whether to
re-upload the `assets/` directory:

```yaml
if: |
  contains(github.event.head_commit.modified, 'Jinee_website/assets-raw/') ||
  contains(github.event.head_commit.added, 'Jinee_website/assets-raw/')
```

`github.event.head_commit` is `null` on pull requests, manual triggers (`workflow_dispatch`),
and force-pushes, causing the asset deploy job to be silently skipped in those cases.

**Recommendation:** Detect changed files with `git diff` instead:

```yaml
- name: Check for asset changes
  id: asset_changes
  run: |
    CHANGED=$(git diff --name-only ${{ github.event.before }} ${{ github.event.after }} 2>/dev/null || echo "")
    if echo "$CHANGED" | grep -q 'Jinee_website/assets-raw/'; then
      echo "changed=true" >> $GITHUB_OUTPUT
    else
      echo "changed=false" >> $GITHUB_OUTPUT
    fi

- name: Deploy assets
  if: steps.asset_changes.outputs.changed == 'true'
  ...
```

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
| 5.1 | Build-time validation that all project slugs have manifests | MEDIUM | Small script | Open |
| 5.2 | `npm run build:images` easy to skip — hook into prebuild | MEDIUM | 2-line change | Open |
| 6.1 | Fix fragile asset deploy condition in GitHub Actions | MEDIUM | Medium (YAML rewrite) | Open |
| 3.2 | Move magic constants to `constants.ts` | LOW | Small | Open |
| 3.3 | Extract `<ProjectCardsGrid>` component | LOW | Medium | Open |
| 4.1 | Create custom 404 page | LOW | Small | Open |
| 2.2 | Preload next carousel image | LOW | Small | Open |
| 5.3 | CLI project scaffolding tool | LOW | Medium | Open |
| 5.4 | Zod validation for content JSON | LOW | Medium | Open |
