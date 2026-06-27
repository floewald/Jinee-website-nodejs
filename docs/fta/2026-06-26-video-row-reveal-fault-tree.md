# Fault Tree Analysis — Video-Row Reveal Failure on Soft Navigation

| Field | Value |
|---|---|
| **Title** | Video rows fail to reveal correctly when reached via client-side (soft) navigation |
| **Date** | 2026-06-26 |
| **Author** | scroll-reveal FTA (automated) |
| **Stack** | Next.js `^16.2.3` (App Router) / React `19.2.4` / TypeScript / `output: "export"` (static) — see `package.json:27-29` |
| **Scope** | The bespoke per-row scroll-reveal inside `EpisodeRow` (`src/components/video/VideoPlayer.tsx:253-377`). Excludes the shared, working reveal system (`useScrollLinkedReveal` / `useProgressiveReveal`), which is used only as a *comparison reference*, not on the video project page. |
| **Affected route** | `/portfolio/video/[slug]/` (`src/app/portfolio/video/[slug]/page.tsx`) reached via `<Link>` from `/portfolio/` or `/portfolio/video/` (`ProjectCardsGrid.tsx:48`, `portfolio/page.tsx:121`). |

## 1. System description — how `EpisodeRow` reveal is *supposed* to work

`VideoPlayer` (`src/components/video/VideoPlayer.tsx:383`) maps each video to an `EpisodeRow` keyed by array index (`key={i}`, line 388). Each `EpisodeRow` runs a **`useLayoutEffect` with dependency array `[index]`** (`:259-350`). On mount the effect:

1. Bails out for reduced-motion users (fail-open: opacity 1, no animation — `:266-271`).
2. Measures `el.getBoundingClientRect()` against `window.innerHeight` to compute `visibleHeight()` (`:274-279`).
3. **If any part of the row is in the viewport now → early-return**, leaving the row at its CSS default (opacity 1, static — `:285`). `scrollY` is deliberately *not* in this check (a comment at `:282-284` says including it re-introduced a flicker bug).
4. **Otherwise** it sets `data-should-reveal="hidden"` and inline `el.style.opacity = "0"` (`:287-288`), then arms two recovery paths:
   - a synchronous `IntersectionObserver` (`rootMargin: "80px"`, `:324-333`) that calls `reveal()` and disconnects on first intersection, and
   - a single `requestAnimationFrame` "safety net" (`:339-344`) that re-measures next frame and reveals if the row is on-screen by then.
5. `reveal()` (`:291-320`) is idempotent (`revealed` guard). It re-measures: if the row is **already on screen** it just clears the hidden attribute (instant show, no animation — `:299-300`); only a row **still entering from below** gets the WAAPI slide-up (`el.animate([...translateY(12px)...], {fill:"both", delay:index*80})`, `:302-316`). Finally it forces `opacity:1` / `translateY(0)` inline (`:318-319`).
6. Cleanup cancels the rAF and disconnects the observer (`:346-349`). **Cleanup does not reset `el.style.opacity`.**

There is **no `scroll` or `resize` listener** anywhere in `EpisodeRow`. Recovery is limited to (a) the one-shot IO and (b) the single rAF. This is the structural difference from the working shared hook `useScrollLinkedReveal` (`src/hooks/useScrollLinkedReveal.ts:117-118`), which attaches `window` `scroll`+`resize` listeners and continuously re-evaluates geometry — so the working system self-heals from a bad initial measurement, while `EpisodeRow` cannot.

Page scrolling is on the **window/document**, not a nested container: the only height rules are `<html class="h-full">` / `<body class="min-h-full flex flex-col">` (`src/app/layout.tsx:84,94`); grep found **no `overflow:auto|scroll` / `height:100vh` scroll container** in layouts or global CSS (`Lightbox.tsx` `100vh` is an unrelated modal). So both the window-relative `getBoundingClientRect` math *and* the default IO root (the viewport) are operating on the correct scroller. `SmoothScroll.tsx` only intercepts in-page `#anchor` clicks (`:18-35`) and is irrelevant to route navigation.

