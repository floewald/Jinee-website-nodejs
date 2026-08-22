# Improvements

All audit backlog items have been implemented. This file is now a quick-reference summary.
For authoritative requirements see [REQUIREMENTS.md](REQUIREMENTS.md).
For the technical design see [DESIGN.md](DESIGN.md).

---

## Completed items

| # | Item | Area | Status |
|---|------|------|--------|
| 1.1 | `sizes` prop on fill images (`CardSlideshow`, `GalleryGrid`) | Performance | ✅ |
| 1.2 | Comment `unoptimized: true` in `next.config.ts` | Code clarity | ✅ |
| 2.1 | LQIP blur-up placeholder (`generate-lqip.mjs`, `placeholder="blur"`) | UX | ✅ |
| 2.2 | Preload next carousel image in `CardSlideshow` | UX | ✅ |
| 3.2 | Magic constants → `src/lib/constants.ts` | Maintainability | ✅ |
| 3.3 | Extract `<ProjectCardsGrid>` component | Maintainability | ✅ |
| 3.5 | `getGalleryImages()` warns on missing manifest | Robustness | ✅ |
| 3.6 | `new Date()` in `sitemap.ts` | SEO | ✅ |
| 4.1 | Custom 404 page (`src/app/not-found.tsx`) | UX | ✅ |
| 4.2 | React error boundary (`src/app/error.tsx`) | Robustness | ✅ |
| 5.1 | `validate-manifests.mjs` — build fails on missing `images.json` | DX | ✅ |
| 5.2 | `build:images` hooked into `npm run build` | DX | ✅ |
| 5.3 | `npm run create-project` CLI scaffolding tool | DX | ✅ |
| 5.4 | Zod schemas for content JSON (validated at build time) | Robustness | ✅ |
| 6.1 | Asset deploy condition: `git diff` instead of `head_commit.modified` | CI/CD | ✅ |
| 6.2 | Build output verification + Git LFS quota alert in CI | CI/CD | ✅ |
| Mobile | Swipe support on `CardSlideshow` | UX | ✅ |

---

## Panda CSS migration (completed 2026-04-13)

| # | Item | Area | Status |
|---|------|------|--------|
| P-1 | Migrate all component styles from `globals.css` to Panda CSS `css()`/`cx()` utilities (~1200 lines moved) | Maintainability | ✅ |
| P-2 | Visual regression test suite (22 tests, 11 routes × 2 browsers) as migration guard | Testing | ✅ |
| P-3 | Nav submenu cascade fix: padding / gap / alignItems overrides competing global selector | Bug fix | ✅ |
| P-4 | Nav submenu hover border-bottom underline (matching top-level link mechanism) | Bug fix | ✅ |
| P-5 | Instagram card `display: flex !important` — Panda stylesheet source-order conflict | Bug fix | ✅ |
| P-6 | Contact link colour `!important` — unlayered `.section-bg-charcoal a` beating `@layer utilities` | Bug fix | ✅ |
| P-7 | Imprint / Privacy pages: removed `section-bg-white` full-bleed class from sections inside `.container` | Bug fix | ✅ |
| P-8 | Primary button visibility — removed `background: transparent` from `base` css() to fix `cx()` source-order conflict with `primary` visual | Bug fix | ✅ |

---

## Deferred items

| Item | Reason |
|------|--------|
| Frontend API URLs updated to `/backend/…` prefix (FR-04.8) | Requires live FTP server |
| FTP deployment smoke test (NFR-06.7) | Requires live FTP server |
| Lighthouse / visual regression / OG debugger | Requires deployed site |
| Remove temporary reveal debug helpers and archive the collage reveal FTA once Safari/Chrome/mobile behavior is verified | Temporary investigation scaffolding |
| TinaCMS (Phase 7) | Deferred indefinitely |
| Pinch-to-zoom in lightbox | Deferred — tap-to-zoom (2.2×) covers use case; would need gesture library |
| Safe area insets (`env(safe-area-inset-*)`) | Deferred — only needed if PWA mode is planned |

---

## Visual polish & animation improvements

| # | Item | Area | Status |
|---|------|------|--------|
| V-1 | Fail-open progressive reveal for teaser cards and previews (`RevealGrid` + `useProgressiveReveal`) | Animation | ✅ |
| V-2 | Load-triggered gallery tile reveal for photo grids (`GalleryGrid` / `GallerySelection`) | Animation | ✅ |
| V-3 | Border-radius preserved on gallery image hover (`will-change: transform` on `.gallery-item`) | Visual | ✅ |
| V-4 | Removed `NO_RADIUS` global toggle from `layout.tsx` and `globals.css` | Cleanup | ✅ |
| V-5 | Per-card randomised slideshow timing via cycle jitter + start delay | Animation | ✅ |
| V-6 | Card slideshow fallback background changed from `#111` to `#f5f5f5` (no black flash before image loads) | Visual | ✅ |

---

## In-progress — Mobile UX improvements

| # | Item | Area | Status |
|---|------|------|--------|
| M-0 | Lightbox ESLint error: `setPan` inside `useEffect` → event-handler reset | Correctness | ✅ |
| M-1 | Form input `font-size` → 1rem (prevent iOS Safari auto-zoom) | Mobile UX | ✅ |
| M-2 | `.form-row` mobile breakpoint (stack first/last name at ≤600px) | Mobile UX | ✅ |
| M-3 | Lightbox touch targets ≥ 44×44px (`min-width`/`min-height`) | Accessibility | ✅ |
| M-4 | `clamp()` for h1/h2 typography (scale on screens < 360px) | Mobile UX | ✅ |
| M-5 | Header padding audit for ultra-small screens (< 360px) | Mobile UX | ✅ (already adequate) |
| M-6 | `prefers-reduced-motion` media query | Accessibility | ✅ |
| M-7 | Focus ring visibility audit | Accessibility | ✅ (already adequate) |
| M-8 | Mobile E2E test assertions (Playwright `mobile-ux.spec.ts`) | Testing | ✅ |
