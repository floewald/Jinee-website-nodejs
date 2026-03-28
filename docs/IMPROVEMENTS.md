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

## Deferred items

| Item | Reason |
|------|--------|
| Frontend API URLs updated to `/backend/…` prefix (FR-04.8) | Requires live FTP server |
| FTP deployment smoke test (NFR-06.7) | Requires live FTP server |
| Lighthouse / visual regression / OG debugger | Requires deployed site |
| TinaCMS (Phase 7) | Deferred indefinitely |

