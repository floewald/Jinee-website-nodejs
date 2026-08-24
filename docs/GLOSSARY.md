# Glossary

Short repo terms. Fast sync. Less confusion.

## Workflow / quality

- `Slice`
  One intentionally small unit of work. Small enough to implement, verify, review, and explain clearly.

- `Harness`
  The combined quality system for the repo: local hooks, tests, validation, build checks, docs, debugging tools, and lessons learned.

- `Guardrail`
  A lightweight check that catches likely mistakes early without turning every change into ceremony.

- `Local source of truth`
  Quality is decided primarily by local verification in this repo. GitHub Actions are reserved mainly for deploy verification, not a separate PR CI gate.

- `Definition of done`
  The minimum bar for calling a slice complete: intended scope finished, relevant checks passed, docs updated when needed, and meaningful follow-ups noted.

- `Lessons learned`
  Short notes captured after non-trivial work so future slices start with better context instead of repeating the same discovery.

- `Context drift`
  When docs, commands, architecture notes, or troubleshooting guidance no longer match the real code. This weakens the harness.

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

- `Entry motion`
  The part of reveal behavior that brings an element in from its initial offset and opacity toward the fully shown state.

- `Exit motion`
  The part of reveal behavior that subtly shifts or fades an element as it leaves the active viewport band, mainly used on scroll-linked surfaces.

- `Progressive reveal`
  Viewport-aware motion for teaser content like project cards and social previews.

- `Load-triggered reveal`
  Gallery motion model. Tile becomes animated when its image is loaded, not when a visibility observer fires.

- `Fail-open`
  Design rule: content must remain visible even if JS, image timing, or observer timing misbehaves. Opposite of old hide-then-show reveal.

- `Reveal tokens`
  Motion tuning values in [src/lib/reveal-config.ts](/Users/florianewald/Documents/01_git_projects/Jinee-website-nodejs/src/lib/reveal-config.ts): duration, offset, easing, viewport buffers.

- `Reveal preset`
  A named bundle of reveal tuning values for a specific UI context, such as teaser cards, the homepage collage, or video rows.

- `Viewport buffer`
  Extra area around viewport used by reveal logic so cards can animate slightly before they fully enter view.

- `Hysteresis`
  A small dead zone around a threshold so scroll-linked state does not flip back and forth when hardware scroll steps or layout measurements are noisy.

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

## Debugging / analysis

- `FTA`
  Fault Tree Analysis. A structured debugging write-up that breaks one visible problem into likely causes, disambiguators, and next actions.

- `Reveal debug`
  Temporary instrumentation for the scroll-linked reveal system. Exposes state through query params, data attributes, and helper output so motion bugs can be inspected directly.

## Styling

- `Panda CSS`
  Main styling system. Atomic classes generated from `css()` and `cx()`.

- `globals.css`
  Intentional global CSS. Holds tokens, reset, section context overrides, hover rules, and selectors that do not map cleanly to Panda.

- `Design-decision comment`
  Comment that explains why code is shaped this way, not only what it does. Use for non-obvious tradeoffs, browser workarounds, and safety rules.
