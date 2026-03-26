# Jinee Chen — Portfolio Website

Personal portfolio website for **Jinee Chen**, a female photographer and videographer based in Singapore. Built with Next.js 15, TypeScript, and Tailwind CSS. Exported as a pure static site and deployed via FTP.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) — App Router |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| CMS (optional) | [TinaCMS](https://tina.io/) — file-based visual editing, Phase 7 |
| Backend | PHP 7+ (contact form, download system) — served from `backend/` |
| Email | PHPMailer via SMTP |
| Testing | Jest + React Testing Library + Playwright |
| Static export | `next build` → `out/` directory → FTP upload |

---

## Prerequisites

- **Node.js** 20 or higher (`node -v`)
- **npm** 10 or higher (`npm -v`)
- **PHP** 7.4+ (`php -v`) — local development of backend
- **Composer** (`composer --version`) — PHP dependency manager
- **cwebp** or **ImageMagick** — for image pipeline (only needed when adding new images)
  - macOS: `brew install webp` or `brew install imagemagick`

---

## Quick Start

```bash
# 1. Install Node dependencies
npm install

# 2. Configure PHP backend (copy example configs, fill in SMTP credentials)
cp backend/contact/config.example.php backend/contact/config.php
cp backend/download/download_config.example.php backend/download/download_config.php
# Then edit both files with your actual credentials/settings

# 3. Build WebP images (only needed when new images are added to assets-raw/)
npm run build:images

# 4. Start development server
npm run dev
# → Next.js runs at  http://localhost:3000
# → For PHP endpoints, run PHP dev server in a second terminal:
#   php -S localhost:8080 -t backend/
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server (Turbopack, http://localhost:3000) |
| `npm run build` | Full production build: images → Next.js → static `out/` |
| `npm run build:images` | Run image pipeline only (WebP conversion + manifests) |
| `npm run export` | Alias for `next build` with static output |
| `npm run lint` | ESLint across all TS/TSX files |
| `npm run type-check` | TypeScript compiler check (no emit) |
| `npm run test` | Run Jest unit + component tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run tina` | Start TinaCMS visual editor at http://localhost:4001/admin |

---

## Project Structure

```
.
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (header, footer, fonts, metadata)
│   │   ├── page.tsx           # Homepage (/, all 5 sections)
│   │   ├── portfolio/
│   │   │   ├── page.tsx       # Portfolio hub
│   │   │   ├── photography/[slug]/page.tsx
│   │   │   ├── video/[slug]/page.tsx
│   │   │   └── social-media/[slug]/page.tsx
│   │   ├── imprint/page.tsx
│   │   └── privacy/page.tsx
│   ├── components/
│   │   ├── layout/            # Header, Footer, Navigation, Logo
│   │   ├── gallery/           # GalleryGrid, Lightbox, GallerySelection
│   │   ├── slideshow/         # Slideshow (project cards)
│   │   ├── contact/           # ContactForm
│   │   ├── download/          # DownloadModal, DownloadToolbar
│   │   ├── video/             # YouTubeEmbed (lazy-loaded)
│   │   └── ui/                # Button, CookieBanner, SkipLink
│   ├── hooks/
│   │   ├── useSwipe.ts        # Touch swipe detection
│   │   ├── useLightbox.ts     # Lightbox open/close/navigate state
│   │   ├── useIntersection.ts # IntersectionObserver wrapper
│   │   └── useMediaQuery.ts   # Responsive breakpoint boolean
│   ├── lib/
│   │   ├── portfolio-config.ts  # Typed project config loader
│   │   ├── image-utils.ts       # WebP URL helpers (thumb/md/lg)
│   │   └── constants.ts         # Site-wide constants
│   ├── types/
│   │   └── portfolio.ts         # TypeScript types for portfolio data
│   └── content/
│       ├── portfolio/
│       │   ├── photography.json  # Photography project definitions
│       │   ├── video.json        # Video project definitions
│       │   └── social-media.json # Social media project definitions
│       └── site.json             # Global config (name, social links, etc.)
├── public/
│   ├── assets/                # Images, fonts (symlinked from Jinee_website/assets/)
│   ├── manifest.json          # PWA manifest
│   └── robots.txt
├── backend/                   # PHP backend (FTP-deployed alongside static output)
│   ├── contact/               # Contact form, CSRF tokens
│   ├── download/              # Download system, rate limiting
│   └── manifest.php           # Image manifest endpoint
├── scripts/                   # Image build pipeline (reused from original)
│   ├── build-images.sh
│   ├── generate-webp.sh
│   └── generate-manifests.js
├── e2e/                       # Playwright end-to-end tests
├── docs/                      # Developer & contributor documentation
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   ├── ADDING-PROJECTS.md
│   └── MIGRATION-PROGRESS.md
├── Jinee_website/             # Original site (kept as reference)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Documentation

| Document | Audience | Purpose |
|----------|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Developers | Component hierarchy, data flow, image pipeline, PHP endpoints |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Developers | Full local setup, running PHP side-by-side, debugging |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Developers | FTP build & deploy, `.htaccess` redirects, smoke test |
| [docs/ADDING-PROJECTS.md](docs/ADDING-PROJECTS.md) | Content editors | Step-by-step guide for adding new portfolio projects |
| [docs/MIGRATION-PROGRESS.md](docs/MIGRATION-PROGRESS.md) | Developers | Live progress tracker for the migration from the original site |

---

## Live Site

[https://www.jineechen.com](https://www.jineechen.com)