---

## 2. Top event (TOP)

> **On a video project page, video rows fail to display correctly when reached via client-side (soft) navigation from a portfolio project card.**

A full reload of the same URL renders correctly ⇒ the defect is **soft-navigation-specific**. The TOP event is the **OR** of two independently-observable sub-faults:

- **(A)** The **first** video row is stuck hidden (`opacity:0`) and only appears after a full browser reload.
- **(B)** The **second**, below-the-fold video row **never plays its slide-up entry animation** when scrolled into view (and may stay hidden).

```
                              ┌─────────────────────────────┐
                              │  TOP: rows mis-reveal on     │
                              │  soft navigation             │
                              └──────────────┬──────────────┘
                                         (OR gate)
                          ┌───────────────────┴───────────────────┐
                   ┌──────┴───────┐                        ┌───────┴────────┐
                   │ (A) Row 0     │                        │ (B) Row 1       │
                   │ stuck hidden  │                        │ never animates  │
                   └──────────────┘                        └────────────────┘
```

### Shared enabling condition (a primary cause feeding BOTH A and B)

> **E0 — Stale viewport measurement at `useLayoutEffect` time.**
> On soft navigation the new page's child effects run **before** the App Router's ancestor scroll-reset effect (React commits effects **children-before-parents**). So when `EpisodeRow`'s `useLayoutEffect` calls `getBoundingClientRect()` (`:275`), it is measured against the **old scroll offset carried over from the portfolio page** (which may be scrolled well down to the clicked card), *not* against the post-navigation `scrollY = 0`.
>
> Consequence, per row, depends purely on where that row's document position lands relative to the **stale** scroll offset:
> - A row that is really near the **top** of the new page maps to "above the old viewport" → `visibleHeight()==0` → it is **hidden** (`:287-288`). → feeds **(A)**.
> - A row that maps to "**inside** the old viewport" → `visibleHeight()>0` → it hits the **early-return** (`:285`), stays static **with no observer attached**, so when later scrolled into the *real* viewport it can never animate. → feeds **(B)**.
>
> This single root cause cleanly explains why the defect is soft-nav-only: on hard reload `scrollY` starts at 0, so the measurement is correct, row 0 early-returns visible and row 1 is correctly armed as hidden+observed.

---

## 3. Fault tree

Gate legend: **OR** = any child suffices; **AND** = all children required. `[E]` = evidenced in code; `[H]` = hypothesis to test.

### Sub-fault (A): first row stuck hidden until reload

```
(A) Row 0 stuck at opacity:0
│  AND
├─ A1  Row 0 was marked hidden (opacity:0 set at :287-288)
│      └─ caused by E0: stale rect measured above old viewport  ........ [E/H]
│
└─ A2  NEITHER recovery path cleared it   (OR of the ways each path is defeated)
       ├─ A2a  IO first-callback never reveals row 0
       │       OR
       │       ├─ IO callback delivered but isIntersecting=false because it
       │       │   was evaluated against the OLD scroll (reposition not yet
       │       │   reflected), then never re-fires (one-shot, no scroll
       │       │   listener)  ............................................ [H]
       │       └─ IO never delivers a callback for the programmatic
       │           scrollTo reposition at all  ........................... [H]
       │
       ├─ A2b  rAF safety net (:339) fails to reveal
       │       OR
       │       ├─ rAF fires BEFORE App Router's scroll reset settles, so it
       │       │   still measures row 0 off-screen → no reveal, and nothing
       │       │   re-checks afterward (no scroll/resize listener)  ...... [H]
       │       └─ rAF was cancelled by an effect cleanup before it ran
       │           (see A2c)  ............................................. [H]
       │
       └─ A2c  Effect re-run / no-remount leaves stale inline opacity:0
               OR
               ├─ React StrictMode dev double-invoke: run #1 sets
               │   opacity:0 + arms IO/rAF; cleanup (:346) cancels rAF &
               │   disconnects observer WITHOUT resetting opacity; run #2
               │   now measures scroll-reset geometry → early-return (:285)
               │   → inline opacity:0 is never cleared  .................. [H, dev-only]
               └─ Component not remounted across navigations (Router Cache /
                   reconciliation reuse, same key={i}, deps [index]
                   unchanged) → effect never re-runs → DOM keeps opacity:0
                   from a prior visit  .................................... [H]
```

