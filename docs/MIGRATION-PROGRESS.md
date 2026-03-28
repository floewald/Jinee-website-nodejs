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

---

## Build & Test Metrics

| Metric | Value |
|--------|-------|
| Static pages generated | 38 |
| Sitemap URLs | 34 (7 static + 27 projects) |
| Unit tests | 254 passing, 33 suites |
| E2E tests | 37 passing (Playwright, Chromium) |
| TypeScript errors | 0 |

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
