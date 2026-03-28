# Requirements

Requirements document for the Jinee Chen portfolio website.  
Derived from the original audit (`IMPROVEMENTS.md`), migration plan, and the shipped Next.js 16 implementation.

**Status**: All requirements below are **Implemented** unless marked ⏳ Deferred.

---

## System Overview

A **static-export portfolio website** for Jinee Chen, a Singapore-based videographer and photographer. The site presents her project portfolio, enables client contact, and supports password-protected asset downloads — all without a Node.js runtime on the server.

```
Next.js 16 (output: 'export')
├── out/         → FTP to web server root (static HTML/CSS/JS)
└── backend/     → FTP to /backend/  (PHP: contact + download)
```

---

## FR — Functional Requirements

### FR-01 Portfolio display

| ID | Requirement | Status |
|----|-------------|--------|
| FR-01.1 | Display photography, video, and social-media project categories | ✅ |
| FR-01.2 | Each category has an index page listing all projects as cards | ✅ |
| FR-01.3 | Each project has a dedicated page with title, description, OG metadata | ✅ |
| FR-01.4 | Photography projects display a responsive image gallery grid | ✅ |
| FR-01.5 | Video projects display one or more lazy-loaded YouTube embeds | ✅ |
| FR-01.6 | Social-media projects may display a gallery, custom HTML, or both | ✅ |
| FR-01.7 | Portfolio hub page (`/portfolio/`) shows 6 cards per category with "More" CTA | ✅ |

### FR-02 Image gallery & lightbox

| ID | Requirement | Status |
|----|-------------|--------|
| FR-02.1 | Gallery grid is fully responsive (3 → 2 → 1 columns by breakpoint) | ✅ |
| FR-02.2 | Portrait images are detected and displayed with blurred background fill | ✅ |
| FR-02.3 | Clicking any gallery image opens a fullscreen lightbox overlay | ✅ |
| FR-02.4 | Lightbox supports keyboard navigation (← → Esc) and touch swipe | ✅ |
| FR-02.5 | Lightbox renders via React portal to escape CSS stacking contexts | ✅ |
| FR-02.6 | LQIP (Low Quality Image Placeholder) blur-up applied to gallery images | ✅ |

### FR-03 Slideshow

| ID | Requirement | Status |
|----|-------------|--------|
| FR-03.1 | Project pages with `hasGallery: true` / `showSlideshow: true` display an auto-advancing image strip above the gallery | ✅ |
| FR-03.2 | Slideshow supports manual prev/next, dot navigation, and swipe | ✅ |
| FR-03.3 | Portfolio card thumbnails cycle via `CardSlideshow` when `previewImages` is set | ✅ |
| FR-03.4 | Multiple concurrent `CardSlideshow` instances stay out of phase (prime-stagger algorithm) | ✅ |

### FR-04 Contact form

| ID | Requirement | Status |
|----|-------------|--------|
| FR-04.1 | Contact form collects name, email, phone (optional), message, and explicit consent checkbox | ✅ |
| FR-04.2 | Form submits via AJAX — page does not reload | ✅ |
| FR-04.3 | Draft is persisted to `sessionStorage` and restored on page revisit | ✅ |
| FR-04.4 | CSRF token fetched before every submission | ✅ |
| FR-04.5 | Honeypot field (`hp_website`) present but hidden from real users | ✅ |
| FR-04.6 | PHP backend validates, sanitises, and forwards the message via PHPMailer SMTP | ✅ |
| FR-04.7 | Frontend API submits to `NEXT_PUBLIC_BACKEND_URL/contact/contact.php` | ✅ |
| FR-04.8 | Endpoint URL updated in production to `/backend/contact/contact.php` | ⏳ Deferred (requires FTP server) |

### FR-05 Password-protected download

