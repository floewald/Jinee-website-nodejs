# Development Guide

Full local setup and day-to-day development workflow. See [README.md](../README.md) for a shorter quick-start.

---

## System Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) or `brew install node` |
| npm | 10+ | bundled with Node.js |
| PHP | 7.4+ | `brew install php` |
| Composer | any | [getcomposer.org](https://getcomposer.org/) or `brew install composer` |
| cwebp | any | `brew install webp` (preferred for image pipeline) |
| ImageMagick | 7+ | `brew install imagemagick` (fallback for image pipeline) |

---

## First-Time Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd Jinee-website-nodejs
npm install
```

### 2. Configure PHP backend

The backend ships with example config files. You must copy and fill them in before PHP endpoints work:

```bash
# Contact form SMTP settings
cp backend/contact/config.example.php backend/contact/config.php

# Download system: project passwords, paths, visibility
cp backend/download/download_config.example.php backend/download/download_config.php
```

Edit `backend/contact/config.php`:
```php
<?php
return [
    'smtp' => [
        'host' => 'smtp.your-provider.com',
        'port' => 587,
        'username' => 'your@email.com',
        'password' => 'your-smtp-password',
    ],
    'to_email' => 'recipient@example.com',
    'to_name' => 'Jinee Chen',
];
```

> **Never commit `config.php` or `download_config.php`.** They are `.gitignore`d.

### 3. Install PHP dependencies

```bash
cd backend
composer install
cd ..
```

### 4. Build images (if running image pipeline for the first time)

Only needed if you have images in `assets-raw/` that haven't been converted yet:

```bash
npm run build:images
```

Generate a specific project only (faster during iteration):

```bash
bash scripts/build-images.sh --type video --slug re-old-times
```

This runs `scripts/build-images.sh` which:
1. Converts JPG/PNG in `assets-raw/` → WebP at 320, 800, 1600px widths in `public/assets/`
2. Generates `images.json` manifest per project folder

---

## Running the Development Environment

Two processes run side-by-side during development:

**Terminal 1 — Next.js dev server (Turbopack)**
```bash
npm run dev
# → http://localhost:3000
```

**Terminal 2 — PHP backend**
```bash
php -S localhost:8080 -t backend/
# → http://localhost:8080
```

The Next.js app makes backend calls to `http://localhost:8080/contact/...` and `http://localhost:8080/download/...` during development. This is configured via the `NEXT_PUBLIC_BACKEND_URL` environment variable (defaults to empty string in production, where backend lives at the same origin).

> **CORS**: `localhost` is already whitelisted in all PHP files. CSRF sessions should work cross-port in local dev.

Create a `.env.local` file:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

---

## Project Structure for Developers

### Adding a new page

Create `src/app/your-page/page.tsx`. It will be exported as `out/your-page/index.html` with `trailingSlash: true`.

Export a `metadata` object (or `generateMetadata` function) at the top of the file for SEO.

### Adding a new component

1. Create the component in `src/components/<category>/ComponentName.tsx`
2. **Write the test first**: `src/components/<category>/__tests__/ComponentName.test.tsx`
3. Implement the component to make the test pass

For client-side interactivity (state, effects, browser APIs), add `'use client'` at the top. Server components (default, no `'use client'`) cannot use hooks or event handlers.

### Environment variables

All env vars must be prefixed with `NEXT_PUBLIC_` to be available in the browser (static export). Since there is no Node.js runtime on the production server, there are **no server-side env vars** — secrets live only in PHP config files.

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | `""` (same origin) | PHP backend base URL (override for local dev) |

---

## Testing

### Unit & Component tests (Jest + React Testing Library)

```bash
npm run test              # run all tests once
npm run test:watch        # watch mode (re-runs changed tests)
npm run test:coverage     # generate coverage report in coverage/
```

Test files live alongside the code:
```
src/components/gallery/
├── GalleryGrid.tsx
└── __tests__/
    └── GalleryGrid.test.tsx

src/hooks/
├── useSwipe.ts
└── __tests__/
    └── useSwipe.test.ts
```

**TDD workflow**: Write the test file first (it will fail), implement the component/hook to make it green, then refactor.

### E2E tests (Playwright)

```bash
# First build the static site (or keep dev server running)
npm run dev &

# Run Playwright tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Show full browser (headed mode)
npx playwright test --headed

# Open last failure report
npx playwright show-report
```

E2E tests target `http://localhost:3000` (configurable in `playwright.config.ts`).

---

## Pre-commit Hooks

[Husky](https://typicode.github.io/husky/) runs `lint-staged` automatically before each `git commit`. For staged `.ts`/`.tsx` files, it runs:

1. `eslint --fix` — auto-fixes lint issues on staged files
2. `jest --bail --findRelatedTests` — runs only tests related to changed files (stops on first failure)

To skip the pre-commit hook in an emergency:
```bash
git commit --no-verify -m "your message"  # use sparingly
```

---

## Code Style

- **No class naming conflicts**: Tailwind utility classes are co-located with JSX markup; no separate CSS files except for complex animations
- **Component files**: PascalCase (`GalleryGrid.tsx`)
- **Hooks**: camelCase, `use` prefix (`useSwipe.ts`)
- **Types**: `src/types/*.ts`, interfaces over `type` aliases for object shapes
- **Imports**: Use absolute imports from `@/components/...`, `@/hooks/...`, `@/lib/...` (configured in `tsconfig.json`)

---

## When to Re-run Image Pipeline

Run `npm run build:images` when:
- New raw images are added to `assets-raw/`
- Existing raw images are replaced

Do **not** run it repeatedly for other changes — it only processes new/modified source files, but can take several minutes on large galleries.

Do **not** edit files directly in `public/assets/` — they are generated and may be overwritten.

---

## VS Code Recommended Extensions

Install the recommended extensions for the best DX:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Prettier** (`esbenp.prettier-vscode`)
- **TypeScript** (built-in, ensure `typescript.tsdk` is set to workspace version)
- **Playwright Test** (`ms-playwright.playwright`)

---

## Debugging

### Next.js errors

The dev server shows a browser overlay for runtime errors. For build errors:
```bash
npm run build 2>&1 | less
```

### PHP errors

PHP writes errors to `stderr` when running with `php -S`. You'll see them in the terminal running the PHP server. To increase verbosity:
```bash
php -d display_errors=1 -d error_reporting=E_ALL -S localhost:8080 -t backend/
```

Log files:
- Contact form sends: `backend/contact/logs/send.log`
- Download attempts: `backend/download/logs/download_attempts.log`

### TypeScript errors

```bash
npm run type-check
```
