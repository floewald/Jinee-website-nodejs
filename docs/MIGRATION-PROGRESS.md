# Migration Progress

Live tracker for the migration from the original hand-crafted HTML site (`Jinee_website/`) to Next.js 16.

**Started**: 2026-03-26  
**Target**: Feature parity with original site, deployable via FTP as static export

For the full migration plan see the plan in `/memories/session/plan.md` and the [ARCHITECTURE.md](ARCHITECTURE.md) reference.

---

## Phase 0 — Documentation & Testing Foundation

- [x] 0.1 `README.md` created
- [x] 0.1 `docs/ARCHITECTURE.md` created
- [x] 0.1 `docs/DEVELOPMENT.md` created
- [x] 0.1 `docs/DEPLOYMENT.md` created
- [x] 0.2 `docs/ADDING-PROJECTS.md` created
- [x] 0.3 Jest + React Testing Library installed and configured
- [x] 0.3 `jest.config.ts`, `jest.setup.ts`, `src/__mocks__/fileMock.ts` created
- [x] 0.3 Playwright installed and configured (`playwright.config.ts`)
- [x] 0.3 Husky + lint-staged pre-commit hooks configured (eslint --fix + jest --findRelatedTests)
- [x] 0.4 `docs/MIGRATION-PROGRESS.md` created (this file)

---

## Phase 1 — Project Scaffolding

- [x] 1.1 Next.js 16 initialized (`create-next-app` — TS, Tailwind, App Router, src dir)
- [x] 1.1 `next.config.ts`: `output: 'export'`, `images.unoptimized`, `trailingSlash: true`
- [x] 1.2 Tailwind v4 design tokens from original CSS variables (colors, breakpoints, spacing, fonts)
- [x] 1.2 Inter font loaded via `next/font/local` (300–600 weight range, latin + latin-ext)
- [x] 1.3 `public/assets/` symlinked → `Jinee_website/assets/` (dev); copy for production
- [x] 1.3 `manifest.json` copied to `public/`
- [x] 1.3 `robots.txt` copied to `public/`
- [x] 1.4 `src/content/portfolio/photography.json` — 9 projects
- [x] 1.4 `src/content/portfolio/video.json` — 15 projects (added `social-media-addiction`, updated card orders to match legacy)
- [x] 1.4 `src/content/portfolio/social-media.json` — 3 projects
- [x] 1.4 `src/content/portfolio/index-config.json` — IG links + video section title
- [x] 1.4 `src/types/portfolio.ts` TypeScript types (with `PortfolioProject`, `PortfolioIndexConfig`)
- [x] 1.4 `src/lib/portfolio-config.ts` config loader with typed helpers
- [x] 1.4 `src/lib/image-utils.ts` WebP URL helpers
- [x] 1.4 `src/lib/constants.ts` site-wide constants
- [x] 1.4 `.env.local.example` — backend URL template
- [x] 1.5 Utility tests written and passing: `image-utils` (9 tests), `portfolio-config` (13 tests), `sitemap` (18 tests), `seo-content` (17 tests)

---

## Phase 2 — Core Layout & Components

- [x] 2.1 Root layout (`src/app/layout.tsx`) — metadata, font, header/footer + CookieBanner wired
- [x] 2.2 `Header` component — logo + tagline + nav (test-first, 4 tests ✅)
- [x] 2.2 `Navigation` component — desktop hover submenu + mobile hamburger toggle (test-first, 6 tests ✅)
- [x] 2.3 `Footer` component — copyright, email, Calendly, Imprint, Privacy (test-first, 5 tests ✅)
- [x] 2.4 `CookieBanner` component — consent cookie `site_consent`, Accept/Reject, pre-existing consent skip (test-first, 8 tests ✅)
- [x] 2.4 `useSwipe` hook — threshold + vertical-axis guard (test-first, 4 tests ✅)
- [x] 2.4 `useMediaQuery` hook — SSR-safe, live updates (test-first, 3 tests ✅)
- [x] 2.4 `useIntersection` hook — `once` mode, observe/disconnect lifecycle (test-first, 4 tests ✅)
- [x] 2.4 `useLightbox` hook — open/close/next/prev/goTo/wrap-around (test-first, 10 tests ✅)
- **66 unit tests passing, 0 TypeScript errors** ✅