| ID | Requirement | Status |
|----|-------------|--------|
| FR-05.1 | Photography projects with `enableDownload: true` show a download toolbar | ✅ |
| FR-05.2 | Users can select individual images or "select all" | ✅ |
| FR-05.3 | Clicking download opens a modal prompting for a project password | ✅ |
| FR-05.4 | Password is validated server-side with timing-safe comparison | ✅ |
| FR-05.5 | Valid password triggers a ZIP stream download (Safari-safe via blob URL) | ✅ |
| FR-05.6 | Rate limiting applied server-side (file-based counters) | ✅ |
| FR-05.7 | File paths validated with `realpath` + whitelist to prevent path traversal | ✅ |

### FR-06 Navigation & layout

| ID | Requirement | Status |
|----|-------------|--------|
| FR-06.1 | Site header with logo, tagline, and navigation | ✅ |
| FR-06.2 | Desktop navigation includes a "Portfolio" dropdown submenu | ✅ |
| FR-06.3 | Mobile navigation uses a hamburger button with accessible toggle and X animation | ✅ |
| FR-06.4 | Skip-to-content link visible on keyboard focus | ✅ |

### FR-07 Cookie consent

| ID | Requirement | Status |
|----|-------------|--------|
| FR-07.1 | GDPR cookie consent banner displayed on first visit | ✅ |
| FR-07.2 | Consent choice persisted in a `site_consent` cookie; banner not shown again | ✅ |
| FR-07.3 | No analytics or tracking loaded without consent | ✅ |

### FR-08 Static pages

| ID | Requirement | Status |
|----|-------------|--------|
| FR-08.1 | Imprint page at `/imprint/` | ✅ |
| FR-08.2 | Privacy policy page at `/privacy/` | ✅ |
| FR-08.3 | 301 redirects from legacy URLs (`imprint-en.html`, `privacy.html`) | ✅ |
| FR-08.4 | Custom 404 page with branded heading and home link | ✅ |
| FR-08.5 | Error boundary page with retry button | ✅ |

### FR-09 SEO & PWA

| ID | Requirement | Status |
|----|-------------|--------|
| FR-09.1 | Global `<title>` template, `description`, OG tags, Twitter card in root layout | ✅ |
| FR-09.2 | Per-page `generateMetadata()` for all dynamic portfolio pages | ✅ |
| FR-09.3 | JSON-LD: Person schema in root layout | ✅ |
| FR-09.4 | JSON-LD: VideoObject on video project pages, ImageGallery on photography pages | ✅ |
| FR-09.5 | `sitemap.xml` auto-generated at build time (7 static + all project routes) | ✅ |
| FR-09.6 | `lastModified` in sitemap reflects actual build date | ✅ |
| FR-09.7 | `public/manifest.json` for PWA installability | ✅ |
| FR-09.8 | `public/robots.txt` allowing indexing | ✅ |

### FR-10 Content management (DX)

| ID | Requirement | Status |
|----|-------------|--------|
| FR-10.1 | Projects defined in human-readable JSON (`photography.json`, `video.json`, `social-media.json`) | ✅ |
| FR-10.2 | `npm run create-project` scaffolds a new project interactively | ✅ |
| FR-10.3 | `npm run build:images` converts raw images to WebP, generates `images.json` manifests | ✅ |
| FR-10.4 | `npm run validate:manifests` checks every project's manifest exists (fails `npm run build` early if not) | ✅ |
| FR-10.5 | JSON content validated at build time against Zod schemas (field-level errors) | ✅ |
| FR-10.6 | ADDING-PROJECTS.md guide documents the end-to-end workflow | ✅ |

---

## NFR — Non-Functional Requirements

### NFR-01 Performance

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-01.1 | Images served as WebP at three sizes (320 / 800 / 1600 px wide) | ✅ |
| NFR-01.2 | Correct `sizes` prop on all `<Image>` components to avoid over-fetching | ✅ |
| NFR-01.3 | LQIP blur-up eliminates blank image flash on slow connections | ✅ |
| NFR-01.4 | YouTube embeds load lazily via `IntersectionObserver` | ✅ |
| NFR-01.5 | Next image preloads the next carousel slide on advance | ✅ |
| NFR-01.6 | Self-hosted Inter font (`font-display: swap`) — zero layout shift, no Google Fonts | ✅ |
| NFR-01.7 | Static export — no server round-trip for any page | ✅ |

