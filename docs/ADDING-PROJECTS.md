# Adding Portfolio Projects

Step-by-step guide for adding, updating, or removing projects from the portfolio. No prior coding experience needed for basic content changes.

---

## Before You Start

Make sure your development environment is running. If you haven't set it up yet, follow the [Development Guide](DEVELOPMENT.md) first.

The basic workflow for any content change is:

1. Add/edit the content (images + JSON config)
2. Run `npm run build:images` (only if you added new images)
3. Run `npm run build`
4. Deploy the new `out/` folder to the server

---

## Adding a Photography Project

### Step 1: Add the original images

Create a new folder for your project inside `assets-raw/photography/`:

```
assets-raw/
└── photography/
    └── my-new-project/          ← create this
        ├── IMG_001.jpg
        ├── IMG_002.jpg
        └── ...
```

**Image requirements:**
- Format: JPG or PNG
- Resolution: at least 1600px on the long edge (for full-screen lightbox quality)
- Filenames: alphanumeric, hyphens, underscores — no spaces

### Step 2: Generate WebP images

```bash
npm run build:images
```

This creates three sizes per image in `public/assets/photography/my-new-project/`:
- `IMG_001-320.webp` — thumbnail (320px wide)
- `IMG_001-800.webp` — medium / slideshow (800px wide)
- `IMG_001-1600.webp` — full-size / lightbox (1600px wide)

It also generates a `images.json` manifest in the folder — the gallery reads this file to know which images to show.

### Step 3: Add the project config

Open `src/content/portfolio/photography.json` and add a new entry to the JSON array:

```json
{
  "type": "photography",
  "slug": "my-new-project",
  "title": "Client Name | Project Title",
  "description": "Short description for search engines (120–160 characters).",
  "heading": "📍 Singapore | Event Photography",
  "ogImage": "https://jineechen.com/assets/photography/my-new-project/IMG_001-800.webp",
  "enableDownload": false,
  "imageCount": 30,
  "portfolioCard": {
    "cardTitle": "My New Project",
    "thumbnail": "/assets/photography/my-new-project/IMG_001-800.webp",
    "order": 7
  }
}
```

**Field reference:**

| Field | Required | Notes |
|-------|----------|-------|
| `type` | ✅ | Always `"photography"` |
| `slug` | ✅ | URL-safe, e.g. `"my-new-project"` (no spaces, lowercase, hyphens) |
| `title` | ✅ | Page `<title>` tag — shown in browser tab and Google results |
| `description` | ✅ | Meta description for SEO (120–160 chars) |
| `heading` | ✅ | Large heading shown at top of the project page |
| `ogImage` | ✅ | Full URL (with `https://jineechen.com`) used for social media sharing previews |
| `enableDownload` | ✅ | `true` to show the Download button; `false` to hide it |
| `downloadPassword` | Only if `enableDownload: true` | Password clients use to download files |
| `imageCount` | ✅ | Number of images (used for structured data) |
| `portfolioCard` | Optional | Shows this project as a card on the portfolio category page |
| `portfolioCard.cardTitle` | Only if `portfolioCard` | Title shown below the card thumbnail |
| `portfolioCard.thumbnail` | Only if `portfolioCard` | Card thumbnail image path (use `-800.webp`) |
| `portfolioCard.order` | Only if `portfolioCard` | Lower numbers appear first |
| `portfolioCard.previewImages` | Optional | Array of 2–3 image paths for the card slideshow (uses `-800.webp`). When provided, the card auto-cycles through the images with a staggered interval. Omit for a static thumbnail. |
| `showSlideshow` | Optional | `true` (default) adds an auto-advance full-image slideshow above the gallery on the project page. Set `false` to disable — recommended for large galleries where the top slideshow is not needed. |
| `visible` | Optional | Set `false` to hide the project entirely (default: `true`) |

> **Card slideshow vs page slideshow — key distinction:**
> - `portfolioCard.previewImages` controls the small cycling thumbnail on the *index/overview cards*
> - `showSlideshow` controls the large auto-advance strip shown *at the top of the project's own page*
> These are independent. You can have a card slideshow without a page slideshow or vice versa.

### Step 4: Enable downloads (optional)

If `enableDownload: true`, you also need to register the project in the PHP download config:

Open `backend/download/download_config.php` and add an entry:

```php
'my-new-project' => [
    'folder' => 'photography/my-new-project',
    'password' => 'your-secure-password',
    'visible' => true,
],
```

> **Keep passwords secure.** This file is not committed to git. Set a strong, unique password per project.

### Step 5: Build and check

```bash
npm run build
```

Open `out/portfolio/photography/my-new-project/index.html` in your browser to preview the result before deploying.

---

## Adding a Video Project

### Step 1: Upload to YouTube

Upload the video(s) to YouTube and note the video ID from the URL:
`https://www.youtube.com/watch?v=`**`dQw4w9WgXcQ`** ← this is the ID

### Step 2: Add a thumbnail image (optional)

If you want a custom thumbnail for the project (instead of the YouTube auto-thumbnail), add it:
```
assets-raw/video/my-video-project/thumbnail.jpg
```
Run `npm run build:images` to generate WebP versions.

