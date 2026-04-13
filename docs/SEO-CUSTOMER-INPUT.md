# SEO — Customer Input Needed

The following SEO improvements have been planned (see [SEO.md](SEO.md)) but require
information or decisions from Jinee before they can be implemented.

---

## 1. Social media profile URLs (SEO-3)

The Person structured data (used by Google for entity recognition / Knowledge Panel)
currently contains placeholder URLs. Please provide the exact profile URLs.

**Needed:**

| Platform | Current placeholder | Your actual URL |
|----------|---------------------|-----------------|
| Instagram | `https://www.instagram.com/jineechen/` | Confirm or correct the handle |
| LinkedIn | `https://www.linkedin.com/in/jineechen/` | Confirm or correct the handle |

**File to update**: `src/app/layout.tsx` — `sameAs` array in `personJsonLd`

---

## 2. Twitter / X handle (SEO-7)

The Twitter card metadata can include your handle so posts shared on X are attributed to you.

**Needed:**
- Do you have an active Twitter / X account? If yes, what is the handle (e.g. `@jineechen`)?

**File to update**: `src/app/layout.tsx` — uncomment and fill in `site`/`creator` in `twitter` metadata

---

## 3. Homepage OG image (SEO-5)

When your site or any page without a specific image is shared on social media (WhatsApp,
Telegram, X, LinkedIn, Facebook), a branded preview image should appear.
Without one, the link preview is blank.

**Needed:**
- A landscape image (1200 × 630 px, JPG or PNG) that would represent the homepage.
  Ideal: your portrait photo or a striking hero shot with your name as text overlay.
  You can also ask to auto-generate this from one of the existing hero photos.
- Place the file at: `public/assets/photos/og-home.jpg`

**File to update**: `src/app/layout.tsx` — add `openGraph.images`

---

## 4. Per-project OG images (SEO-18)

Each project page uses a 800px wide WebP thumbnail as the OG image. Ideal OG images
are 1200 × 630 px (landscape). Landscape shots crop fine, but portrait shots may look
odd when shared.

**Question:** Would you like to add dedicated 1200×630 OG images for projects?
- Option A: Accept the current 800px thumbnails (good enough for most cases)
- Option B: Add the 1200w size to the image pipeline and set a specific `ogImage` per project

---

## 5. Expanded project descriptions (SEO-6)

Several project descriptions are very short (under 60 characters). These show up as the
grey preview line in Google search results. Longer, more descriptive text leads to more
clicks.

**Projects that need better descriptions:**

| Project | Current description (characters) | Target: 120–160 characters |
|---------|----------------------------------|----------------------------|
| `20260124-west-side-art-tour` | "NTU Museum Walking Tour West Side Art." (38) | Add location, context, type of photography |
| `20260201-mediacorp-2026-cny-road-show` | "Event photography coverage of Mediacorp's 2026 Chinese New Year Road Show." (75) | Could be expanded with atmosphere/scope |
| `event-photography` | "Professional event photography portfolio showcasing corporate events, conferences, and celebrations." (98) | Close, but could include location (Singapore) |
| `travel-photography` | "Travel photography from around the world — landscapes, cultures, and adventures." (81) | Good length; consider adding Jinee's name |

**File to update**: `src/content/portfolio/photography.json` — `description` field per project

The same applies to video and social media projects — complete descriptions improve SEO
for those portfolio pages too.

---

## 6. Video upload dates (SEO-11)

Video pages have structured data (VideoObject) that Google uses for Video carousels in
search results. Google requires a real `uploadDate` for each video. Currently the site
falls back to `"2023-01-01"` when no date is set.

**Needed**: For each video project, provide the approximate publish / upload date (ISO format: `YYYY-MM-DD`).

**File to update**: `src/content/portfolio/videography.json` — add `"uploadDate": "YYYY-MM-DD"` to each `videos[]` entry

---

## 7. LocalBusiness structured data (SEO-12)

Adding a `ProfessionalService` schema can help Jinee appear in local search results
("photographer singapore", "videographer singapore") and Google Maps.

**Needed:**
- Business phone number (optional, but helps for local SEO)
- Preferred service area(s): Singapore only, or also Taiwan / international?
- Price range indicator (e.g. "$$" or "from SGD 500")
- Any certifications or awards to list?

---

## 8. Imprint page — personal details to confirm

**File**: `src/app/imprint/page.tsx`

The imprint currently lists:
- Owner: **Jinee Chen & Florian Ewald**
- Location: **Singapore & Taipei**
- Email: **hello@jineechen.com**

**Questions:**
1. Should Florian remain listed as co-owner on the live site, or should it be Jinee Chen only?
2. Is there a registered business name (sole proprietorship, studio name, etc.)?
3. Is a physical address required (depends on whether the site targets German/EU visitors; if so, a Impressum with full address is legally required under German law)?
4. Should a phone number be listed?

---

## 9. Google Search Console setup (SEO-19)

To monitor crawl health, rankings, and Core Web Vitals after launch:

**Actions needed from Jinee:**
1. Access to the domain's DNS panel (or the website FTP root) to add a verification record
2. Decision on which Google account to connect GSC to

Once deployed, this is a ~15 minute setup. I can handle the technical steps once you have access.

---

## Summary — input needed

| # | Item | Effort once input received |
|---|------|---------------------------|
| 1 | Social media profile URLs | 5 min |
| 2 | Twitter/X handle | 5 min |
| 3 | Homepage OG image (design/photo) | 30 min |
| 4 | Per-project OG image decision | Depends on choice |
| 5 | Expanded project descriptions | 1–2 hr writing |
| 6 | Video upload dates | 30 min |
| 7 | LocalBusiness details | 30 min |
| 8 | Imprint ownership details | 10 min |
| 9 | Google Search Console — domain access | 15 min |