### 2.5 CSS Port
- [x] Full component CSS ported from legacy `Jinee_website/css/styles.css` (1,765 lines) → `globals.css`
- [x] `:root` variable aliases bridging Tailwind tokens → legacy names
- [x] Header (`.site-header`), Navigation (desktop submenu + mobile hamburger + X animation)
- [x] Section backgrounds (full-bleed `.section-bg-white`, `.section-bg-charcoal`)
- [x] Gallery collage (3×3 grid), project gallery grid (3→2→1 responsive)
- [x] Featured section (project cards, IG previews, section CTA)
- [x] Buttons (`.btn--primary`, `--outline`, `--ghost`, `--inverted`, `--large`)
- [x] About section, contact section + form styling
- [x] Footer (3-column flex)
- [x] Lightbox (overlay, frame, controls, counter)
- [x] Slideshow (track, prev/next, dots)
- [x] Video player (lazy embed, responsive iframe)
- [x] Download toolbar + modal
- [x] Cookie consent banner
- [x] Portfolio hub (category cards), portfolio index (project cards), project pages
- [x] Static pages (imprint, privacy — headings, lists, compact sections)
- [x] Skip-link visible on focus, global `img { height: auto }` fix
- [x] Mobile responsive rules at 800px, 700px, 600px, 480px breakpoints

---

## Phase 3 — Pages & Features

### 3.1 Homepage
- [x] ~~`HeroSection` component~~ — header is the hero; homepage adds sr-only `<h1>` only
- [x] `GallerySection` — 3×3 travel-photography collage with `GalleryWithLightbox` (4 tests ✅)
- [x] `FeaturedSection` — 6 video project cards + 4 IG previews (6 tests ✅)
- [x] `AboutSection` — avatar, bilingual bio (EN + Traditional Chinese) (5 tests ✅)
- [x] `ContactSection` — info card + `ContactForm` (5 tests ✅)
- [x] `src/app/page.tsx` assembles all sections (h1 + Gallery + Featured + About + Contact)

### 3.2 Lightbox
- [x] `Lightbox` component — dialog, keyboard (Esc/←/→), backdrop click, prev/next/close, counter
- [x] `GalleryWithLightbox` — client composition: GalleryGrid + useLightbox + Lightbox
- [x] `Lightbox` unit tests passing (12 tests ✅)

### 3.3 Gallery Grid
- [x] `GalleryGrid` component — image grid of clickable buttons wrapping `next/image`
- [x] `src/lib/gallery-images.ts` — build-time `images.json` reader → `GalleryImage[]`
- [x] `GalleryGrid` unit tests passing (5 tests ✅)

### 3.4 Slideshow
- [x] `Slideshow` component — autoplay, infinite loop, swipe, dots, prev/next
- [x] `Slideshow` unit tests passing (8 tests ✅)

### 3.5 Contact Form
- [x] `ContactForm` component — AJAX CSRF flow, sessionStorage drafts, honeypot, inline feedback, disabled while sending
- [x] `ContactForm` unit tests passing (8 tests ✅)

### 3.6 Portfolio Pages
- [x] `src/app/portfolio/page.tsx` — portfolio hub (3 category cards)
- [x] `src/app/portfolio/photography/page.tsx` — photography index (sorted by portfolioCard.order)
- [x] `src/app/portfolio/photography/[slug]/page.tsx` — gallery + generateStaticParams + generateMetadata
- [x] `src/app/portfolio/video/page.tsx` — video index
- [x] `src/app/portfolio/video/[slug]/page.tsx` — lazy YouTube embeds via VideoPlayer + useIntersection (5 tests ✅)
- [x] `src/app/portfolio/social-media/page.tsx` — social-media index
- [x] `src/app/portfolio/social-media/[slug]/page.tsx` — gallery or customContent HTML
- [x] All 27 projects (9 photo + 15 video + 3 SM) generating static pages ✅

