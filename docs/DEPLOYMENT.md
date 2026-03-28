# Deployment Guide

How to build and deploy the site. For local development see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Key concept — no Node.js needed on the server

This project uses Next.js with `output: 'export'`. When you run `npm run build`, Next.js compiles everything into a folder called `out/` that contains only plain HTML, CSS, JavaScript, and image files — exactly what a browser needs. The server just stores and serves those files. **Node.js does not need to be installed on the web server.** Any host that can serve static files (Apache, Nginx, shared hosting) works fine.

The only server-side code is the PHP backend in `backend/` (contact form, download system). That requires PHP 7.4+, which most shared hosts already provide.

---

## Overview

| Part | Built from | Deployed to |
|------|-----------|-------------|
| Static site | `out/` (Next.js export) | FTP → document root (`/`) |
| PHP backend | `backend/` | FTP → document root `/backend/` |

---

## Option A — Automatic deploy via GitHub Actions (recommended)

Every time you push a commit to the `main` branch, GitHub builds the site and FTPs it to the server automatically. **You never need to run a manual build or FTP upload.**

### Step 1 — Add your FTP credentials as GitHub Secrets

Go to your repository on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these secrets:

**FTP credentials (core)**

| Secret name | Value |
|-------------|-------|
| `FTP_SERVER` | Your FTP hostname, e.g. `ftp.jineechen.com` |
| `FTP_USERNAME` | Your FTP username |
| `FTP_PASSWORD` | Your FTP password |
| `FTP_SERVER_DIR` | Remote path for the static site, e.g. `/public_html/` (must end with `/`) |
| `FTP_BACKEND_DIR` | Remote path for the generated `download_config.php`, **must be** `private/download/` (outside webroot, must end with `/`) |

**Download passwords** — one per downloadable project

| Secret name | Project |
|-------------|--------|
| `DL_PASS_WALKING_TOUR_LITTLE_INDIA` | Walking Tour Little India |
| `DL_PASS_20260124_WEST_SIDE_ART_TOUR` | West Side Art Tour |
| `DL_PASS_20260201_MEDIACORP_2026_CNY_ROAD_SHOW` | Mediacorp CNY Road Show |

> When you add a new downloadable project, add its matching `DL_PASS_<SLUG>` secret here and a corresponding line in `backend/download/download_config.template.php` and `.github/workflows/deploy.yml`.

> Secrets are **never** visible in logs or to other users — GitHub encrypts them at rest.

### Step 2 — Push to main

That's it. The workflow file is already at `.github/workflows/deploy.yml`.

```bash
git add -A
git commit -m "your message"
git push origin main
```

GitHub Actions will:

1. Install Node.js and project dependencies
2. Run `npm run build` to generate the `out/` folder
3. FTP-sync `out/` to your server, uploading only changed files

### What gets deployed automatically vs manually

| Content | Deployed automatically on push? | Notes |
|---------|--------------------------------|-------|
| HTML, CSS, JS | ✅ Yes | Every push to `main` |
| New/changed images | ✅ Yes (if `assets-raw/` changed) | The `deploy-assets` job only runs when image source files change |
| `backend/download/download_config.php` | ✅ Yes (generated from template) | Passwords injected from GitHub Secrets at deploy time |
| `backend/` PHP files | ❌ No | Upload manually via FTP — see below |
| `backend/contact/config.php` | ❌ Never (not in git) | Upload manually — contains SMTP credentials |

### Viewing deploy status

In the repository on GitHub, click the **Actions** tab. Each push shows a workflow run. Green checkmark = success. Click any run to see the full log.

---

## Option B — Manual deploy via FTP

Use this when you need to deploy a one-off change without pushing to git, or when setting up GitHub Actions for the first time.

### Step 1: Build WebP images (only if assets changed)

```bash
npm run build:images
```

Skip this step if no new images were added.

### Step 2: Build the static site

```bash
npm run build
```

This generates the `out/` directory. After a successful build it contains:

