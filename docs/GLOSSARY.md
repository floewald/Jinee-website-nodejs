# Glossary

Short repo terms. Fast sync. Less confusion.

## Core architecture

- `Static export`
  Next.js App Router site built with `output: "export"`. Build writes pure files to `out/`. No Node.js server in production.

- `PHP backend`
  Small server-side layer in `backend/`. Handles contact form, download flow, CSRF, rate limiting, ZIP responses.

- `Portfolio manifest`
  JSON content files in `src/content/portfolio/`. Source of truth for project metadata and routing.

- `images.json`
  Per-project image manifest generated from `public/assets/**`. Gallery components read this file instead of hardcoding image lists.

## UI / motion

- `Fail-open motion`
  Umbrella rule for motion in this repo. Content stays visible by default. Animation is enhancement only, never correctness gate.

- `Progressive reveal`
  Viewport-aware motion for teaser content like project cards and social previews.

- `Load-triggered reveal`
  Gallery motion model. Tile becomes animated when its image is loaded, not when a visibility observer fires.

- `Fail-open`
  Design rule: content must remain visible even if JS, image timing, or observer timing misbehaves. Opposite of old hide-then-show reveal.

- `Reveal tokens`
  Motion tuning values in [src/lib/reveal-config.ts](/Users/florianewald/Documents/01_git_projects/Jinee-website-nodejs/src/lib/reveal-config.ts): duration, offset, easing, viewport buffers.

- `Viewport buffer`
  Extra area around viewport used by reveal logic so cards can animate slightly before they fully enter view.

- `WAAPI`
  Web Animations API. Used for reveal motion in `animateRevealElement()` instead of CSS classes that hide content first.

## Galleries

- `Masonry`
  `react-masonry-css` layout used for standard gallery grids. Columns filled shortest-first.

- `CSS columns layout`
  Browser-managed column flow used on some mixed-orientation galleries. Better balance for portrait/landscape mixes on narrow screens.

- `GalleryGrid`
  Main image grid component for photography galleries. Handles layout + progressive load animation.

- `GallerySelection`
  Download-mode gallery variant. Same visual grid, plus checkbox overlay and selection state.

- `Lightbox`
  Full-screen overlay for browsing gallery images, with keyboard and swipe navigation.

- `CardSlideshow`
  Small auto-cycling thumbnail preview used in portfolio cards.

## Content

- `Portfolio card`
  Teaser card shown on index pages and homepage sections. Comes from `portfolioCard` data inside each project manifest.

- `Project page`
  Detail page for one photography, video, or social-media project.

- `Homepage collage`
  Curated travel image set on homepage. Configured in `src/content/portfolio/index-config.json`.

## Styling

- `Panda CSS`
  Main styling system. Atomic classes generated from `css()` and `cx()`.

- `globals.css`
  Intentional global CSS. Holds tokens, reset, section context overrides, hover rules, and selectors that do not map cleanly to Panda.

- `Design-decision comment`
  Comment that explains why code is shaped this way, not only what it does. Use for non-obvious tradeoffs, browser workarounds, and safety rules.
