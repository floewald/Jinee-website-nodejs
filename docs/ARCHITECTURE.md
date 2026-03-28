# Architecture

Technical deep-dive into the Jinee Chen portfolio website. For local setup see [DEVELOPMENT.md](DEVELOPMENT.md). For deployment see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Overview

The site is a **static Next.js 16 application** — pages are rendered to pure HTML at build time (`output: 'export'`) and deployed via FTP. A separate PHP backend handles the two server-side features (contact form and download system).

```
Content JSON files
       │
       ▼
generateStaticParams()   ←── src/content/portfolio/*.json
       │
       ▼
Next.js build (SSG)
       │
       ▼
out/  (static HTML/CSS/JS)    backend/ (PHP)
       │                           │
       └──────────── FTP ──────────┘
                       │
                  Server document root
```

---

## Data Flow

### Portfolio pages

1. `src/content/portfolio/photography.json` (and video, social-media variants) hold all project metadata
2. `src/lib/portfolio-config.ts` reads and validates these JSON files, exports typed arrays
3. `src/app/portfolio/[category]/[slug]/page.tsx` calls `generateStaticParams()` which returns all slugs from the config → Next.js pre-renders one HTML file per project
4. Each page component receives the matching project config as a prop (via `params`)
5. At build time: `next build` → all pages rendered → `out/` directory

### Image pipeline

```
assets-raw/
  photography/my-project/IMG_001.jpg   (original, high-res)
       │
       ▼ scripts/generate-webp.sh (cwebp or ImageMagick, quality 85)
       │
public/assets/
  photography/my-project/
    IMG_001-320.webp     (thumbnail, 320px wide)
    IMG_001-800.webp     (medium, 800px wide)
    IMG_001-1600.webp    (large, 1600px wide — lightbox)
```

The `scripts/generate-manifests.js` script scans `public/assets/` and writes `images.json` per project folder. React components read these manifests to render gallery grids.

### Contact form flow

```
Browser (ContactForm component)
  │  1. GET /backend/contact/csrf-token.php  → { token }
  │  2. POST /backend/contact/contact.php
  │       FormData: firstName, lastName, email, phone,
  │                 message, consent, consent_ts, hp_website, csrf_token
  ▼
PHP (backend/contact/contact.php)
  ├─ Validates CSRF token (pool of 5, one-time use)
  ├─ Checks honeypot (hp_website must be empty)
  ├─ Validates + sanitises all inputs
  ├─ Sends email via PHPMailer SMTP
  └─ Returns JSON: { success: true } or { error: "..." }
```

### Download flow

```
Browser (DownloadModal component)
  │  1. GET /backend/contact/csrf-token.php  → { token }
  │  2. POST /backend/download/download.php  (validate_only=1)
  │       body: { project, password, csrf_token }
  │  3. POST /backend/download/download.php
  │       body: { project, password, files[], csrf_token }
  │       response: ZIP stream (or Safari blob path)
  ▼
PHP (backend/download/download.php)
  ├─ CORS whitelist check
  ├─ Rate limiting (file-based counters in rate-limit/)
  ├─ Password validation (timing-safe comparison)
  ├─ File path validation (realpath + whitelist)
  └─ Serves ZIP stream or pre-built archive
```

---

## Component Hierarchy

