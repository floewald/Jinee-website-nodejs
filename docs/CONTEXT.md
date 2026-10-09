# Current context

This is a compact orientation document for contributors and coding agents. It records current facts only; historical decisions belong in migration notes, plans, and retrospectives.

## Product and architecture

- Jinee Chen's portfolio is a statically exported Next.js application deployed by FTP.
- The frontend is Next.js 16, React 19, TypeScript, and Panda CSS. Tailwind v4 supplies only the base reset; do not add Tailwind utility classes to JSX.
- PHP in `backend/` provides the contact form and protected downloads.
- Portfolio content is versioned JSON in `src/content/portfolio/`, validated by Zod schemas in `src/lib/portfolio-schemas.ts`.
- Raw images become generated WebP assets through the scripts in `scripts/`; do not manually edit generated files in `public/assets/`.

## Working conventions

- Keep a change small and reviewable. Prefer one focused branch and PR per issue or slice; squash merge to `main`.
- Use TDD first or early for behavioural, routing, schema, build, deployment, and bug-fix changes. Do not invent tests for purely editorial or mechanical work.
- Update the smallest canonical document when a change affects behaviour, architecture, workflow, or debugging.
- Run the narrowest relevant validation while iterating. Before reporting a source change complete, run `npm run lint`, `npm run type-check`, and `npm test`.

## Quality commands

| Command | Use |
| --- | --- |
| `npm run docs:lint` | Markdown structure/style |
| `npm run docs:check` | Offline documentation consistency: local links, commands, versions, and retired workflow references |
| `npm run validate:manifests` | Portfolio and image manifest integrity |
| `npm run check:pre-push` | Full local push gate |

External URL availability is checked separately on a schedule. It should inform follow-up work, not block an otherwise-ready feature review.

## Boundaries

- `nextapp/` is a separate reference scaffold. Root documentation checks intentionally exclude it.
- TinaCMS is deferred indefinitely. The supported editing workflow is JSON plus the project scaffolding command.
- Keep `docs/README.md` as the curated documentation map; do not add an auto-generated documentation tree.