### Step 3: Add the project config

Open `src/content/portfolio/video.json` and add a new entry to the JSON array:

```json
{
  "type": "video",
  "slug": "my-video-project",
  "title": "Client Name | Video Series Title",
  "description": "Short description (120–160 chars).",
  "longDescription": "Longer intro paragraph shown at the top of the project page. Can be multiple sentences.",
  "heading": "📍 Singapore | Producer | Director | Videographer",
  "ogImage": "https://jineechen.com/assets/video/my-video-project/thumbnail-800.webp",
  "videos": [
    {
      "title": "Episode 1: Full Episode Title Here",
      "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "uploadDate": "2026-03-01T00:00:00+08:00"
    },
    {
      "title": "Episode 2: Another Episode",
      "embedUrl": "https://www.youtube.com/embed/ANOTHER_ID",
      "uploadDate": "2026-03-08T00:00:00+08:00"
    }
  ],
  "portfolioCard": {
    "cardTitle": "Short Card Title",
    "thumbnail": "/assets/video/my-video-project/thumbnail-800.webp",
    "order": 7
  }
}
```

**Notes:**
- `embedUrl` format: `https://www.youtube.com/embed/{VIDEO_ID}` — replace `{VIDEO_ID}` with the YouTube ID
- `uploadDate` format: ISO 8601 date and time with timezone (`+08:00` for Singapore time)
- Videos are shown in the order listed in the `videos` array
- `portfolioCard` is optional — omit if you don't want a card on the portfolio category page
- `portfolioCard.previewImages`: optional array of 2–3 image paths (use `-800.webp`). When provided, the card auto-cycles through the images. If the project folder has multiple `*-800.webp` thumbnails, add up to 3 here.
- `showSlideshow` is not used for video projects (video pages show YouTube embeds, not a photo slideshow)

### Step 4: Build

```bash
npm run build
```

---

## Adding a Social Media Project

### Step 1: Decide content type

Social media projects can be either:
- **Gallery** (`hasGallery: true`) — shows a curated image grid, same as photography
- **Custom** (`hasGallery: false`) — shows a custom text/HTML message (e.g., link to Instagram)

### Step 2: Add images (if gallery)

Place images in `assets-raw/social-media/my-social-project/` and run `npm run build:images`.

### Step 3: Add the project config

Open `src/content/portfolio/social-media.json` and add a new entry to the JSON array:

**Gallery variant:**
```json
{
  "type": "social-media",
  "slug": "my-social-project",
  "title": "My Social Media Project",
  "description": "Short description.",
  "heading": "📱 Social Media | My Category",
  "ogImage": "https://jineechen.com/assets/social-media/my-social-project/img-001-800.webp",
  "hasGallery": true,
  "imageCount": 20
}
```

**Custom content variant:**
```json
{
  "type": "social-media",
  "slug": "ig-motivational",
  "title": "Motivational Content | Social Media",
  "description": "Social Media Content",
  "heading": "📱 Social Media | Motivational Content",
  "ogImage": "https://jineechen.com/assets/social-media/ig-motivational/preview-800.webp",
  "hasGallery": false,
  "customContent": "<p>Check out my content on <a href=\"https://www.instagram.com/\" target=\"_blank\" rel=\"noopener\">Instagram</a>.</p>"
}
```

---

## Updating an Existing Project

To change the title, description, OG image, or heading of any project:

1. Open the relevant JSON file in `src/content/portfolio/`
2. Edit the fields you want to change
3. Run `npm run build` (no need to re-run `build:images` unless images changed)
4. Deploy the new `out/` to the server

---

## Hiding a Project

To temporarily hide a project without deleting it:

1. Open the relevant JSON file
2. Add `"visible": false` to the project entry
3. Rebuild and deploy

The page will no longer appear in category listings or the portfolio hub, but the URL will still resolve. To make it completely inaccessible, also remove or comment out the entry.

---

## Removing a Project

1. Delete the entry from the JSON config file
2. (Optional) Delete the images from `assets-raw/` and `public/assets/`
3. Rebuild and deploy

The page will no longer exist in `out/` after rebuilding. Old links will return 404.

---

## Using TinaCMS (Visual Editor)

Once [Phase 7 of the migration](MIGRATION-PROGRESS.md) is complete, you can edit all project metadata visually in the browser without touching JSON files:

```bash
npm run tina
# → Open http://localhost:4001/admin in your browser
```

The visual editor lets you:
- Add/edit/remove projects with a form interface
- Preview changes before saving
- All changes save directly to the JSON files (committed with Git)

The underlying JSON structure stays the same — you can always switch back to editing JSON directly.

---

## Site-wide Configuration

Global settings like the site name, email, Calendly link, and social media URLs are currently hardcoded in the relevant components (`Footer.tsx`, `ContactSection.tsx`, `AboutSection.tsx`). To change them, edit the component directly and rebuild.

Once [Phase 7 (TinaCMS)](MIGRATION-PROGRESS.md) is complete, these will be editable via the visual editor.