```
out/
├── index.html
├── portfolio/
│   ├── index.html
│   ├── photography/
│   │   ├── index.html
│   │   └── <slug>/index.html    (one per project)
│   ├── video/...
│   └── social-media/...
├── imprint/index.html
├── privacy/index.html
├── assets/                      (images, fonts)
├── _next/                       (bundled JS, CSS)
├── manifest.json
└── robots.txt
```

### Step 3: Upload via FTP client

**Cyberduck / FileZilla (GUI):**

1. Connect to your FTP server
2. Navigate to your document root (e.g. `/public_html/`)
3. Drag the **contents** of `out/` into the document root
4. For the PHP backend: drag the contents of `backend/` to `/public_html/backend/`

> **Skip images if unchanged.** `out/assets/` is large. If you did not run `build:images`, skip uploading `assets/` — the files on the server are already current.

**`lftp` (command line):**

```bash
lftp -u YOUR_USERNAME,YOUR_PASSWORD ftp.your-server.com
lftp> mirror -R out/ /public_html/
lftp> mirror -R backend/ /public_html/backend/
lftp> bye
```

### Step 4: Install PHP vendor dependencies (only if backend changed)

```bash
cd backend
composer install --no-dev --optimize-autoloader
cd ..
```

Then upload the new `backend/vendor/` to the server.

---

## URL Redirects (`.htaccess`)

The original site used `.html` extensions (`/privacy.html`, `/imprint-en.html`). The new site uses clean paths (`/privacy/`, `/imprint/`). Add redirect rules to prevent broken bookmarks and preserve SEO link juice.

Create or update `/public_html/.htaccess` on the server:

```apache
Options -Indexes
RewriteEngine On

# Redirect old .html URLs to new clean paths
RewriteRule ^privacy\.html$ /privacy/ [R=301,L]
RewriteRule ^imprint-en\.html$ /imprint/ [R=301,L]

# Next.js static export — serve index.html for clean URLs
# (most static hosts handle this automatically)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}/index.html -f
RewriteRule ^(.*)$ $1/index.html [L]
```

> **Note**: If the server already serves `index.html` for directory requests (most do), the last rule may not be needed.

---

## Post-Deploy Smoke Test

After every deployment, verify the following manually:

**Static pages**

- [ ] Homepage loads (`/`)
- [ ] Portfolio hub loads (`/portfolio/`)
- [ ] One photography project loads (e.g., `/portfolio/photography/20260124-west-side-art-tour/`)
- [ ] One video project loads (e.g., `/portfolio/video/stuck-low-pay/`)
- [ ] Imprint page loads (`/imprint/`)
- [ ] Privacy page loads (`/privacy/`)
- [ ] Old URLs redirect: `/privacy.html` → `/privacy/`

**Interactive features**

- [ ] Mobile hamburger menu opens/closes
- [ ] Gallery lightbox opens on image click
- [ ] Slideshow autoplay on homepage project cards
- [ ] Contact form submits and shows success message
- [ ] Cookie consent banner appears, Accept/Reject works

**Download system** (if applicable)

- [ ] Download button appears on enabled projects
- [ ] Modal opens with password field
- [ ] Wrong password shows error
- [ ] Correct password triggers ZIP download

---

## Rollback

If a deployment breaks the site:

1. Re-upload the previous `out/` directory (keep a local copy of the last known-good build, or rebuild from `Jinee_website/` in an emergency)
2. For a quick rollback of the static site only, the original `Jinee_website/` folder contents can be uploaded to the document root temporarily

---

## PHP Backend Configuration on Server

The following server-side config files contain credentials and are **not committed to git**:

| File | How it gets on the server |
|------|---------------------------|
| `backend/contact/config.php` | Upload manually via FTP — see `config.example.php` |
| `backend/download/download_config.php` | **Auto-generated** by the `deploy-backend-config` Actions job from `download_config.template.php` + GitHub Secrets |

`backend/contact/config.php` must still be uploaded manually. `backend/download/download_config.php` is now handled automatically — you only need to keep the GitHub Secrets up to date.

The `backend/download/rate-limit/` and `backend/contact/logs/` directories must be **writable** by the PHP process on the server:

```bash
# On the server (via SSH or FTP permissions)
chmod 755 backend/download/rate-limit/
chmod 755 backend/contact/logs/
```
