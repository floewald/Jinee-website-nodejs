# SEO Audit & Improvement Plan

**Audited**: 2026-04-13  
**Site**: jineechen.com — static Next.js export, 38 pages  
**Stack**: Next.js 16 App Router metadata API, JSON-LD structured data, self-hosted fonts, WebP images

Items are ordered **quick wins first → longer-run investments last**.  
Each item states the exact file(s) to touch and the expected benefit.

---

## Quick Wins (≤ 1 hour each)

### SEO-1 — Fix page title duplication on About and Contact pages

**File**: `src/app/about/page.tsx`, `src/app/contact/page.tsx`  
**Problem**: The root layout defines `title.template: "%s | Jinee Chen"`. Child pages that already embed "Jinee Chen" in their title string produce doubled names:
- `"About — Jinee Chen"` → rendered as **"About — Jinee Chen | Jinee Chen"**
- `"Contact — Jinee Chen"` → rendered as **"Contact — Jinee Chen | Jinee Chen"**

**Fix**: Use only the segment that fills `%s`:
```ts
// about/page.tsx
export const metadata: Metadata = {
  title: "About",
  description: "...",
};

// contact/page.tsx
export const metadata: Metadata = {
  title: "Contact",
  description: "...",
};
```
**Impact**: Cleaner `<title>` tags; avoids Google truncating duplicated brand names.

---

### SEO-2 — Add a dedicated homepage `metadata` export with richer description

**File**: `src/app/page.tsx`  
**Problem**: The homepage has no `export const metadata` — it falls back to the root layout default, whose `description` is just the tagline (`"Videographer & Photographer based in Singapore"`). This is 50 characters; Google ideal is 120–160.

**Fix**:
```ts
export const metadata: Metadata = {
  title: "Jinee Chen — Videographer & Photographer in Singapore",
  description:
    "Jinee Chen is a Singapore-based videographer and photographer specialising in documentary storytelling, events, travel, and social media content creation.",
  openGraph: {
    title: "Jinee Chen — Videographer & Photographer in Singapore",
    description:
      "Documentary storytelling, event photography, travel, and social media content. Based in Singapore and Taipei.",
    images: [{ url: "/assets/photos/og-home.jpg", width: 1200, height: 630 }],
  },
};
```
**Impact**: Better click-through rate from search results; richer social media previews.

---

### SEO-3 — Fix placeholder `sameAs` URLs in Person JSON-LD

**File**: `src/app/layout.tsx`  
**Problem**: The `personJsonLd` has:
```ts
sameAs: [
  "https://www.instagram.com/",   // ← generic homepage, not Jinee's profile
  "https://www.linkedin.com/",    // ← generic homepage, not Jinee's profile
],
```
Google uses `sameAs` to build an entity knowledge graph. Placeholder URLs break entity disambiguation.

**Fix**: Replace with Jinee's actual profile URLs:
```ts
sameAs: [
  "https://www.instagram.com/jineechen/",   // actual Instagram profile
  "https://www.linkedin.com/in/jineechen/", // actual LinkedIn profile
],
```
**Impact**: Entity recognition in Google's Knowledge Graph; may trigger Knowledge Panel.

---

### SEO-4 — Shorten `manifest.json` `short_name`

**File**: `public/manifest.json`  
**Problem**: `short_name` is identical to `name` (60+ chars). The PWA spec recommends ≤12 characters for `short_name` (used on home screen icons).

**Fix**:
```json
"short_name": "Jinee Chen"
```
**Impact**: Proper home-screen icon labelling; avoids PWA audit warnings in Lighthouse.

---

### SEO-5 — Add a default OG image for the homepage in the root layout

**File**: `src/app/layout.tsx` (and add `public/assets/photos/og-home.jpg`)  
**Problem**: No fallback `openGraph.images` in root metadata. When any page without page-specific OG images is shared (e.g. `/portfolio/`, `/about/`) there is no preview image.