### 3.7 Download System
- [x] `DownloadToolbar` component — select/deselect all, count display, download button (7 tests ✅)
- [x] `GallerySelection` component — checkbox overlay on gallery in selection mode (5 tests ✅)
- [x] `DownloadModal` component — password, CSRF, POST to backend, binary blob download, Safari-safe (9 tests ✅)
- [x] `GalleryWithDownload` — composition: toolbar + selection + lightbox + modal
- [x] `photography/[slug]/page.tsx` renders `GalleryWithDownload` when `enableDownload: true`

### 3.8 Static Pages
- [x] `src/app/imprint/page.tsx`
- [x] `src/app/privacy/page.tsx`
- [x] Footer + CookieBanner links fixed: `/imprint-en.html` → `/imprint/`, `/privacy.html` → `/privacy/`

- **180 unit tests passing, 0 TypeScript errors** ✅

---

## Phase 4 — Backend Separation ✅

- [x] 4.1 `backend/` directory created mirroring PHP structure
- [x] 4.1 PHP files copied: `contact.php`, `csrf-token.php`, `csrf-validate.php`, `download.php`, `projects.php`
- [x] 4.1 `backend/vendor/` (PHPMailer) copied from `Jinee_website/vendor/`
- [x] 4.1 `backend/composer.json` with correct paths
- [x] 4.1 `backend/contact/config.example.php` created (template without credentials)
- [x] 4.1 `backend/download/download_config.example.php` created
- [x] 4.1 `backend/.htaccess` — denies direct access to config, logs, tmp, rate-limit
- [x] 4.1 Runtime dirs with `.gitkeep`: `contact/logs/`, `download/tmp/`, `download/rate-limit/`
- [x] 4.2 Internal PHP paths use `__DIR__`-relative resolution (work from new location)
- [x] 4.3 `NEXT_PUBLIC_BACKEND_URL` env var in `src/lib/constants.ts`
- [ ] 4.3 Frontend API endpoint URLs updated to `/backend/...` prefix *(deferred — requires FTP server)*
- [ ] 4.4 PHP backend smoke test: contact form + download both working *(deferred — requires FTP server)*

---

## Phase 5 — SEO & PWA Parity ✅

- [x] 5.1 `metadata` export in root layout (global title template, description, OG, Twitter card, icons)
- [x] 5.1 `generateMetadata()` in all dynamic portfolio pages (photography, video, social-media `[slug]`)
- [x] 5.1 OG tags + Twitter card on all pages (via root layout + per-page overrides)
- [x] 5.1 JSON-LD Person schema in root layout (`<head>` via `dangerouslySetInnerHTML`)
- [x] 5.1 JSON-LD VideoObject schema on video project pages (title, description, embedUrl, uploadDate)
- [x] 5.1 JSON-LD ImageGallery schema on photography project pages
- [x] 5.2 `src/app/sitemap.ts` — 7 static routes + all project routes (priorities + changeFreq)
- [x] 5.2 `sitemap.ts` tests: 18 tests covering all routes, priorities, trailing slash ✅
- [x] 5.3 `public/manifest.json` copied from legacy site
- [x] 5.3 `public/robots.txt` copied from legacy site

---

## Phase 6 — Build, Export & Deploy ✅

- [x] 6.1 `next build` produces clean `out/` — 38 static pages, 0 errors ✅
- [x] 6.1 `sitemap.xml` in `out/` with 34 URLs (7 static + 27 projects) ✅
- [x] 6.1 `export const dynamic = 'force-static'` added to `sitemap.ts` for static export
- [x] 6.2 `scripts/build-images.sh` — dev symlink no-op, production cp from Jinee_website/assets/
- [x] 6.2 `npm run build` (build:images + next build) completes end-to-end ✅
- [ ] 6.3 FTP deployment tested: static site + backend both working on server *(deferred — requires FTP server)*
- [x] 6.4 `public/.htaccess` — 301 redirects for `privacy.html` → `/privacy/`, `imprint-en.html` → `/imprint/`, trailing slash enforcement