```
RootLayout (src/app/layout.tsx)
├─ SkipLink               — accessibility skip-to-content
├─ CookieBanner           — GDPR consent banner
├─ Header
│   ├─ Logo
│   └─ Navigation
│       └─ NavSubmenu     — Portfolio dropdown
├─ {children}             — page content
└─ Footer

Homepage (src/app/page.tsx)
├─ GallerySection         — 3×3 travel collage + GalleryWithLightbox
│   ├─ GalleryGrid        — portrait images span 2 grid rows with blurred bg fill
│   └─ Lightbox           — keyboard/swipe nav (Esc/←/→); createPortal to document.body
├─ FeaturedSection        — video project cards (with CardSlideshow) + IG previews
│   └─ CardSlideshow      — auto-cycles previewImages; staggered by prime offset (see below)
├─ AboutSection           — avatar, bilingual bio
└─ ContactSection
    └─ ContactForm        — AJAX, CSRF, sessionStorage drafts

Photography project page (src/app/portfolio/photography/[slug]/page.tsx)
├─ [optional Slideshow]   — full-image auto-advance strip; controlled by `showSlideshow` in JSON
│                            (default: true; set `showSlideshow: false` in photography.json to disable)
├─ GalleryWithLightbox    — standard gallery (if enableDownload: false)
│   ├─ GalleryGrid
│   └─ Lightbox
└─ GalleryWithDownload    — gallery + download (if enableDownload: true)
    ├─ DownloadToolbar    — select-all, clear, download button
    ├─ GallerySelection   — GalleryGrid with checkbox overlay
    ├─ Lightbox
    └─ DownloadModal      — password input, CSRF, ZIP download

Photography / Video category index pages (src/app/portfolio/{photography,video}/page.tsx)
└─ CardSlideshow          — cycling thumbnail when portfolioCard.previewImages is set

Video project page (src/app/portfolio/video/[slug]/page.tsx)
└─ VideoPlayer[]          — lazy-loaded YouTube embeds via IntersectionObserver

Social media project page (src/app/portfolio/social-media/[slug]/page.tsx)
├─ GalleryWithLightbox (optional) — hasGallery flag in config
└─ CustomContent (optional) — raw HTML from config
```

---

## Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSwipe` | `src/hooks/useSwipe.ts` | Detects touch swipe direction (left/right). Threshold: 50px, ignores vertical-dominated swipes. |
| `useLightbox` | `src/hooks/useLightbox.ts` | Manages lightbox open/close/index state. Handles keyboard events (arrows, Escape). |
| `useIntersection` | `src/hooks/useIntersection.ts` | Wraps `IntersectionObserver`. Used for lazy-loading YouTube embeds and image preloading. |
| `useMediaQuery` | `src/hooks/useMediaQuery.ts` | Returns `boolean` for a media query string. Used for mobile-vs-desktop nav behaviour. |

---

## CardSlideshow — stagger algorithm

`src/components/gallery/CardSlideshow.tsx` uses a **prime-step module-level counter** to ensure all visible cards cycle independently:

```
offset = (instanceCounter++ × 997) mod 4000  ms
```

- Cycle length: **4000 ms** per image
- Step: **997 ms** — prime, so `gcd(997, 4000) = 1`
- Result: 4000 unique phase offsets before any wrap-around; no two cards share a phase

Why this matters: a naive 3-bucket scheme (0 / 1333 / 2667 ms) caused every 4th card to be in-phase with card 0, so groups of cards visibly flipped together. The prime step eliminates this entirely.

Portrait images inside a slide are detected via `onLoad` measuring `naturalHeight > naturalWidth`. When detected, the slide switches to `object-fit: contain` and a CSS `::before` pseudo-element blurs the same image as a background fill — matching the lightbox portrait treatment.

---

## Lightbox — portal & portrait handling

`src/components/gallery/Lightbox.tsx` renders via `createPortal(…, document.body)` to escape any CSS `transform` stacking context (e.g. from `.section-bg-white { transform: translateX(-50%) }`).

Portrait images (detected from `naturalHeight > naturalWidth` via an `onLoad` callback) always display inside a `3/2` (landscape) frame:

- `object-fit: contain` shows the full portrait image
- A second `<Image>` element with `className="lightbox__portrait-bg"` fills the remaining space with a blurred version of the same image
- Zoom (`zoomedIndex === currentIndex` derived state) works the same for both orientations

---

## TypeScript Types

Defined in `src/types/portfolio.ts`:

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

interface PhotographyProject extends BaseProject {
  type: 'photography';
  enableDownload: boolean;
  downloadPassword?: string;
  imageCount: number;
}

interface VideoProject extends BaseProject {
  type: 'video';
  longDescription?: string;
  videos: VideoItem[];
}