**Fix**: Create a 1200×630px branded OG image (site name + a hero photo) and add:
```ts
openGraph: {
  siteName: SITE_NAME,
  type: "website",
  locale: "en_SG",
  images: [{ url: "/assets/photos/og-home.jpg", width: 1200, height: 630, alt: "Jinee Chen — Videographer & Photographer" }],
},
```
**Impact**: Every shared link shows a branded preview instead of a blank card.

---

### SEO-6 — Add richer descriptions to thin-content project entries

**Files**: `src/content/portfolio/photography.json`, `src/content/portfolio/videography.json`, `src/content/portfolio/social-media.json`  
**Problem**: Several project `description` fields are very short (< 60 characters):
- `"NTU Museum Walking Tour West Side Art."` (38 chars)
- `"NTU Museum Walking Tour West Side Art."` (38 chars)

These are used verbatim as meta descriptions. Google recommends 120–160 characters.

**Fix**: Expand descriptions to include context: client name, location, type of work, mood/style.  
Example: `"Photography coverage of the NTU Museum Walking Tour along West Side Art trail — capturing guided groups, heritage architecture, and street art installations in western Singapore."`  
**Impact**: Better SERP snippet quality; relevant keyword density for long-tail searches.

---

### SEO-7 — Add `twitter:site` handle to Twitter card metadata

**File**: `src/app/layout.tsx`  
**Problem**: Twitter card metadata only sets `card: "summary_large_image"` but no `site` handle. Without it, posts shared on X don't attribute the site.

**Fix**:
```ts
twitter: {
  card: "summary_large_image",
  site: "@jineechen",   // actual Twitter/X handle
  creator: "@jineechen",
},
```
**Impact**: Twitter/X cards display the correct attribution; may boost engagement.

---

### SEO-8 — Add `noindex` to imprint and privacy pages

**File**: `src/app/imprint/page.tsx`, `src/app/privacy/page.tsx`  
**Problem**: Policy pages currently have `robots: { index: true, follow: true }` set explicitly. These pages carry no ranking value and dilute crawl budget.

**Fix**:
```ts
robots: { index: false, follow: false },
```
**Impact**: Saves crawl budget; prevents policy pages from appearing in SERPs.

---

## Medium Priority (few hours each)

### SEO-9 — Add BreadcrumbList structured data to portfolio category and project pages

**Files**: `src/app/portfolio/photography/page.tsx`, `src/app/portfolio/video/page.tsx`, `src/app/portfolio/social-media/page.tsx`, `src/app/portfolio/photography/[slug]/page.tsx`, `src/app/portfolio/video/[slug]/page.tsx`
**Problem**: No breadcrumb structured data. Google uses `BreadcrumbList` to annotate search results with `/Portfolio > Photography > Event Photography` style links (breadcrumb rich result).

**Fix example** (photography category page):
```ts
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Portfolio", item: `${SITE_URL}/portfolio/` },
    { "@type": "ListItem", position: 2, name: "Photography", item: `${SITE_URL}/portfolio/photography/` },
  ],
};
```
**Impact**: Breadcrumb rich results in SERPs; improved click-through for category pages.

---

### SEO-10 — Add `ImageGallery` / `ImageObject` structured data on photography project pages

**File**: `src/app/portfolio/photography/[slug]/page.tsx`  
**Problem**: Project pages render galleries of 30–100 professional images but Google has no structured signal about them.

**Fix**: Add a `ImageGallery` (or array of `ImageObject`) JSON-LD based on the project's `images.json` manifest. Limit to first 10 images for performance.

**Impact**: Google Image Search may surface these images directly in SERPs with attribution; important for a photographer's portfolio.

---

### SEO-11 — Supply real `uploadDate` for VideoObject structured data

**File**: `src/app/portfolio/video/[slug]/page.tsx`, `src/content/portfolio/videography.json`  
**Problem**: VideoObject JSON-LD falls back to `"2023-01-01T00:00:00+08:00"` when `uploadDate` is missing from the JSON config. Google Video carousels require a real `uploadDate`.

**Fix**: Add an `uploadDate` field to each video entry in `videography.json` (ISO 8601 format). The JSON schema in `portfolio-schemas.ts` should make it required for video projects.

