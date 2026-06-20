# Homepage Mobile Gallery Architecture Design

**Goal:** Fix the homepage mobile collage so it renders a true mobile dataset instead of rendering the desktop dataset and hiding part of it with CSS.

## Problem

The homepage gallery currently renders the full desktop collage on all viewports and uses `hiddenOnMobileIndices` plus a mobile hide class to suppress desktop-only tiles on smaller screens. That creates three structural problems:

1. Mobile keeps extra gallery nodes in the DOM even though they are not part of the intended presentation.
2. Hidden tiles still participate in image loading and reveal bookkeeping.
3. The mobile visual order can diverge from the mobile lightbox order because the grid uses desktop ordering while the lightbox uses the curated mobile subset.

## Approved Direction

For `<= 800px`, the homepage collage should render the real curated mobile image list. For `> 800px`, it should render the full desktop image list.

The mobile layout should keep the current breakpoint feel:

- `481px–800px`: 2 CSS columns
- `<= 480px`: 1 CSS column

The important change is architectural, not visual polish: mobile should not mount desktop-only collage tiles at all.

## Architecture

`GalleryWithLightbox` becomes the single place that chooses the active dataset for the current viewport:

- desktop: `images`
- mobile with curated subset: `mobileImages`
- mobile without curated subset: `images`

`GalleryGrid` should become a simpler presentational component that renders exactly the `images` list it receives. It should no longer know about `hiddenOnMobileIndices`.

That change aligns:

- rendered DOM
- image loading behavior
- reveal scope
- grid order
- lightbox order

Because the site is statically exported, server HTML cannot know the real viewport width. A responsive-subset gallery therefore also needs a pre-hydration shell:

- server/static HTML renders lightweight placeholder blocks only
- CSS decides whether the desktop or mobile shell is visible
- after hydration, the real viewport-specific gallery dataset is rendered once

This prevents phones from preloading the desktop collage dataset before React has a chance to resolve `matchMedia`.

## Deploy Safety

This change must stay in the runtime rendering path only. It must not modify:

- `src/lib/portfolio-config.ts`
- asset dimension lookup
- build-time image probing
- image manifest generation

Width and height data remain the source of truth for layout reservation, so deployment safety should remain unchanged.

## Tests

Add regression coverage for:

1. mobile mode renders the curated mobile subset in the grid, not the full desktop set
2. desktop mode still renders the full desktop set
3. mobile lightbox order matches the rendered mobile grid order
4. server render emits a responsive placeholder instead of the real gallery when a curated mobile subset exists

## Acceptance Criteria

- mobile homepage grid mounts only the curated mobile image subset
- hidden desktop-only collage tiles are gone from the mobile DOM
- fresh mobile-first load requests only the curated mobile collage images
- mobile grid order and lightbox order match
- desktop homepage behavior remains unchanged
- `npm run lint`, targeted gallery tests, and `npm run build:next` all pass
