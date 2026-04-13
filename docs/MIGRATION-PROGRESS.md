# Migration Progress

Migration from the original hand-crafted HTML site (`Jinee_website/`) to Next.js 16 is complete.

**Started**: 2026-03-26  
**Completed**: All phases shipped and all backlog items resolved.

For authoritative requirements see [REQUIREMENTS.md](REQUIREMENTS.md).  
For the technical design see [DESIGN.md](DESIGN.md).  
For content workflow see [ADDING-PROJECTS.md](ADDING-PROJECTS.md).

---

## Phase Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Documentation & testing foundation (README, docs, Jest, Playwright, Husky) | ✅ Complete |
| 1 | Project scaffolding (Next.js 16, Tailwind v4, content JSON, types, utilities) | ✅ Complete |
| 2 | Core layout & components (Header, Nav, Footer, CookieBanner, all hooks, CSS port) | ✅ Complete |
| 3 | Pages & features (gallery, lightbox, slideshow, contact form, portfolio pages, download, static pages) | ✅ Complete |
| 4 | Backend separation (PHP backend in `backend/`, config templates, `.htaccess`) | ✅ Complete |
| 5 | SEO & PWA parity (metadata, JSON-LD, sitemap, manifest, robots.txt) | ✅ Complete |
| 6 | Build, export & deploy (CI/CD, GitHub Actions, `.htaccess` redirects) | ✅ Complete |
| 7 | TinaCMS | ⏳ Deferred indefinitely |
| 8 | Detail refinements (design parity with legacy site) | ✅ Complete |
| 9 | Homepage redesign & gallery masonry (hero image, masonry layout, /contact route, config-driven collage, Videography rename) | ✅ Complete |

---

## Build & Test Metrics

| Metric | Value |
|--------|-------|
| Static pages generated | 38 |
| Sitemap URLs | 34 (7 static + 27 projects) |
| Unit tests | 288 passing, 38 suites |
| E2E tests | 37 passing (Playwright, Chromium) |
| Visual regression tests | 22 (11 routes × 2 browsers) |
| TypeScript errors | 0 |

---

## Panda CSS Migration (branch: `redesign/panda-css`)

Migrating from monolithic `globals.css` (~1800 lines) to Panda CSS `css()`/`cx()` utilities
with pixel-perfect visual regression validation.

**Started**: 2026-04-12  
**Approach**: Component-by-component; visual regression baseline with Playwright (22 tests)

| Commit | Component | Lines removed | Status |
|--------|-----------|--------------|--------|
| d949096 | Panda scaffolding + Footer | ~60 | ✅ |
| 2864f57 | Buttons (`button-styles.ts`) | ~40 | ✅ |
| 08afd69 | CookieBanner | ~50 | ✅ |
| 565aab8 | Header + Navigation | ~280 | ✅ |
| pending | Button color fix + submenu spacing | — | 🔧 |

### Remaining sections (~1500 lines):

| Section | Est. lines | Priority |
|---------|-----------|----------|
| Section Backgrounds | ~35 | Next |
| Hero Slideshow | ~45 | Next |
| Gallery Collage | ~10 | Next |
| Project Gallery | ~70 | Medium |
| Featured Section | ~310 | Medium |
| About Section | ~55 | Medium |
| Contact Section | ~45 | Medium |
| Contact Form | ~85 | Medium |
| Lightbox | ~90 | Medium |
| Card Slideshow | ~40 | Medium |
| Slideshow | ~55 | Medium |
| Video Player | ~80 | Medium |
| Download Toolbar + Modal | ~215 | Low |
| Portfolio Subpages | ~140 | Low |
| Image fix / Accessibility / Mobile Sync | ~30 | Low |

### Key technical notes

- Panda CSS v1.9.1 with `preflight: false`, `jsxFramework: "react"`
- **Recipes don't work** — Tailwind v4 PostCSS strips `@layer recipes`; use `css()`/`cx()` only
- `panda cssgen --outfile src/styled-system/styles.css` must run with `panda codegen`
- Visual regression: `addInitScript` timer interception for slideshow determinism
- Cookie banner hidden via `[role="region"][aria-label="Cookie consent"]` (class-agnostic)

---

## Deferred Items

| Item | Reason |
|------|--------|
| 4.3 Frontend API URLs updated to `/backend/…` prefix | Requires live FTP server |
| 4.4 PHP backend smoke test | Requires live FTP server |
| 6.3 FTP deployment end-to-end test | Requires live FTP server |
| TinaCMS (Phase 7) | Deferred indefinitely |
| Visual comparison, Lighthouse, OG debugger | Requires deployed site |
| Contact form + download end-to-end test | Requires SMTP config + FTP |