**Impact**: Eligible for Google Video carousels and rich video results.

---

### SEO-12 — Add `LocalBusiness` / `ProfessionalService` structured data

**File**: `src/app/layout.tsx` or `src/app/about/page.tsx`  
**Problem**: Jinee offers commercial services in Singapore. Google's local search surfaces `LocalBusiness` schema in map packs and knowledge panels.

**Fix**: Add alongside the existing `Person` schema:
```ts
const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Jinee Chen Photography & Videography",
  url: SITE_URL,
  telephone: "+65-XXXX-XXXX",  // optional
  email: "hello@jineechen.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Singapore",
    addressCountry: "SG",
  },
  serviceType: ["Photography", "Videography", "Social Media Content Creation"],
  areaServed: ["Singapore", "Taiwan"],
  priceRange: "$$",
};
```
**Impact**: Local search visibility; may trigger knowledge panel / map pack appearance for "photographer singapore" type queries.

---

### SEO-13 — Add a dedicated Person schema on the About page

**File**: `src/app/about/page.tsx`  
**Problem**: `Person` JSON-LD is in the root layout (applies to every page). A dedicated, richer Person schema on the About page is the most authoritative signal for entity recognition.

**Fix**: Add to `about/page.tsx` with `jobTitle`, `knowsAbout`, `hasOccupation`:
```ts
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jinee Chen",
  jobTitle: "Videographer & Photographer",
  url: `${SITE_URL}/about/`,
  image: `${SITE_URL}/assets/photos/jinee-avatar.webp`,
  knowsAbout: ["Photography", "Videography", "Documentary Storytelling", "Event Photography"],
  hasOccupation: {
    "@type": "Occupation",
    name: "Videographer & Photographer",
    occupationLocation: { "@type": "Country", name: "Singapore" },
  },
};
```
**Impact**: Stronger entity signal; better Person Knowledge Panel chance.

---

### SEO-14 — Improve `sitemap.ts` with real `lastModified` dates

**File**: `src/app/sitemap.ts`  
**Problem**: All URLs currently report `lastModified: new Date()` — meaning every build marks every URL as "just modified". This teaches Googlebot that all pages change on every deployment, leading to inefficient recrawl allocation.

**Fix**: Add a `publishedAt` or `updatedAt` field to each project's JSON config. The sitemap should use that value, falling back to `new Date()` only for the homepage.

**Impact**: Googlebot recrawls updated pages sooner and stable pages less often — better crawl budget use.

---

## Longer-Run Investments

### SEO-15 — Lighthouse / Core Web Vitals audit on deployed site

**Requirement**: Needs the site to be live at `https://jineechen.com`.  
**Tool**: Google PageSpeed Insights / Google Search Console Core Web Vitals report.  
**Focus areas**:
- **LCP (Largest Contentful Paint)**: The hero slideshow image should be the LCP element. Verify it has `priority={true}` (preloaded).
- **CLS (Cumulative Layout Shift)**: Gallery grids loading LQIP placeholders should use `aspect-ratio` reservations.
- **INP (Interaction to Next Paint)**: Lightbox open, slideshow clicks.
- **TTFB**: Static export served from CDN should be near-zero.

---

### SEO-16 — `hreflang` for bilingual content

**Problem**: The About page contains Chinese text (traditional / simplified). Google may serve the Chinese content to the wrong region without `hreflang` declarations.

**Fix**: Add `alternates.languages` to the About page metadata:
```ts
alternates: {
  canonical: `${SITE_URL}/about/`,
  languages: {
    "en-SG": `${SITE_URL}/about/`,
    "zh-TW": `${SITE_URL}/about/`,  // if a Chinese version is created
  },
},
```
**Impact**: Correct language serving for multilingual users; avoids duplicate content penalties.

---

### SEO-17 — Internal linking & navigation breadcrumbs (visible)

