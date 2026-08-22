# Fault Tree Analysis — Homepage Collage Reveal Flicker And Premature Exit

| Field | Value |
|---|---|
| **Title** | Homepage collage tiles fade or jitter incorrectly on first load and near the exit band |
| **Date** | 2026-08-20 |
| **Author** | gallery reveal FTA (automated) |
| **Stack** | Next.js App Router / React / TypeScript / custom scroll-linked reveal |
| **Scope** | Homepage collage route `/`, specifically `GallerySection` → `GalleryWithLightbox` → `GalleryGrid` with `useColumnsLayout` and `useScrollLinkedReveal` |
| **Affected UI** | The start page collage (`src/components/sections/GallerySection.tsx`) using the CSS-columns gallery path, not the project teaser grid |

## 1. Intended behavior

The homepage collage should behave like this:

1. Tiles that are already visible on the first paint should render fully shown.
2. After the user begins scrolling, those same tiles may take part in the subtle exit motion near the top of the viewport.
3. Exit motion should feel calm and premium, especially on portrait images where a full-tile opacity fade is visually louder.

The relevant logic now lives in:

- `src/hooks/useScrollLinkedReveal.ts`
- `src/lib/reveal-state.ts`
- `src/lib/reveal-helpers.ts`
- `src/lib/reveal-config.ts`
- `src/components/gallery/gallery-styles.ts`

## 2. Top event

> On the homepage collage, initially visible items appear to enter or exit on first load, and some tiles can flip between exit states near the top threshold.

```
                         ┌────────────────────────────────────┐
                         │ TOP: homepage collage reveal feels │
                         │ unstable or premature              │
                         └────────────────┬───────────────────┘
                                       (OR gate)
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
      ┌───────┴────────┐        ┌────────┴────────┐        ┌────────┴────────┐
      │ A. First-paint │        │ B. Threshold    │        │ C. Exit fade    │
      │ visible items  │        │ flip-flop /     │        │ reads too loud  │
      │ not fully shown│        │ jitter          │        │ on tall images  │
      └────────────────┘        └─────────────────┘        └─────────────────┘
```

## 3. Fault tree

### A. First-paint visible items not fully shown

**Primary cause A1 — exit-enabled tiles still used partial entry progress before user scroll intent existed.**

Before the fix, exit-capable items stayed "active" on mount and immediately used `getRevealProgressFromRect(...)` even when the user had not scrolled yet. Lower items already on screen could therefore render with non-final opacity/translation for a frame, which read like an early exit or a delayed reveal.

**Implemented mitigation**

- In `src/hooks/useScrollLinkedReveal.ts`, if exit mode is enabled but not yet armed and the item is already visible, the hook now forces:
  - `entryProgress = 1`
  - `exitProgress = 1`
- The item stays eligible, so it can still participate in exit motion after the user actually scrolls.

### B. Threshold flip-flop / jitter

**Primary cause B1 — feedback loop from measuring transformed geometry.**

The hook used `getBoundingClientRect()` from the animated element itself. Because the reveal animation writes `translateY(...)` onto that same element, each frame measured a position that was already shifted by the previous animation frame.

That creates a control loop:

1. Scroll math decides the tile should move.
2. The tile moves.
3. The next frame measures the moved tile, not the underlying layout position.
4. Progress changes again because the measurement changed.
5. Near the exit threshold, the tile can bounce between adjacent states.

This is a strong match for the reported "one wheel step up, next wheel step down" behavior.

**Implemented mitigation**

- `src/lib/reveal-state.ts` now exposes layout metrics derived from the unshifted tile position by subtracting the current reveal `translateY`.
- Visibility checks and scroll-progress calculations now use that layout position instead of the already-shifted paint position.

**Residual risk**

If a small amount of oscillation remains on specific devices or wheel hardware, the next control-layer mitigation should be a dead zone or hysteresis around the exit band inside `useScrollLinkedReveal.ts`.

### C. Exit fade reads too loud on tall portrait images

**Primary cause C1 — whole-tile opacity fade is more noticeable on vertical images.**

Even when the motion is subtle, a full-surface opacity reduction is easy to perceive on tall images because a large uninterrupted area dims at once.

**Implemented mitigation**

- `src/components/gallery/gallery-styles.ts` now applies a top-down mask via `--reveal-exit-mask-start`, so the exit fade can happen gradually over the image rather than only as a uniform whole-tile dim.
- `src/lib/reveal-config.ts` now separates the homepage collage preset from the regular gallery preset.

This makes the homepage collage calmer while keeping normal gallery pages free to use their own tuning.

## 4. Minimal cut sets

1. `{ A1 }` — first-load visible items use partial entry progress before user scroll intent.
2. `{ B1 }` — progress is calculated from already-transformed geometry, creating self-reinforcing threshold instability.
3. `{ C1 }` — whole-image opacity fade is visually too strong for portrait tiles, even if the motion logic is otherwise correct.

## 5. Tuning map

These are the main control points for future refinement:

- `src/lib/reveal-config.ts`
  - `COLLAGE_REVEAL_PRESET.exitStartPx`
  - `COLLAGE_REVEAL_PRESET.exitRangePx`
  - `COLLAGE_REVEAL_PRESET.exitOffsetPx`
  - `COLLAGE_REVEAL_PRESET.exitEndOpacity`
  - `COLLAGE_REVEAL_PRESET.exitMaskMaxStartPercent`
- `src/hooks/useScrollLinkedReveal.ts`
  - exit-motion arming rules
  - any future hysteresis / dead-zone logic
- `src/components/gallery/gallery-styles.ts`
  - the image mask gradient used for the gradual top-down fade

## 6. Recommendation

The current patch addresses the two strongest root causes directly:

1. already-visible collage items are fully shown until the user scrolls
2. reveal math no longer measures its own transformed output

If more fine-tuning is still needed after device testing, the most likely next step is not another structural rewrite, but a small hysteresis band in the exit calculation plus preset tuning in `COLLAGE_REVEAL_PRESET`.

## 7. Close-out reminder

Keep this FTA while the Safari homepage collage behavior is still under investigation.

After the reveal behavior is verified in Safari, Chrome, and on mobile:

1. remove the temporary `revealDebug` instrumentation and overlay helpers
2. archive or delete this FTA if it no longer adds active debugging value