### NFR-02 Accessibility

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-02.1 | Skip-to-content link on keyboard focus | ✅ |
| NFR-02.2 | ARIA roles on modals (lightbox, download modal) | ✅ |
| NFR-02.3 | Keyboard nav: all interactive elements reachable by Tab; Esc closes overlays | ✅ |
| NFR-02.4 | Focus trapped inside open modals | ✅ |
| NFR-02.5 | E2E test coverage for accessibility flows (lightbox keyboard, modal Escape) | ✅ |

### NFR-03 Security

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-03.1 | CSRF tokens (pool of 5, one-time use) on contact and download endpoints | ✅ |
| NFR-03.2 | Honeypot field on contact form to block naive bots | ✅ |
| NFR-03.3 | All user inputs sanitised server-side (`strip_tags`, header-injection prevention) | ✅ |
| NFR-03.4 | Download password compared with `hash_equals` (timing-safe) | ✅ |
| NFR-03.5 | File paths validated with `realpath` + whitelist (prevents path traversal) | ✅ |
| NFR-03.6 | CORS whitelist on PHP backend | ✅ |
| NFR-03.7 | Rate limiting on download endpoint | ✅ |
| NFR-03.8 | Config files (`config.php`, `download_config.php`) excluded from git | ✅ |
| NFR-03.9 | `.htaccess` denies direct access to config, logs, tmp, and rate-limit directories | ✅ |

### NFR-04 Code quality & maintainability

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-04.1 | TypeScript strict mode — zero `any` types in application code | ✅ |
| NFR-04.2 | All project data strongly typed via discriminated union types | ✅ |
| NFR-04.3 | Site-wide constants centralised in `src/lib/constants.ts` | ✅ |
| NFR-04.4 | No duplication in category index pages (`ProjectCardsGrid` component) | ✅ |
| NFR-04.5 | Lint + type-check enforced as pre-commit hooks (Husky + lint-staged) | ✅ |
| NFR-04.6 | ESLint + `next/core-web-vitals` ruleset | ✅ |

### NFR-05 Testing

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-05.1 | Unit tests for all library modules and custom hooks | ✅ |
| NFR-05.2 | Unit tests for all React components (React Testing Library) | ✅ |
| NFR-05.3 | E2E tests covering all user journeys (Playwright, Chromium) | ✅ |
| NFR-05.4 | Test-first (TDD) approach — failing tests written before implementation | ✅ |
| NFR-05.5 | 254 unit tests, 33 suites, all passing; 37 E2E tests | ✅ |
| NFR-05.6 | Pre-commit hook runs Jest `--findRelatedTests` on staged files | ✅ |

### NFR-06 Build & deployment

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-06.1 | `npm run build` is a single command (build:images → validate:manifests → next build) | ✅ |
| NFR-06.2 | Build output verified in CI (checks `out/` exists and `index.html` is present) | ✅ |
| NFR-06.3 | Auto-deploy via GitHub Actions on push to `main` | ✅ |
| NFR-06.4 | Asset re-upload only when `assets-raw/` change detected (git diff) | ✅ |
| NFR-06.5 | Git LFS quota alert fires at 90 % of 1 GB free tier | ✅ |
| NFR-06.6 | PHP backend deployed manually via FTP (separate from static site) | ✅ |
| NFR-06.7 | FTP deployment end-to-end smoke test | ⏳ Deferred (requires live FTP server) |

---

## Out of Scope / Deferred

| ID | Item | Reason |
|----|------|--------|
| FR-04.8 | Frontend API URL updated to `/backend/…` prefix | Requires FTP server + config |
| NFR-06.7 | FTP smoke test | Requires FTP server |
| — | Visual regression testing (Lighthouse, OG debugger) | Requires deployed site |
| — | Contact form + download end-to-end test | Requires SMTP config + FTP |
| — | TinaCMS (Phase 7) | Deferred indefinitely; JSON editing workflow is sufficient |
