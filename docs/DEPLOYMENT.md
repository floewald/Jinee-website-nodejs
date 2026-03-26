# Deployment Guide

How to build and deploy the site via FTP. For local development see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Overview

The deployment consists of two parts:

| Part | Source | Destination on server |
|------|--------|-----------------------|
| Static site | `out/` (Next.js export) | FTP → document root (`/`) |
| PHP backend | `backend/` | FTP → document root `/backend/` |

The server only needs **PHP 7.4+** and **file write access** (for rate-limit counters, logs). Node.js is **not** needed.

---

## Production Build

### Step 1: Build WebP images (only if assets changed)

```bash
npm run build:images
```

This converts new/changed images in `assets-raw/` to `public/assets/`. Skip this step if no new images were added.

### Step 2: Build the static site

```bash
npm run build
```

This runs `next build` with `output: 'export'` and outputs everything to the `out/` directory.

After a successful build, `out/` contains:
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

### Step 3: Install PHP vendor dependencies (only if backend changed)

```bash
cd backend
composer install --no-dev --optimize-autoloader
cd ..
```

---

## FTP Upload

### What to upload

| Local path | FTP destination | Notes |
|------------|----------------|-------|
| `out/` contents | `/` (document root) | Every file in `out/`, recursively |
| `backend/` contents | `/backend/` | PHP files + vendor/ |
| `out/assets/` | `/assets/` | Only if images changed (large, skip to save time) |

> **Images**: `out/assets/` contains all WebP images and is very large. If you didn't run `build:images`, the assets on the server are already up to date — skip uploading `assets/` to save time.

### Recommended FTP client: Cyberduck or FileZilla

Using Cyberduck (macOS):
1. Connect to your FTP server
2. Navigate to document root
3. Upload: drag `out/` contents to `/` on server
4. Upload: drag `backend/` contents to `/backend/` on server

Using `lftp` (command line):
```bash
lftp -u username,password ftp.your-server.com
lftp> mirror -R out/ /public_html/
lftp> mirror -R backend/ /public_html/backend/
lftp> bye
```

### Automating with rsync over SFTP (if server supports SSH)

```bash
# Upload static site
rsync -avz --delete out/ user@server.com:/public_html/

# Upload backend
rsync -avz --delete backend/ user@server.com:/public_html/backend/
```

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

The following server-side config files are **not committed to git** (they contain credentials):

| File | Purpose | Example |
|------|---------|---------|
| `backend/contact/config.php` | SMTP credentials, recipient email | See `config.example.php` |
| `backend/download/download_config.php` | Project passwords, file paths | See `download_config.example.php` |

These files must be uploaded manually to the server or maintained via a separate secure channel.

The `backend/download/rate-limit/` and `backend/contact/logs/` directories must be **writable** by the PHP process on the server:

```bash
# On the server (via SSH or FTP permissions)
chmod 755 backend/download/rate-limit/
chmod 755 backend/contact/logs/
```
