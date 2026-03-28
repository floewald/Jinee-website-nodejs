# Adding Portfolio Projects

Step-by-step guide for adding, updating, or removing projects from the portfolio. No prior coding experience needed for basic content changes.

---

## Before You Start

Make sure your development environment is running. If you haven't set it up yet, follow the [Development Guide](DEVELOPMENT.md) first.

The basic workflow for any content change is:

1. Add/edit the content (images + JSON config)
2. Run `npm run build` (this already runs `npm run build:images` first)
4. Deploy the new `out/` folder to the server

For faster iteration while editing images only, you can still run
`npm run build:images` directly before `npm run build`.

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

### Step 3: Add the photography project config

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
| `portfolioCard.previewImages` | Optional | Fallback array of 2–3 image paths for the card slideshow (uses `-800.webp`). Not normally needed — the card slideshow automatically uses all images from the project's `images.json` manifest. Only set this if you want to override and limit to specific images. |
| `showSlideshow` | Optional | `true` (default) adds an auto-advance full-image slideshow above the gallery on the project page. Set `false` to disable — recommended for large galleries where the top slideshow is not needed. |
| `visible` | Optional | Set `false` to hide the project entirely (default: `true`) |

For homepage hero/collage framing, each entry in
`src/content/portfolio/index-config.json` (`collageImages`) also supports
optional `objectPosition`.

- Keyword options: `center`, `top`, `bottom`, `left`, `right`,
  `center top`, `center bottom`, `left top`, `left bottom`,
  `right top`, `right bottom`
- Percentage options: `50%`, `50% 30%`, `center 30%`, `30% center`
- Default when omitted: `center`

Meaning of `center 30%`:

- First value (`center`) = horizontal anchor (X-axis)
- Second value (`30%`) = vertical anchor (Y-axis), measured from top to bottom
- So `center 30%` keeps the image centered horizontally and places the crop focus at 30% down from the top (slightly above vertical center)

> **Card slideshow vs page slideshow — key distinction:**
>
> - `portfolioCard.previewImages` controls the small cycling thumbnail on the *index/overview cards*
> - `showSlideshow` controls the large auto-advance strip shown *at the top of the project's own page*
> These are independent. You can have a card slideshow without a page slideshow or vice versa.

### Step 4: Enable downloads (optional)

If `enableDownload: true`, you need to wire up the password in three places:

**a) `backend/download/download_config.template.php`** — add a project entry with a placeholder token:

```php
'my-new-project' => [
    'folder'   => 'photography/my-new-project',
    'password' => '%%DL_PASS_MY_NEW_PROJECT%%',
    'visible'  => true,
],
```

Convention: replace hyphens with underscores and uppercase for the token name.

**b) `.github/workflows/deploy.yml`** — add the secret to the `deploy-backend-config` job.  
Inside the `env:` block add:

```yaml
DL_PASS_MY_NEW_PROJECT: ${{ secrets.DL_PASS_MY_NEW_PROJECT }}
```

And inside the Python script add:

```python
content = content.replace(
    '%%DL_PASS_MY_NEW_PROJECT%%',
    os.environ['DL_PASS_MY_NEW_PROJECT'])
```

**c) GitHub Secrets** — go to **Settings → Secrets and variables → Actions → New repository secret**  
and add `DL_PASS_MY_NEW_PROJECT` with a strong, unique password.

On the next push to `main`, GitHub Actions generates and uploads `download_config.php` automatically.

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

Run `npm run build` to generate WebP versions and update the static export.
For image-only iteration, `npm run build:images` is also available.

### Step 3: Add the video project config

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

Place images in `assets-raw/social-media/my-social-project/`, then run
`npm run build` (or `npm run build:images` for image-only iteration).

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

### UI settings (now configurable)

You can now control border radius and homepage collage hover zoom from central settings:

- **Global border radius toggle (on/off):**
  - File: `src/app/layout.tsx`
  - Setting: `const NO_RADIUS = true;`
  - `true` removes rounded corners globally, `false` enables them.
- **Global radius value scale:**
  - File: `src/app/globals.css`
  - Base token: `--radius-site`
  - Derived tokens: `--radius-sm`, `--radius-md`, `--radius-lg`
  - Change `--radius-site` to tune most corner radii site-wide.
- **Homepage masonry collage hover zoom:**
  - File: `src/app/globals.css`
  - Selector: `.gallery-cols .gallery-item:hover .gallery-img`
  - Property: `transform: scale(1.1)`
  - Adjust this scale value for stronger/weaker zoom effect.

Note: the play overlay remains circular even when `NO_RADIUS` is enabled.

Once [Phase 7 (TinaCMS)](MIGRATION-PROGRESS.md) is complete, these will be editable via the visual editor.