**Why A is an AND of A1 and A2:** a hidden row is only a *fault* if neither recovery path heals it. A1 alone (transiently hidden, then revealed next frame) is the intended behaviour.

### Sub-fault (B): second (below-fold) row never animates on scroll-in

```
(B) Row 1 never plays slide-up (and may stay hidden)
│  OR
├─ B1  Early-return path wrongly taken at mount  (the leading explanation)
│      └─ E0: at effect time the stale (old portfolio) scroll places row 1
│          inside the viewport → visibleHeight()>0 → early-return (:285) →
│          NO observer attached, NO hidden state. After scroll resets to top
│          row 1 is below the fold but is now permanently static — scrolling
│          it into view triggers nothing.  ............................... [E/H]
│
├─ B2  Row 1 armed hidden, but its entry IO never fires on real scroll-in
│      AND
│      ├─ row marked hidden (opacity:0)  ................................ [E]
│      └─ IO callback for the genuine downward scroll never delivered, OR
│          observer was disconnected early by a stale cleanup / no-remount
│          (A2c) so nothing is watching  ................................ [H]
│
└─ B3  reveal() ran but chose the no-animation branch
       └─ at the moment reveal() fired (IO or rAF), row 1 already measured
           on-screen (post scroll-reset transient) → :299-300 clears hidden
           and shows it INSTANTLY with no slide-up — matching "visible but
           never animated"  ................................................ [E/H]
```

### Causes considered and **down-weighted** (kept for completeness)

```
├─ C1  Container-scroll / wrong IO root / wrong viewport math
│      └─ REFUTED by code: scrolling is on window/document; no overflow
│          scroll container in layouts or globals; IO uses default (viewport)
│          root; the working shared hook uses the SAME window math
│          successfully.  ................................................ [E, refuted]
│
├─ C2  WAAPI fill:"both" traps row at opacity:0
│      └─ Unlikely for (A): the hidden→visible keyframes end at opacity 1
│          with fill:both, so a row that *animated* ends visible. Only
│          relevant if animate() is invoked then immediately cancelled.  . [H, low]
│
└─ C3  Reduced-motion path
       └─ Fail-open (early-return, opacity 1) at :266-271 — cannot itself
           hide a row. Refuted as a cause of (A).  ........................ [E, refuted]
```

---

## 4. Minimal cut sets

A **minimal cut set (MCS)** is a smallest combination of basic events that, together, produce the TOP event. Because TOP = (A) OR (B), any MCS for A *or* B is an MCS for TOP. All A-cut-sets include **E0** (the stale measurement) as the common first element.

**Single-point cut sets (one basic event independently produces TOP):**

1. `{ E0 → B1 }` — stale measurement makes row 1 take the early-return; below-fold row is permanently static. **One event, no recovery path even exists.** This is the strongest single-point failure and the most likely production-visible one (does not require dev StrictMode).
2. `{ no-remount across navigations }` (A2c second branch) — stale inline `opacity:0` persists with no re-run; defeats A by itself.

**Two-event cut sets for (A):**

3. `{ E0 (row 0 hidden), A2a IO-never-reveals }` **AND** `{ A2b rAF-fires-before-scroll-settles }` — i.e. `{E0} ∧ {A2a} ∧ {A2b}` (3-event set): hidden, and *both* recovery paths defeated by timing. Listed because A requires *both* recovery paths to fail.
4. `{ E0 (row 0 hidden), StrictMode double-invoke leaving stale opacity (A2c) }` — in dev, the cleanup-without-reset + early-returning re-run is sufficient on its own to defeat both recovery paths (rAF cancelled, re-run early-returns). Effectively a **single-point** cut set *in dev*.

**For (B):**