interface SocialMediaProject extends BaseProject {
  type: 'social-media';
  hasGallery: boolean;
  imageCount?: number;
  customContent?: string;
}

interface VideoItem {
  title: string;
  embedUrl: string;
  uploadDate: string; // ISO8601
}

interface PortfolioCard {
  cardTitle: string;
  thumbnail: string;
  order: number;
}

interface ImageManifestItem {
  basename: string;
  thumb: string | null;  // basename-320.webp
  md: string | null;     // basename-800.webp
  lg: string | null;     // basename-1600.webp
  original: string | null;
}
```

---

## Tailwind Design Token Mapping

The original site uses CSS custom properties. These are mapped to Tailwind config keys:

| CSS variable | Tailwind config | Value |
|---|---|---|
| `--charcoal` | `colors.charcoal` | `#2c2c2c` |
| `--bg-color` | `colors.site.bg` | `#ffffff` |
| `--text-color` | `colors.site.text` | `#1a1a1a` |
| `--muted-text` | `colors.site.muted` | `#888888` |
| `--border-color` | `colors.site.border` | `#e0e0e0` |
| `--max-width` | `maxWidth.site` | `1200px` |
| `--spacing` | `spacing.site` | `1.5rem` |
| `--collage-gutter` | `spacing.collage-gutter` | `24px` |
| `--collage-row-height` | (component level) | `260px` |

Breakpoints (match original media queries exactly):

| Name | Value |
|------|-------|
| `sm` | `480px` |
| `md` | `600px` |
| `nav` | `800px` ← key breakpoint: mobile vs desktop nav + layout |
| `lg` | `900px` |
| `xl` | `1200px` |

---

## PHP Backend Endpoints

All endpoints live in `backend/` at the `jineechen.com` document root.

| URL | Method | Purpose | Auth |
|-----|--------|---------|------|
| `/backend/contact/csrf-token.php` | GET | Generate or return pooled CSRF token | None (session-based) |
| `/backend/contact/contact.php` | POST | Submit contact form | CSRF token + honeypot |
| `/backend/download/projects.php` | GET | List visible download projects | None |
| `/backend/download/download.php` | POST | Validate password / serve ZIP | CSRF token + project password |
| `/backend/manifest.php` | POST | Get image manifest for a project | Rate-limited per IP |

CORS whitelist (configured in each PHP file): `127.0.0.1`, `localhost`, `https://jineechen.com`, `https://www.jineechen.com`.

---

## Security Model (PHP-side)

| Threat | Mitigation | File |
|--------|-----------|------|
| CSRF | Token pool (5 tokens), one-time use, `hash_equals` | `csrf-token.php`, `csrf-validate.php` |
| Spam bots | Honeypot field (`hp_website`, visually hidden) | `contact.php` |
| Brute-force download | Rate limiting: 4 wrong passwords per 10 min per project → 24h IP ban | `download.php` + `rate-limit/` |
| Path traversal | `realpath()` + whitelist check before serving files | `download.php` |
| Header injection | Strip `\r\n` from all email header fields | `contact.php` |
| Input validation | `strip_tags()`, `htmlspecialchars()`, max-length checks | `contact.php` |
| Email delivery | PHPMailer SMTP with configurable fallback to `mail()` | `contact.php` |

---

## Static Export Details

`next.config.ts` sets `output: 'export'`. What this means:

- `next build` outputs `out/` — pure HTML, CSS, JS, no Node.js runtime needed
- `images: { unoptimized: true }` — no Image Optimization API (`<img>` tags, not Next.js server-side transforms)
- `trailingSlash: true` — `/portfolio/photography/` generates `out/portfolio/photography/index.html`, consistent with original URL structure
- Dynamic routes (`[slug]`) are pre-rendered for all slugs returned by `generateStaticParams()` — no fallback routes
- Server Actions, Route Handlers, and Middleware are **not** available in static export mode — the PHP backend handles all server-side logic
