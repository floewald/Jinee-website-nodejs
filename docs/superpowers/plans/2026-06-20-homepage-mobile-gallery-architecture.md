# Homepage Mobile Gallery Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage mobile gallery render its real curated mobile image list and stop fresh mobile loads from prefetching the desktop collage dataset.

**Architecture:** `GalleryWithLightbox` will choose a single active dataset for the current viewport and pass that dataset to `GalleryGrid` and `Lightbox`. For responsive-subset galleries, server/static HTML will render a lightweight desktop/mobile placeholder shell first so phones do not preload the wrong collage dataset before hydration.

**Tech Stack:** Next.js App Router, React client components, Panda CSS, Jest, Testing Library

---

## File Structure

- Modify: `src/components/gallery/GalleryWithLightbox.tsx`
  - Choose the active dataset for rendering and interaction, and render a pre-hydration shell for responsive-subset galleries.
- Modify: `src/components/gallery/GalleryGrid.tsx`
  - Render only the provided dataset and remove mobile-hide coupling.
- Create: `src/hooks/useHydrated.ts`
  - Provide hydration-safe server/client branching without effect-driven setState.
- Modify: `src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`
  - Add/adjust regression coverage for mobile dataset rendering, ordering, and server-render placeholder behavior.
- Optional verify-only reads:
  - `src/components/sections/GallerySection.tsx`
  - `src/content/portfolio/index-config.json`

### Task 1: Lock In The Regression Test

**Files:**
- Modify: `src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`
- Verify: `src/components/gallery/GalleryWithLightbox.tsx`

- [ ] **Step 1: Write the failing test**

Add assertions so the mocked `GalleryGrid` proves:

```tsx
expect(screen.getByTestId("gallery-grid")).toHaveAttribute("data-images", "One|Three|Four");
expect(screen.getByTestId("gallery-grid")).not.toHaveAttribute("data-hidden");
```

and update the mock shape so it exposes:

```tsx
data-images={images.map((image) => image.alt).join("|")}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`

Expected: FAIL because the current implementation still passes the full desktop `images` list to `GalleryGrid`.

- [ ] **Step 3: Write minimal implementation**

Do not touch production code yet. Only finish the test setup so the failure clearly reflects the current architecture bug.

- [ ] **Step 4: Re-run test to verify the failure is the right one**

Run: `npm test -- --runInBand src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`

Expected: FAIL on the mobile grid dataset assertion, not due to a mock or syntax error.

- [ ] **Step 5: Commit**

```bash
git add src/components/gallery/__tests__/GalleryWithLightbox.test.tsx
git commit -m "test(gallery): capture mobile grid dataset regression"
```

### Task 2: Refactor The Gallery Dataset Boundary

**Files:**
- Modify: `src/components/gallery/GalleryWithLightbox.tsx`
- Modify: `src/components/gallery/GalleryGrid.tsx`
- Test: `src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`

- [ ] **Step 1: Implement the minimal production change**

In `GalleryWithLightbox.tsx`, derive one dataset for rendering and interaction:

```ts
const renderedImages =
  hasCuratedMobileSubset && isMobile && mobileImages ? mobileImages : images;
```

Use that same dataset for:

```tsx
<Slideshow images={renderedImages} />
<GalleryGrid images={renderedImages} ... />
<Lightbox images={renderedImages} ... />
```

and simplify opening logic to:

```ts
function handleOpen(index: number) {
  open(index);
}
```

Remove:

```ts
hiddenOnMobileIndices
activeIndexBySourceIndex
imageKey
```

In `GalleryGrid.tsx`, remove:

```ts
hiddenOnMobileIndices?: number[]
galleryColsItemHideOnMobile
const hiddenOnMobile = new Set(hiddenOnMobileIndices)
```

and render each provided image directly.

- [ ] **Step 2: Run the focused test to verify it passes**

Run: `npm test -- --runInBand src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`

Expected: PASS

- [ ] **Step 3: Run related gallery regression tests**

Run: `npm test -- --runInBand src/components/gallery/__tests__/GalleryGrid.test.tsx src/components/sections/__tests__/GallerySection.test.tsx src/hooks/__tests__/useLoadedGalleryReveal.test.tsx`

Expected: PASS

- [ ] **Step 4: Refactor only if needed**

If the parent component becomes clearer after renaming `activeImages` to `renderedImages`, keep the naming consistent across slideshow, grid, and lightbox. Do not add new abstractions.

- [ ] **Step 5: Commit**

```bash
git add src/components/gallery/GalleryWithLightbox.tsx src/components/gallery/GalleryGrid.tsx src/components/gallery/__tests__/GalleryWithLightbox.test.tsx
git commit -m "fix(gallery): render true mobile collage dataset"
```

### Task 3: Prevent Static Export From Shipping The Wrong Initial Dataset

**Files:**
- Modify: `src/components/gallery/GalleryWithLightbox.tsx`
- Create: `src/hooks/useHydrated.ts`
- Modify: `src/components/gallery/gallery-styles.ts`
- Test: `src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`

- [ ] **Step 1: Write the failing server-render regression**

Add a `renderToStaticMarkup` assertion proving that a responsive-subset gallery emits a placeholder shell instead of the real grid on server render:

```tsx
expect(html).toContain('data-gallery-placeholder=\"responsive\"');
expect(html).not.toContain('data-testid=\"gallery-grid\"');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`

Expected: FAIL because the current static render still emits the real desktop grid.

- [ ] **Step 3: Implement the hydration-safe shell**

Create `src/hooks/useHydrated.ts`:

```ts
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
```

In `GalleryWithLightbox.tsx`, when `mobileImages` exists and hydration has not completed yet, return a placeholder shell instead of the real gallery.

In `gallery-styles.ts`, add shell visibility classes for:

- desktop-only placeholder
- mobile-only placeholder
- placeholder tile surface

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `npm test -- --runInBand src/components/gallery/__tests__/GalleryWithLightbox.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/gallery/GalleryWithLightbox.tsx src/components/gallery/gallery-styles.ts src/components/gallery/__tests__/GalleryWithLightbox.test.tsx src/hooks/useHydrated.ts
git commit -m "fix(gallery): gate responsive collage until hydration"
```

### Task 4: Verify Deploy Safety

**Files:**
- Verify only: `src/components/gallery/GalleryWithLightbox.tsx`
- Verify only: `src/components/gallery/GalleryGrid.tsx`

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: exit code `0`

- [ ] **Step 2: Run targeted test suite**

Run: `npm test -- --runInBand src/components/gallery/__tests__/GalleryWithLightbox.test.tsx src/components/gallery/__tests__/GalleryGrid.test.tsx src/components/sections/__tests__/GallerySection.test.tsx src/hooks/__tests__/useLoadedGalleryReveal.test.tsx`

Expected: all tests PASS

- [ ] **Step 3: Run production build**

Run: `npm run build:next`

Expected: successful static export build with no page-data failure for `/`

- [ ] **Step 4: Check final diff**

Run: `git diff --stat HEAD~1..HEAD`

Expected: only gallery dataset boundary files and matching tests changed

- [ ] **Step 5: Commit docs if they remain uncommitted**

```bash
git add docs/superpowers/specs/2026-06-20-homepage-mobile-gallery-architecture-design.md docs/superpowers/plans/2026-06-20-homepage-mobile-gallery-architecture.md
git commit -m "docs: capture mobile gallery architecture fix"
```
