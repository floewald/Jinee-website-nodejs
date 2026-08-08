# Contributing

Short guide for contributing without adding much process overhead. Use this file for the everyday workflow and see [docs/QUALITY-AND-DELIVERY.md](docs/QUALITY-AND-DELIVERY.md) for the fuller quality contract.

## Default Workflow

1. Start from an up-to-date `main`.
2. Create a working branch.
3. For non-trivial or risky work, write acceptance criteria before coding.
4. Use TDD first or early when the change affects behavior, routing, schemas, SEO, deploy logic, or a bug fix.
5. Run the narrowest relevant checks while working.
6. Let the local hooks run before commit and push.
7. Open a pull request, include issue-closing keywords when relevant, and squash merge.

## Branch, PR, And Commit Naming

- Branches:
  - preferred: `codex/51-short-slug`
  - if there is no issue yet: `codex/short-slug`
- Pull request titles:
  - preferred: `[#51] Add Food, Wasted project`
  - if there is no issue yet: `Add Food, Wasted project`
- Commit messages:
  - keep them short and imperative
  - issue numbers are useful context, but `#51` by itself only links an issue

## Closing GitHub Issues Reliably

GitHub reliably auto-closes issues when the merged pull request body or the final commit on the default branch uses a closing keyword such as:

- `Fixes #51`
- `Closes #51`
- `Resolves #51`

Recommended default: put `Fixes #51` in the PR body. That keeps the close behavior tied to the reviewed change, not to an intermediate local commit.

## Tests And Validation

- Required TDD:
  - bug fixes
  - behavior changes
  - routing, sitemap, or SEO changes
  - schema and content-model changes
  - deploy or build-harness changes
- Lighter workflow is fine for docs-only, content-only, and mechanical changes, but still run the relevant validation.
- Before push, the canonical local gate is `npm run check:pre-push`.

## Retrospectives

For non-trivial slices, add short learnings either:

- in the PR body under `Learnings`, or
- in a dated note under `docs/retrospectives/` when the lesson is likely to matter again

Keep it short:

- what went well
- what went wrong
- discovered during verification
- guardrails added
- follow-ups

## Merge Style

- Prefer pull requests over direct pushes to `main`.
- Prefer squash merge so `main` stays readable.
- If repository settings are available, protect `main` and require PR-based merges.
