# Software Design

Detailed design reference for the Jinee Chen portfolio website.  
For the system overview see [ARCHITECTURE.md](ARCHITECTURE.md). For requirements see [REQUIREMENTS.md](REQUIREMENTS.md).

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Source (Git)                                                │
│                                                              │
│  src/content/portfolio/*.json  ──► src/lib/portfolio-config.ts │
│  src/app/**                    (Next.js 16 App Router)       │
│  src/components/**             (React 19 Server + Client)    │
│  src/lib/**                    (build-time + pure utils)     │
└───────────────────────┬──────────────────────────────────────┘
                        │  npm run build
                        ▼
              ┌─────────────────┐
              │  out/           │   Static HTML / CSS / JS / images
              │  (38 pages)     │
              └────────┬────────┘
                       │  FTP (GitHub Actions on push to main)
          ┌────────────▼────────────┐
          │  Web server (Apache)    │
          │  /public_html/          │  ← static site
          │  /public_html/backend/  │  ← PHP backend (manual FTP)
          └─────────────────────────┘
```

The PHP backend is deployed separately (not via GitHub Actions) because it contains sensitive config files that are never in git.

---

## 2. Build Pipeline

```
npm run build
   │
   ├── npm run build:images          (scripts/build-images.sh)
   │       └── cwebp / ImageMagick   → public/assets/{type}/{slug}/*.webp
   │           + scripts/generate-manifests.js → images.json per folder
   │           + scripts/generate-lqip.mjs     → blur field in images.json
   │
   ├── npm run validate:manifests    (scripts/validate-manifests.mjs)
   │       └── src/lib/validate-manifests.ts → findMissingManifests()
   │           exits 1 if any project slug has no images.json
   │
   └── next build                    (Next.js 16)
           ├── imports portfolio-config.ts
           │       └── validatePortfolioData() [Zod] → throws on malformed JSON
           ├── generateStaticParams() per [slug] route
           ├── generateMetadata() per page
           ├── renders 38 static pages → out/
           └── sitemap.ts → out/sitemap.xml
```

### Adding a new project (end-to-end steps)

```
npm run create-project         → prompts type/slug/title
                                 creates assets-raw/{type}/{slug}/
                                 appends skeleton to *.json
    │
    ▼
add images to assets-raw/
    │
    ▼
npm run build:images           → WebP + images.json + LQIP blur
    │
    ▼
npm run build                  → validates + exports
    │
    ▼
git push origin main           → GitHub Actions deploys out/ via FTP
```

---

## 3. Module Breakdown

### 3.1 Data / content layer

| Module | Path | Responsibility |
|--------|------|----------------|
| Content JSON | `src/content/portfolio/*.json` | Project metadata (source of truth) |
| TypeScript types | `src/types/portfolio.ts` | Discriminated union types for all project variants |
| Zod schemas | `src/lib/portfolio-schemas.ts` | Runtime schema validation; mirrors TypeScript types |
| Portfolio config | `src/lib/portfolio-config.ts` | Loads + validates JSON at build time; exports typed arrays |
| Gallery images | `src/lib/gallery-images.ts` | Reads `images.json` manifests; returns `GalleryImage[]` |
| Image utils | `src/lib/image-utils.ts` | WebP URL helpers (slug + filename → sized URL) |
| Constants | `src/lib/constants.ts` | `MAX_CARDS`, `SLIDESHOW_CYCLE_MS`, `SLIDESHOW_PRIME_STEP`, `SITE_URL` |
| SEO content | `src/lib/seo-content.ts` | Shared metadata templates for each project type |

### 3.2 Validation / DX scripts

| Script | Path | Responsibility |
|--------|------|----------------|
| Manifest validator | `scripts/validate-manifests.mjs` | Node.js wrapper; imports `validate-manifests.ts` pure logic |
| CLI scaffold | `scripts/create-project.mjs` | Interactive readline CLI; mirrors pure logic in `scaffold-project.ts` |
| Scaffold logic | `src/lib/scaffold-project.ts` | `validateSlug`, `buildSkeletonEntry`, path helpers (Jest-testable) |
| Validate logic | `src/lib/validate-manifests.ts` | `findMissingManifests()` (Jest-testable) |

### 3.3 React components

| Component | Type | Location | Responsibility |
|-----------|------|----------|----------------|
| `Header` | Server | `src/components/layout/` | Logo, tagline, Nav |
| `Navigation` | Client | `src/components/layout/` | Desktop submenu, mobile hamburger |
| `Footer` | Server | `src/components/layout/` | Email, Calendly, legal links |
| `CookieBanner` | Client | `src/components/layout/` | GDPR consent banner |
| `GalleryGrid` | Server | `src/components/gallery/` | Responsive image grid; portrait detection |
| `GalleryWithLightbox` | Client | `src/components/gallery/` | Composes GalleryGrid + useLightbox + Lightbox |
| `GalleryWithDownload` | Client | `src/components/gallery/` | Adds DownloadToolbar + GallerySelection + DownloadModal |
| `GallerySection` | Client | `src/components/sections/` | Slideshow + GalleryWithLightbox (homepage collage) |
| `Lightbox` | Client | `src/components/gallery/` | Portal overlay; keyboard + swipe nav; portrait fill |
| `Slideshow` | Client | `src/components/gallery/` | Full-image auto-advance strip |
| `CardSlideshow` | Client | `src/components/gallery/` | Thumbnail carousel in project cards |
| `VideoPlayer` | Client | `src/components/portfolio/` | Lazy YouTube embed via IntersectionObserver |
| `ProjectCardsGrid` | Server | `src/components/portfolio/` | Category index grid (shared by photography + video) |
| `ContactForm` | Client | `src/components/sections/` | AJAX form with CSRF, honeypot, sessionStorage draft |
| `DownloadModal` | Client | `src/components/gallery/` | Password + CSRF → ZIP download |
| `DownloadToolbar` | Client | `src/components/gallery/` | Select all, count, download button |
| `GallerySelection` | Client | `src/components/gallery/` | Checkbox overlay on GalleryGrid |

### 3.4 Custom hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSwipe` | `src/hooks/useSwipe.ts` | Touch swipe direction. Threshold: 50 px; ignores vertical-dominated. |
| `useLightbox` | `src/hooks/useLightbox.ts` | Open/close/index; keyboard event listener. |
| `useIntersection` | `src/hooks/useIntersection.ts` | `IntersectionObserver` wrapper. `once` mode for lazy loads. |
| `useMediaQuery` | `src/hooks/useMediaQuery.ts` | SSR-safe boolean for a media query string. |

---

## 4. Data Model

### 4.1 TypeScript types (`src/types/portfolio.ts`)

```ts
type ProjectType = 'photography' | 'video' | 'social-media';

interface BaseProject {
  type: ProjectType;
  slug: string;
  title: string;
  description: string;
  canonicalPath: string;
  heading: string;
  ogImage: string;
  visible?: boolean;
  portfolioCard?: PortfolioCard;
}

interface PortfolioCard {
  cardTitle: string;
  thumbnail: string;
  order?: number;
  previewImages?: string[];
}

// Discriminated union
type PortfolioProject =
  | PhotographyProject   // + enableDownload, imageCount, showSlideshow?
  | VideoProject         // + videos[], longDescription?
  | SocialMediaProject;  // + hasGallery, customContent?
```

### 4.2 Zod schemas (`src/lib/portfolio-schemas.ts`)

Mirrors the TypeScript types. Validates at module-load time inside `portfolio-config.ts`.

```
PortfolioCardSchema     → cardTitle (string), thumbnail (string), order? (number), previewImages? (string[])
PhotographyProjectSchema → BaseProjectSchema + enableDownload (boolean), imageCount (number), showSlideshow? (boolean)
VideoProjectSchema       → BaseProjectSchema + videos (array), longDescription? (string)
SocialMediaProjectSchema → BaseProjectSchema + hasGallery (boolean), customContent? (string)
```

`validatePortfolioData(type, data[])` selects the correct schema by `ProjectType` and calls `z.array(Schema).parse(data)` — throwing a `ZodError` with per-field messages on failure.

### 4.3 Image manifests (`images.json`)

Generated by `scripts/build-images.sh` + `scripts/generate-lqip.mjs`.

```ts
interface ImageManifestItem {
  src: string;      // "/assets/photography/{slug}/{name}-800.webp"
  alt: string;      // Derived from filename
  blur?: string;    // Base64 data URI of 8×8 px WebP placeholder
}
```

---

## 5. Key Algorithms

### 5.1 CardSlideshow prime-stagger

Multiple `CardSlideshow` instances run in the same React tree. A naive 3-bucket approach causes cards to flip in visible groups. The solution uses a module-level counter:

```
offset = (instanceCounter++ × SLIDESHOW_PRIME_STEP) mod SLIDESHOW_CYCLE_MS
       = (instanceCounter++ × 997) mod 4000  ms
```

Because `gcd(997, 4000) = 1`, there are exactly **4000 unique offsets** before any wrap-around. No two adjacent cards share a phase.

### 5.2 Portrait image detection

Used in `GalleryGrid`, `Lightbox`, and `CardSlideshow`. All three follow the same pattern:
1. Attach an `onLoad` callback to `<Image>`
2. Read `naturalHeight` and `naturalWidth` from the event target
3. If `naturalHeight > naturalWidth` → set `isPortrait` state → switch CSS class

In `Lightbox`, a second blurred `<Image>` element fills the background via `className="lightbox__portrait-bg"`.

### 5.3 LQIP blur-up

`scripts/generate-lqip.mjs` (using `sharp`):
1. Reads each `images.json` manifest under `Jinee_website/assets/`
2. For each image: loads the source WebP, resizes to 8×8 px, outputs as WebP, base64-encodes
3. Writes result back as a `blur` field in the manifest entry

At render time: `<Image placeholder="blur" blurDataURL={img.blur} />` — Next.js applies the data URI as a CSS `background-image` during load, then the full image fades in.

### 5.4 Download flow

```
1. User selects images (GallerySelection)
2. Clicks Download (DownloadToolbar)  → opens DownloadModal
3. DownloadModal fetches CSRF token   GET /backend/contact/csrf-token.php
4. User enters password + submits
5. DownloadModal POSTs validate_only=1 → server checks password only
6. On success: POST with files[]     → server streams ZIP
7. Blob URL created → <a> programmatically clicked → download starts
   (Safari: pre-built archive path served instead of stream)
```

---

## 6. Component Cascade (Page-Level)

### Homepage (`src/app/page.tsx`)
```
RootLayout
└── page.tsx
    ├── GallerySection       [Client]  — 3×3 collage + GalleryWithLightbox
    ├── FeaturedSection      [Server]  — 6 project cards (CardSlideshow) + IG previews
    ├── AboutSection         [Server]  — avatar + bilingual bio
    └── ContactSection       [Server]  — info + ContactForm [Client]
```

### Photography project page (`portfolio/photography/[slug]/page.tsx`)
```
page.tsx  [Server]
├── Slideshow                [Client]  (if showSlideshow !== false)
├── GalleryWithLightbox      [Client]  (if !enableDownload)
│   ├── GalleryGrid          [Server]
│   └── Lightbox             [Client, portal]
└── GalleryWithDownload      [Client]  (if enableDownload)
    ├── DownloadToolbar      [Client]
    ├── GallerySelection     [Client]
    │   └── GalleryGrid      [Server]
    ├── Lightbox             [Client, portal]
    └── DownloadModal        [Client]
```

### Video project page (`portfolio/video/[slug]/page.tsx`)
```
page.tsx  [Server]
└── VideoPlayer[]            [Client]  — one per video; lazy via IntersectionObserver
```

---

## 7. Security Design

### 7.1 Contact form

| Control | Implementation |
|---------|---------------|
| CSRF | Token pool of 5 (PHP session); one-time use; fetched before every submit |
| Honeypot | `hp_website` hidden input; server rejects if non-empty |
| Input sanitisation | `strip_tags()` on all text fields; email regex; header-injection strip on recipient address |
| Rate limiting | Not applied to contact (CSRF + honeypot sufficient for contact volumes) |

### 7.2 Download system

| Control | Implementation |
|---------|---------------|
| CSRF | Same pool as contact |
| Password | `hash_equals()` timing-safe comparison; stored in `download_config.php` (not in git) |
| Path traversal | `realpath()` + allowlist check; any path outside `public/assets/{slug}/` is rejected |
| Rate limiting | File-based counters in `download/rate-limit/`; configurable in `download_config.php` |
| CORS | Allowlist in all PHP files; only trusted origins accepted |
| Config files | `.htaccess` denies direct HTTP access to `config.php`, `download_config.php`, `logs/`, `rate-limit/`, `tmp/` |

### 7.3 Static site

- No user-supplied data is executed server-side (pure static HTML)
- No secrets in the Next.js bundle (env vars prefixed `NEXT_PUBLIC_` are public by design; backend URL is not sensitive)
- `robots.txt` does not expose sensitive paths (no admin, no config dirs)

---

## 8. Testing Strategy

### 8.1 Unit tests (Jest + React Testing Library)

| Test target | Location | Count |
|-------------|----------|-------|
| Library modules (`gallery-images`, `portfolio-config`, `image-utils`, etc.) | `src/lib/__tests__/` | ~70 tests |
| Custom hooks | `src/hooks/__tests__/` | ~21 tests |
| React components | `src/components/**/__tests__/` | ~120 tests |
| DX scripts (manifest validator, scaffold logic, portfolio schemas) | `src/lib/__tests__/` | ~33 tests |
| App pages (not-found, error, sitemap) | `src/app/__tests__/` | ~10 tests |

**Total: 254 unit tests, 33 suites**

Approach: test-first (TDD) — failing test written before every module. Each test file
co-located with the implementation via `__tests__/` sibling directories.

### 8.2 E2E tests (Playwright, Chromium)

| Suite | File | Tests |
|-------|------|-------|
| Homepage | `e2e/homepage.spec.ts` | 9 |
| Contact form | `e2e/contact-form.spec.ts` | 6 |
| Portfolio navigation | `e2e/portfolio-navigation.spec.ts` | 7 |
| Lightbox | `e2e/lightbox.spec.ts` | 7 |
| Download modal | `e2e/download-modal.spec.ts` | 8 |

**Total: 37 E2E tests**

### 8.3 Pre-commit hook (Husky + lint-staged)

1. `eslint --fix` on staged JS/TS files
2. `jest --findRelatedTests` on staged files — only runs tests for changed files; fast feedback

### 8.4 CI (GitHub Actions)

```
npm ci
npm run lint
npm run type-check
npx jest --ci --no-coverage
npm run build          # also runs validate:manifests
```

Build output check: verifies `out/` directory and `out/index.html` exist.

---

## 9. Deployment Design

### 9.1 GitHub Actions workflow (`.github/workflows/deploy.yml`)

```
trigger: push to main  (or workflow_dispatch)
    │
    ├── build job:
    │       npm ci + npm run build → out/
    │       upload out/ as artifact
    │
    ├── deploy-site job (after build):
    │       download artifact
    │       FTP-sync out/ → server root
    │       verify out/index.html exists
    │
    └── deploy-assets job (conditional):
            runs only if assets-raw/ changed in the push
            (detected via git diff $BEFORE..$AFTER)
            FTP-sync public/assets/ → server assets/
```

### 9.2 Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | `.env.local` / GitHub Secret | Base URL for PHP backend API calls |
| `FTP_SERVER` | GitHub Secret | FTP hostname |
| `FTP_USERNAME` | GitHub Secret | FTP user |
| `FTP_PASSWORD` | GitHub Secret | FTP password |
| `FTP_SERVER_DIR` | GitHub Secret | Remote deploy path |

### 9.3 Directory layout on server

```
/public_html/
├── index.html          ← Next.js static export (out/)
├── *.html
├── _next/              ← JS/CSS chunks
├── assets/             ← WebP images (Jinee_website/assets/ synced separately)
├── manifest.json
├── robots.txt
├── sitemap.xml
└── backend/
    ├── contact/
    │   ├── config.php          ← NOT in git (manual FTP)
    │   ├── contact.php
    │   ├── csrf-token.php
    │   └── csrf-validate.php
    └── download/
        ├── download_config.php ← NOT in git (manual FTP)
        ├── download.php
        └── projects.php
```