**Problem**: No visible breadcrumb navigation on project pages (only `<h1>` with project title). Users arriving from Google on a project page have no visual path back to the portfolio category. Visible breadcrumbs also reinforce the structured data (SEO-9).

**Fix**: Add a small `<nav aria-label="Breadcrumb">` above the page `<h1>` on all portfolio project and category pages with links: Home → Portfolio → {Category} → {Project title}.

**Impact**: Improved UX reduces bounce rate; reinforces site hierarchy signals to Google.

---

### SEO-18 — Open Graph images per portfolio project

**Problem**: Each project's `ogImage` field in the JSON config uses a 800px WebP thumbnail. Ideal OG images are 1200×630px (1.91:1 aspect ratio). Landscape photography thumbnails may crop awkwardly when shared.

**Fix**: Add a dedicated `ogImage` field sized 1200×630 to the image pipeline (new `build-images` size: `1200w`). Update the `ogImage` field convention in the JSON configs and `ADDING-PROJECTS.md`.

**Impact**: Professional, correctly-proportioned social card previews for every project link.

---

### SEO-19 — Google Search Console setup and monitoring

**Requirement**: Deployed site.  
**Actions**:
1. Verify ownership via DNS TXT record or HTML tag in `layout.tsx` metadata
2. Submit `sitemap.xml` to GSC
3. Monitor crawl errors, manual actions, and Core Web Vitals report
4. Set up GSC email alerts for coverage drops

---

### SEO-20 — Content strategy: project descriptions optimised for target keywords

**Problem**: Project page descriptions are written for human readers but lack structured keyword targeting. For a Singapore-based photographer, priority keywords include:
- "event photographer singapore"
- "corporate videographer singapore"
- "documentary videography singapore"
- "walking tour photography singapore"

**Fix**: Audit each project's `description` (used as meta description) and first `<p>` on the project page to naturally include 1–2 relevant keyword phrases without over-optimisation.

**Impact**: Incremental ranking improvement for high-intent local searches.

---

## Summary Table

| # | Item | Effort | Impact | Priority |
|---|------|--------|--------|----------|
| SEO-1 | Fix title duplication (About, Contact) | 5 min | Medium | 🔴 High |
| SEO-2 | Homepage `metadata` export + rich description | 15 min | High | 🔴 High |
| SEO-3 | Fix placeholder `sameAs` URLs in Person JSON-LD | 5 min | High | 🔴 High |
| SEO-4 | Shorten `manifest.json` `short_name` | 2 min | Low | 🟡 Medium |
| SEO-5 | Default OG image for all pages | 1 hr | High | 🔴 High |
| SEO-6 | Expand thin project descriptions | 1–2 hr | High | 🔴 High |
| SEO-7 | Add `twitter:site` handle | 5 min | Low | 🟢 Low |
| SEO-8 | `noindex` imprint + privacy pages | 5 min | Medium | 🟡 Medium |
| SEO-9 | BreadcrumbList structured data | 2 hr | Medium | 🟡 Medium |
| SEO-10 | ImageGallery / ImageObject structured data | 3 hr | High | 🟡 Medium |
| SEO-11 | Real `uploadDate` for VideoObject | 1 hr | High | 🟡 Medium |
| SEO-12 | LocalBusiness / ProfessionalService schema | 30 min | High | 🟡 Medium |
| SEO-13 | Rich Person schema on About page | 30 min | Medium | 🟡 Medium |
| SEO-14 | Real `lastModified` dates in sitemap | 2 hr | Medium | 🟢 Low |
| SEO-15 | Lighthouse / CWV audit (post-deploy) | 2 hr | High | 🔴 High |
| SEO-16 | `hreflang` for bilingual content | 1 hr | Low | 🟢 Low |
| SEO-17 | Visible breadcrumb navigation | 3 hr | Medium | 🟡 Medium |
| SEO-18 | OG images at 1200×630 per project | 4 hr | Medium | 🟢 Low |
| SEO-19 | Google Search Console setup | 1 hr | High | 🔴 High |
| SEO-20 | Keyword-targeted project descriptions | 4–8 hr | High | 🟡 Medium |