5. `{ E0 → B1 }` (as #1).
6. `{ E0 (row 1 hidden), B2 IO-not-firing-or-disconnected }`.
7. `{ B3 }` — reveal chose instant-show branch (visible but un-animated).

> Note: cut sets #1 and #2 are **single points with no compensating path** — they should be treated as the highest-priority defects regardless of which timing hypothesis wins.

---

## 5. Test / diagnosis matrix

| ID | Basic cause | How to confirm or refute | Expected if TRUE |
|---|---|---|---|
| E0 | Stale rect vs old scroll | In the layout effect, `console.log(index, window.scrollY, el.getBoundingClientRect().top)` on **soft nav** vs **reload**. | On soft nav, `scrollY` ≠ 0 (≈ old portfolio offset) and `rect.top` reflects the old scroll; on reload `scrollY===0`. |
| A1 | Row 0 hidden | After soft nav, inspect row 0 in devtools: `data-should-reveal` attribute + inline `style.opacity`. | `data-should-reveal="hidden"`, `opacity:0` that never clears. |
| A2a | IO never reveals | Add a `console.log("IO", index, entries[0].isIntersecting)` in the observer callback (`:325`). | For row 0 on soft nav: either no log at all, or a log with `isIntersecting:false` and no follow-up. |
| A2b | rAF before scroll-settle | Log inside the rAF (`:339`): `index, window.scrollY, visibleHeight()`. | rAF logs `scrollY` still = old offset (scroll reset happens *after* the rAF) → `visibleHeight()===0` → no reveal. |
| A2c-strict | StrictMode stale opacity | Run `next dev` vs `next build && next start`. Also temporarily reset `el.style.opacity=""` at the top of the effect and see if bug disappears. | Repro only in `next dev` ⇒ StrictMode double-invoke; resetting opacity at effect top fixes it. |
| A2c-remount | No remount | Add `key={`${slug}-${i}`}` (slug-scoped) to `EpisodeRow` (`:388`) to force remount on route change; or `console.count("mount "+index)` in a `useEffect(()=>{},[])`. | If forcing remount fixes it ⇒ component was being reused; mount count stays flat across navigations. |
| B1 | Early-return mis-fire | Log at `:285`: `index, visibleHeight()` and whether the early `return` is taken, on soft nav. | Row 1 logs `visibleHeight()>0` and returns early — no `data-should-reveal` ever set, no observer. |
| B2 | Entry IO never fires | After soft nav, scroll row 1 into view; watch the IO log from A2a. | No `isIntersecting:true` log when row 1 enters. |
| B3 | Instant-show branch | Instrument `reveal()` (`:299`) to log which branch runs. | Row 1 logs the `removeAttribute` (instant) branch instead of the `animate` branch. |
| C1 | Container scroll | In devtools, confirm `document.scrollingElement === document.documentElement` and that the IO entry `rootBounds` equals the viewport. | Confirms window scroller (refutes C1). |
| C2 | WAAPI fill trap | `el.getAnimations()` on a stuck row. | Empty (no animation) ⇒ not a WAAPI trap; a paused/forwards-filled anim ending at opacity 1 ⇒ also not the cause. |

**Fastest disambiguator:** add a temporary `window.scroll` listener inside the effect that calls the same `visibleHeight()`-recheck/`reveal()` (mirroring `useScrollLinkedReveal.ts:117`). If that alone fixes **both** A and B, the root cause is conclusively *"single bad initial measurement with no continuous re-evaluation"* and the fix is structural rather than a timing tweak.

---

## 6. Recommended next diagnostic steps (ordered by likelihood × ease)

Two prior fixes already **FAILED**:

- Attempt 1 — a rAF "static-vs-observer" split.
- Attempt 2 — the *current* code: synchronous observer + re-measuring `reveal()` + a single rAF safety net (`VideoPlayer.tsx:322-344`).

Both attempts only ever **re-measured once more** (next frame) and still relied on a one-shot IO. Neither added **continuous re-evaluation**, neither **reset stale inline opacity on effect cleanup/re-run**, and neither **forced a remount**. The FTA therefore steers diagnosis toward the causes those attempts structurally could not address:

1. **E0 + B1 (early-return on stale geometry)** — *most likely, cheapest to confirm.* Instrument the `:285` early-return and `:339` rAF with `scrollY`/`rect.top` logs on soft nav. If row 1 early-returns because the *stale* scroll made it "visible," that is the smoking gun for (B) and the prior attempts never touched this branch.
2. **A2b (rAF fires before App Router's scroll reset settles)** — log `scrollY` inside the rAF. If it is still the old offset, the safety net is measuring pre-reset geometry; a once-more rAF (attempt 1/2) cannot help because *nothing* re-checks after the reset. **Fix direction:** replace the one-shot rAF with a `window` `scroll`+`resize` listener (as `useScrollLinkedReveal` does) so the row re-evaluates after the reset lands.
3. **A2c-remount (no remount across navigations)** — quickest *fix-as-diagnosis*: change `key={i}` → a slug-scoped key (`VideoPlayer.tsx:388`) or key `VideoPlayer` by `slug` from the page. If the bug vanishes, the effect was never re-running and stale `opacity:0` persisted — a class of failure invisible to "re-measure once more" attempts.
4. **A2c-strict (StrictMode dev double-invoke)** — confirm whether the repro is `next dev`-only. If so, the cleanup at `:346-349` cancelling the rAF + the re-run early-returning leaves inline `opacity:0` un-cleared. **Fix direction:** reset `el.style.opacity = ""`/`data-should-reveal` at the *top* of the effect before measuring, so a re-run starts from a clean slate.
5. **A2a (IO never delivers a callback for the programmatic reposition)** — verify the observer actually fires for row 0 on soft nav. If it does not, the entire IO-based design is unreliable under App Router scroll restoration and should be replaced by the shared scroll-linked system.
6. **C1 (container scroll) — deprioritised but verify once** — code review already refutes it (window scroller, default IO root, same math as the working hook). One devtools check (`document.scrollingElement`, IO `rootBounds`) closes it out.

### Strategic recommendation

The cleanest resolution is to **stop maintaining the bespoke `EpisodeRow` reveal and migrate it onto the proven shared system** (`useScrollLinkedReveal` + `reveal-state`/`reveal-helpers`), which already: (a) re-evaluates continuously via `scroll`/`resize` listeners (`useScrollLinkedReveal.ts:117-118`), (b) tracks reveal state per element so re-runs/remounts are idempotent (`reveal-state.ts`), and (c) is fail-open. That single change neutralises E0, B1, A2a, and A2b at once, because correctness no longer depends on the geometry being correct at the precise instant `useLayoutEffect` runs.

---

## Summary — most probable root cause(s)

- **Common driver (E0):** App Router runs `EpisodeRow`'s `useLayoutEffect` **before** its ancestor scroll-reset effect, so `getBoundingClientRect()` (`VideoPlayer.tsx:275`) is measured against the **stale carried-over portfolio scroll position**, not the post-nav `scrollY=0`. Soft-nav-only by construction.
- **Fault A (first row hidden):** E0 marks row 0 `opacity:0` (`:287-288`); the only recovery paths are a one-shot IO and a single rAF, and `EpisodeRow` has **no continuous re-evaluation** (unlike the working `useScrollLinkedReveal`). The leading reasons recovery is defeated are (i) the rAF re-measures *before* the scroll reset settles, and/or (ii) a StrictMode/no-remount re-run that early-returns (`:285`) without clearing the inline `opacity:0` left by the prior run (cleanup at `:346` never resets opacity).
- **Fault B (second row never animates):** the single-point, no-recovery cut set `{E0 → early-return}` — at effect time the stale scroll places row 1 inside the (old) viewport, so it hits the early-return at `:285`, attaches **no observer**, and is left permanently static; scrolling it into the real viewport later triggers nothing.
- The two prior fixes failed because both only "re-measured once more" and kept a one-shot IO; they never added continuous re-evaluation, never reset stale inline opacity, and never forced a remount — exactly the branches this tree flags as untested.
