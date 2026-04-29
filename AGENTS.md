# Agent instructions — Jinee Website (Next.js)

## End-of-task checklist

After every task that touches source files, **always run all three checks before reporting done**:

```bash
npm run lint
npm run type-check
npm test
```

Resolve all errors **and warnings** before finishing. Do not leave a task in a state where any of the three commands exits non-zero or prints new warnings compared to the baseline.

## Project overview

- **Stack**: Next.js 16.2.1 / React 19 / TypeScript / static export (`output: export`)
- **Root workspace**: `/Users/florianewald/Documents/01_git_projects/Jinee-website-nodejs`
- **Next.js app**: `src/` (root workspace is the Next.js project; `nextapp/` is a secondary reference copy)
- **Content**: JSON manifests in `src/content/portfolio/` validated by Zod schemas in `src/lib/portfolio-schemas.ts`
- **Image pipeline**: `assets-raw/{type}/{slug}/*.jpg` → `public/assets/{type}/{slug}/{slug}-800.webp`
- **Config constants**: `src/lib/constants.ts` (UI toggles, column counts, feature flags)

## Key commands

| Command | Purpose |
|---|---|
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript (`tsc --noEmit`) |
| `npm test` | Jest unit tests |
| `npm run validate:manifests` | Validate all JSON portfolio manifests |
| `npm run build` | Full production build (static export) |
