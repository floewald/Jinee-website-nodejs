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

## Panda CSS Migration ✅ Complete

Migrated from monolithic `globals.css` (~1800 lines) to Panda CSS `css()`/`cx()` utilities
with pixel-perfect visual regression validation.

**Started**: 2026-04-12  
**Completed**: 2026-04-13  
**Approach**: Component-by-component; visual regression baseline with Playwright (22 tests)

| Commit | Component | Lines removed | Status |
|--------|-----------|--------------|--------|
| d949096 | Panda scaffolding + Footer | ~60 | ✅ |
| 2864f57 | Buttons (`button-styles.ts`) | ~40 | ✅ |
| 08afd69 | CookieBanner | ~50 | ✅ |
| 565aab8 | Header + Navigation | ~280 | ✅ |
| 7134679 | Button fixes + About Section | ~55 | ✅ |
| 810618a | CardSlideshow + Slideshow | ~89 | ✅ |
| 276b7be | VideoPlayer | ~77 | ✅ |
| 6032f1b | Contact Section + Lightbox | ~130 | ✅ |
| 226a2f5 | Contact Form | ~84 | ✅ |
| b81a475 | Hero Slideshow + Gallery Collage | ~50 | ✅ |
| f2a4941 | Project Gallery (`gallery-styles.ts`) | ~60 | ✅ |
| 390c59b | Featured Section (`featured-styles.ts`) | ~250 | ✅ |
| 2bf0898 | Download Toolbar + Modal (`download-styles.ts`) | ~170 | ✅ |
| 077d385 | Portfolio Subpages + Static Pages (`portfolio-styles.ts`) | ~140 | ✅ |
| 288d6db | Cleanup: empty comments + dead CSS | ~49 | ✅ |

**Post-migration visual bug fixes** (found after baseline comparison):

| Commit | Fix | Status |
|--------|-----|--------|
| f660d20 | Nav submenu: padding / gap / alignItems cascade override | ✅ |
| b95b952 | Nav submenu hover: border-bottom underline (matching top-level links) | ✅ |
| 2fc30d4 | 4 visual bugs: instagram card flex layout, contact link color, imprint/privacy container, primary button visibility | ✅ |

### Remaining in globals.css (~380 lines — intentionally kept):

| Category | Lines | Reason |
|----------|-------|--------|
| Font faces + design tokens + base reset | ~110 | Global foundation, CSS custom properties |
| Container + links + typography | ~30 | @layer base rules, global selectors |
| Section backgrounds (full-bleed) | ~20 | Used by 8+ components with complex descendant selectors |
| Progressive reveal motion | ~10 | Globals keep only notes/selectors; fail-open reveal logic moved to TS helpers/hooks |
| Hover transforms + context selectors | ~30 | Cross-component descendant selectors (e.g. `.project-card:hover .project-card__thumb img`) |
| Selection mode + checkbox `:has()` | ~20 | CSS `:has()` pseudo-class not supported in Panda |
| Reduced motion + mobile overrides | ~25 | Global `@media` queries |
| Utility classes (sr-only, scrollbar-hide, no-scroll) | ~15 | Shared global utilities |

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