---

## Phase 8 — Detail Refinements (design parity with legacy) ✅

### 8.1 Homepage
- [x] Smooth scroll — `html { scroll-behavior: smooth }` in globals.css (Phase A-1)
- [x] "Portfolio" section heading with full-width charcoal divider (Phase A-2, B-10)
- [x] Featured cards → show `project.heading` (role/location) instead of `cardTitle` (Phase B-11)
- [x] Instagram previews → ▶ play overlay (Phase A-3, B-12)
- [x] "View More Projects" button → dark/primary theme (Phase A-4, B-13)
- [x] About image → height-constrained, not width-constrained (Phase A-5)
- [x] White spacer bar between About and Contact sections (Phase A-6, D-15)
- [x] Contact form inputs → placeholder text (Phase C-14)
- [x] Send button → charcoal even inside dark section (Phase A-7)

### 8.2 Portfolio Hub (`/portfolio/`)
- [x] Show 3 sections with project cards (6 per category) + "More" CTAs (Phase E-16)
- [x] Update E2E test for new hub structure (Phase E-17)

### 8.3 Portfolio Category Index Pages
- [x] Cards → title only (bold), remove description text (Phase F-18)

### 8.4 Gallery — Portrait Images
- [x] GalleryGrid: portrait image detection + blurred background (Phase G-19)
- [x] Lightbox: frame fits actual image ratio; portrait images get blurred background (Phase H-20)

### 8.5 Slideshow
- [x] Wire `Slideshow` component above gallery grid on all `hasGallery: true` project pages (Phase I-21)
- [x] Create `GallerySection` client component (Slideshow + GalleryGrid + Lightbox)

---

## Phase 7 — TinaCMS (Deferred)

- [ ] 7.1 TinaCMS initialized (`npx @tinacms/cli init`)
- [ ] 7.2 Content collections configured for photography, video, social-media, site config
- [ ] 7.3 Visual editing tested locally at `http://localhost:4001/admin` ✅

---

## E2E Test Coverage ✅

- [x] `e2e/homepage.spec.ts` — sections, nav links, header logo, footer email (9 tests ✅)
- [x] `e2e/contact-form.spec.ts` — fields, honeypot, network error, sessionStorage draft (6 tests ✅)
- [x] `e2e/portfolio-navigation.spec.ts` — hub → category → project → back, video player, gallery (7 tests ✅)
- [x] `e2e/lightbox.spec.ts` — open, next/prev buttons, arrow keys, Escape, close button, backdrop (7 tests ✅)
- [x] `e2e/download-modal.spec.ts` — toolbar, select all, modal open, wrong password, close, Escape, cancel (8 tests ✅)

**37 E2E tests passing (Chromium), 192 unit tests passing — 229 total tests** ✅

---

## Verification Checklist (Final)

Before declaring the migration complete:

- [ ] Visual comparison: original site vs new site for each page type *(manual)*
- [x] All 34 sitemap URLs resolve in `out/` ✅
- [ ] Lighthouse: 90+ on Performance, Accessibility, SEO, Best Practices *(deferred — requires deployed site)*
- [ ] Contact form: test message delivered to SMTP recipient *(deferred — requires FTP server + SMTP config)*
- [ ] Download: password-protected ZIP download works *(deferred — requires FTP server)*
- [ ] Mobile: hamburger menu, swipe, gallery selection on touch device *(manual)*
- [x] Lightbox: navigate, keyboard, Escape ✅ (E2E tested)
- [ ] Slideshow: autoplay, pause on hover, swipe, dots, progress bar *(manual)*
- [ ] SEO: OG/Twitter tags render correctly in social media debugger *(deferred — requires deployed site)*
- [ ] Cookie consent: banner, persist, no analytics without consent *(manual)*
- [x] Accessibility: tab order, skip-link, ARIA on modals ✅ (E2E tested)
- [x] Static output: `out/` has no server-side dependencies ✅
