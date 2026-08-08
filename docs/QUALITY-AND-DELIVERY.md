# Quality And Delivery

This repo should have useful guardrails without turning every change into a ceremony. The goal is high confidence with low drag.

## Principles

- keep slices small enough to review clearly
- automate stable checks, not every idea
- prefer local fast feedback over burning remote CI minutes
- use more process only when the risk actually rises
- capture surprises found during verification so the next slice starts smarter

## Branch And Pull Request Contract

- Prefer one branch per issue:
  - `codex/51-short-slug`
- If there is no issue yet, use:
  - `codex/short-slug`
- Prefer one pull request per issue or slice.
- Prefer squash merge into `main`.
- When a PR should close an issue, put a closing keyword in the PR body:
  - `Fixes #51`

Plain `#51` is still useful for linking context, but it should not be treated as the reliable auto-close mechanism.

## Local Quality Gates

Current local hooks are the main quality harness:

- `pre-commit` runs `npm run check:pre-commit`
  - `lint-staged`
  - related Jest tests for staged TS and TSX files
  - manifest validation
- `pre-push` runs `npm run check:pre-push`
  - full lint
  - full Jest suite
  - manifest validation
  - `next build`

Remote safety net:

- the deploy workflow still verifies the build output on GitHub
- local hooks can be bypassed with `--no-verify`, so they are guardrails, not enforcement

## TDD And Review Expectations

Use TDD first or early for:

- bug fixes
- behavior changes
- routing, sitemap, and SEO changes
- schema or content-model changes
- build, deploy, or hook changes

For content-only, docs-only, or mechanical changes:

- do not force fake TDD
- do run the relevant validation
- do check for drift in docs, routes, and manifests when applicable

For risky changes, add one adversarial review pass before merge. Ask:

- what breaks if data is missing, hidden, or placeholder
- what breaks if a route no longer exists
- what breaks if a slow or remote dependency is unavailable
- what breaks if a local hook is bypassed

## Acceptance Criteria

Write acceptance criteria up front when the slice is:

- non-trivial
- user-facing
- risky
- architectural
- performance-sensitive

Skip the ceremony for typo-only, docs-only, or clearly mechanical maintenance.

## Verification Cadence

- run the narrowest relevant tests first while coding
- rerun only impacted checks during iteration
- use `npm run check:pre-push` before push or PR, not after every tiny edit
- keep manual verification focused on the changed surface area

Fast feedback beats repeatedly paying the full-suite cost.

## Retrospectives And Learnings

For non-trivial slices, record short learnings either in the PR body or in `docs/retrospectives/`.

Use this shape:

- what went well
- what went wrong
- discovered during verification
- guardrails added
- follow-ups

Retrospectives should stay brief. If a lesson does not affect future work, do not turn it into a permanent process rule.

## Definition Of Done

A slice is done when:

- the intended scope is complete
- relevant tests or validation passed
- docs were updated if behavior or workflow changed
- obvious dead links, dead routes, or config drift were checked
- meaningful tradeoffs or follow-ups are noted

## Repository Settings To Prefer

If GitHub repository settings are available, prefer:

- protect `main`
- merge through pull request
- prefer squash merge
- require review or explicit self-check notes when remote CI minutes are constrained
