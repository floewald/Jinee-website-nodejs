# SEO Assessment & Improvement Plan

**Updated:** 2026-04-29  
**Site:** `jineechen.com` — static Next.js export  
**Goal:** improve organic and paid-search readiness for a photographer, videographer, video producer, documentary producer, and social media content creator in Singapore.

This is the current source of truth for SEO work. It consolidates the earlier `SEO.md`, `SEO-CUSTOMER-INPUT.md`, and the 2026-04-29 adversarial assessment.

---

## Executive summary

The website has a strong visual portfolio and a solid technical base: static export, sitemap, robots.txt, metadata, WebP images, self-hosted fonts, portfolio manifests, and some structured data. The main gap is commercial search positioning. The site currently reads more like a polished portfolio than a local service website designed to rank and convert for crowded Singapore searches.

Competitors for Singapore photography and videography queries commonly use dedicated landing pages with exact service intent, client logos, testimonials, pricing or package cues, turnaround times, FAQs, Google reviews, and strong calls to action. This site has the proof to compete, especially in documentary, broadcast, event, and social content work, but that proof needs to be packaged into service pages and richer case studies before Google Ads spend.

Highest-priority work:

1. Fix sitemap accuracy so only generated, indexable URLs are submitted.
2. Create dedicated Singapore service landing pages instead of relying only on portfolio categories.
3. Rewrite thin, duplicate, and placeholder project descriptions.
4. Strengthen local SEO signals with `ProfessionalService` schema, Google Business Profile, reviews, and service details.
5. Prepare Google Ads landing pages with conversion tracking, clear deliverables, trust proof, and mobile performance checks.

---

## Adversarial review summary

### SEO expert lens

- The technical foundation is usable, but sitemap quality and route consistency need cleanup.
- The site does not yet target enough high-intent Singapore service keywords through dedicated pages.
- Portfolio content has valuable proof but many metadata descriptions are too thin or duplicated.
- Local entity signals are incomplete: service area, business profile, reviews, and service schema need reinforcement.
- Google Ads should wait until service-specific landing pages and conversion tracking exist.

### Corporate event customer lens

This visitor wants quick answers about event photography, event videography, conference coverage, launch events, turnaround time, deliverables, sample galleries, pricing range, and trust proof. Current portfolio examples help, but the site does not yet make the offer explicit enough.

### Brand / social media customer lens

This visitor wants to know whether Jinee can create reels, short-form brand content, founder content, launch videos, captions, thumbnails, and platform-ready edits. Examples exist, but social media content is not yet framed as a service offer on the website.

### Documentary / broadcast customer lens

This visitor wants a local producer, field producer, videographer, fixer, researcher, or director in Singapore/Taiwan. The portfolio supports this strongly, but the site needs a dedicated landing page for this differentiated niche.

---

## Current strengths

| Strength | Evidence | SEO value |
|---|---|---|
| Singapore positioning exists | `src/lib/constants.ts`, homepage metadata | Useful base relevance for local searches |
| Static export is crawlable | `next.config.ts`, `src/app/sitemap.ts`, `public/robots.txt` | Search engines can discover pages |
| Portfolio data is structured | `src/content/portfolio/*.json` | Easier to scale metadata and schema |
| Structured data foundation exists | `Person`, `VideoObject`, `ImageGallery` JSON-LD | Good base for entity and rich-result eligibility |
| Strong proof assets | CNA, 8World, Mediacorp, SCDF, Uniqlo-style examples | Differentiates from generic freelancers |
| Visual performance base is good | WebP assets, self-hosted fonts | Helpful for image-heavy UX |
| Conversion paths exist | Email, Calendly, contact form, Instagram | Basic lead capture is already present |

---

## Current critical findings

### 1. Sitemap includes URLs that are hidden or do not exist

**Priority:** P0  
**Effort:** Small  
**Needs human input:** No

Observed issues:

- `src/app/portfolio/social-media/[slug]/page.tsx` does not exist, but the sitemap lists social media project detail URLs.
- Hidden projects are still included in the sitemap, including `behind-the-scenes`, `marigold-ad`, `ministry-of-manpower`, and `nescafe-ad`.
- All sitemap entries use `new Date()` as `lastModified`, so every build makes every page look newly changed.

Recommended fixes:

- Filter project routes with `visible !== false`.
- Remove social media detail URLs from the sitemap unless real pages are added.
- Add sitemap tests that verify every sitemap URL has a generated route.
- Add `updatedAt` or `publishedAt` fields later for more accurate `lastModified` values.

### 2. Dedicated service landing pages are missing

**Priority:** P0  
**Effort:** Medium to Large  
**Needs human input:** Partly

Current routes are portfolio-led rather than buyer-intent-led. The site needs pages built around the queries people search before hiring someone.

Recommended pages:

| Service page | Primary intent | Suggested URL |
|---|---|---|
| Event Photographer Singapore | Corporate/private event photography | `/services/event-photographer-singapore/` |
| Event Videographer Singapore | Event films, highlight reels, interviews | `/services/event-videographer-singapore/` |
| Photographer & Videographer Singapore | Combined coverage/package intent | `/services/photographer-videographer-singapore/` |
| Video Producer Singapore | Planning, producing, filming, brand content | `/services/video-producer-singapore/` |
| Documentary Producer Singapore | Broadcast, field producer, fixer, documentary support | `/services/documentary-producer-singapore/` |
| Social Media Content Creator Singapore | Reels, short-form video, editorial social content | `/services/social-media-content-creator-singapore/` |

Each page should include:

- One clear `h1` matching the service/search intent.
- Short positioning copy with Singapore service area.
- Deliverables and use cases.
- Relevant portfolio examples.
- Trust proof: clients, publications, testimonials, reviews.
- Process and turnaround.
- FAQ section.
- Direct CTA to contact, Calendly, email, and optionally WhatsApp/phone.

### 3. Project descriptions are thin, duplicated, or placeholders

**Priority:** P1  
**Effort:** Medium  
**Needs human input:** Partly

Repository audit found:

- 58 project descriptions under 120 characters.
- 46 project descriptions under 80 characters.
- `guardians-vietnam` has a one-character description: `.`.
- 14 social media projects use the duplicate description `Instagram editorial reel content.`.
- 3 video projects use the duplicate phrase `Indian cusine vegetarian cusine and Ayurveda.`.
- Most video entries use `2023-01-01T00:00:00+08:00`, which looks like a placeholder upload date.

Recommended rewrite pattern:

> `[Service type] in [location] for [client/project type], covering [deliverables] with [style/outcome]. Jinee served as [role].`

Example direction:

- Weak: `CNA Insider series "Our Blind Kitchen".`
- Stronger: `Documentary video production in Singapore for CNA Insider, following visually impaired chefs opening a café. Jinee worked across research, producing, directing, and videography.`

### 4. Local SEO signals are incomplete

**Priority:** P1  
**Effort:** Small to Medium  
**Needs human input:** Partly

Recommended technical work:

- Add `ProfessionalService` JSON-LD with `name`, `url`, `email`, `areaServed`, `serviceType`, `sameAs`, and Singapore service area.
- Add richer `Person` schema on `/about/` with `jobTitle`, `knowsAbout`, and `hasOccupation`.
- Add `BreadcrumbList` schema on service, category, and project pages.
- Add canonical metadata for core pages.

Recommended business work:

- Create or optimize Google Business Profile.
- Request Google reviews from prior clients.
- Keep service categories, service area, name, contact details, and website content consistent.
- Add photos/videos to Google Business Profile.

### 5. Google Ads readiness is incomplete

**Priority:** P1  
**Effort:** Medium  
**Needs human input:** Partly

Before running ads:

- Build one landing page per ad group/search intent.
- Add conversion tracking for contact form submissions, Calendly clicks, email clicks, phone/WhatsApp clicks, and Instagram clicks.
- Add explicit deliverables, process, response expectations, turnaround, usage rights, and price guidance where possible.
- Add testimonials, reviews, or case studies.
- Confirm negative keywords before broad matching.
- Test mobile landing pages and page speed after deployment.

Suggested first ad groups:

| Ad group | Landing page | Example keyword direction |
|---|---|---|
| Event photography | `/services/event-photographer-singapore/` | event photographer singapore, corporate event photographer singapore |
| Event videography | `/services/event-videographer-singapore/` | event videographer singapore, corporate event videography singapore |
| Documentary / broadcast | `/services/documentary-producer-singapore/` | documentary producer singapore, field producer singapore |
| Social media content | `/services/social-media-content-creator-singapore/` | social media videographer singapore, reels creator singapore |

Avoid starting with broad `photographer singapore` unless budget is high and conversion tracking is reliable.

---

## Additional findings

### Heading structure

**Priority:** P1  
**Effort:** Small  
**Needs human input:** No

Observed issues:

- `/about/` renders an `h2` but no visible `h1`.
- `/contact/` lacks a clear visible `h1`.
- `/portfolio/` uses section `h2`s but no page-level `h1`.
- `/portfolio/social-media/` renders multiple `h1` elements through mapped sections.
- Homepage uses a screen-reader-only `h1`; acceptable technically, but less persuasive for humans.

Recommended fixes:

- Add one visible `h1` per core route.
- Use `h2` for sections.
- Make the homepage headline communicate commercial positioning, e.g. `Singapore Photographer, Videographer & Video Producer`.

### Category metadata

**Priority:** P1  
**Effort:** Small  
**Needs human input:** No

Current titles such as `Photography`, `Videography`, and `Social Media` are too generic.

Suggested direction:

- `Photography Portfolio — Event & Travel Photographer in Singapore`
- `Videography Portfolio — Documentary & Corporate Videographer in Singapore`
- `Social Media Content Portfolio — Reels & Editorial Video in Singapore`

### Portfolio buying confidence

**Priority:** P2  
**Effort:** Medium  
**Needs human input:** Partly

Project pages should answer:

- What was the client goal?
- What did Jinee deliver?
- What role did Jinee play?
- What was the production scale?
- What kind of client should hire her for similar work?
- What should the visitor do next?

Recommended repeatable project fields:

- Client / project type
- Role
- Services delivered
- Location
- Outcome or use case
- Relevant CTA

### Social media project SEO leakage

**Priority:** P2  
**Effort:** Medium  
**Needs human input:** Partly

Many social media tiles link directly to Instagram. That is useful for watching reels, but it sends SEO and conversion context away from the website.

Recommended fixes:

- Create internal case-study pages for important social media examples.
- Embed or link to Instagram from the internal page.
- Add context: platform, hook, goal, format, role, and outcome.

### Image SEO and performance

**Priority:** P2  
**Effort:** Medium  
**Needs human input:** Partly

Recommended fixes:

- Keep eager/priority loading only for the first hero slide.
- Add `sizes` to hero slideshow images.
- Improve alt text for key portfolio images where the subject and context are known.
- Add `ImageObject` structured data for selected photography projects.
- Add relevant surrounding text near image galleries.

### Open Graph and social previews

**Priority:** P2  
**Effort:** Small to Medium  
**Needs human input:** Yes for final image choice

Recommended fixes:

- Add a default 1200×630 OG image for the site.
- Keep project-level OG images, but consider dedicated 1200×630 assets for the strongest projects.
- Add page-specific OG title/description for service pages and portfolio categories.

---

## Actions that can be done without human feedback

| Priority | Action | Effort | Likely files | Why it matters |
|---|---:|---:|---|---|
| P0 | Clean sitemap to include only generated/indexable URLs | Small | `src/app/sitemap.ts`, tests | Removes crawl errors and sitemap noise |
| P0 | Remove social media detail URLs unless pages exist | Small | `src/app/sitemap.ts` | Avoids submitting non-existent URLs |
| P0 | Exclude `visible: false` projects from sitemap | Small | `src/app/sitemap.ts` | Avoids hidden projects being crawled from sitemap |
| P1 | Add one visible `h1` per core page | Small | `src/app/**`, section components | Improves clarity and accessibility |
| P1 | Improve category metadata with Singapore terms | Small | portfolio category pages | Better local relevance |
| P1 | Add basic `ProfessionalService` schema without phone | Small | `src/app/layout.tsx` or schema helper | Reinforces local service entity |
| P1 | Add canonical metadata for core routes | Small | metadata exports | Reduces URL ambiguity |
| P1 | Add `BreadcrumbList` JSON-LD | Medium | portfolio/service pages | Better hierarchy and rich-result eligibility |
| P2 | Fix hero slideshow eager loading | Small | `src/components/sections/HeroSlideshow.tsx` | Improves page-speed readiness |
| P2 | Scaffold service page templates | Medium | `src/app/services/**` | Creates SEO/ad landing page structure |
| P2 | Add internal service ↔ portfolio links | Medium | service/portfolio components | Builds topical clusters |
| P2 | Add sitemap-route consistency tests | Medium | Jest tests | Prevents future SEO regressions |
| P3 | Refresh related docs after implementation | Small | `docs/**` | Keeps the plan accurate |

---

## Actions requiring Jinee/business input

The detailed checklist lives in `docs/SEO-CUSTOMER-INPUT.md`.

| Priority | Needed input | Effort after input | Why it matters |
|---|---:|---:|---|
| P0 | Which services to sell first | Medium | Determines landing page and ad strategy |
| P0 | Primary conversion goal | Small | Required for Google Ads tracking |
| P0 | Public phone/WhatsApp decision | Small | Improves local conversions |
| P1 | Service deliverables and turnaround | Medium | Buyers compare reliability, not visuals only |
| P1 | Pricing range or starting prices | Small | Improves ad lead quality |
| P1 | Testimonials/reviews and permission | Medium | Critical trust signal |
| P1 | Client logo permissions | Small | Makes proof more persuasive |
| P1 | Google Business Profile status | Medium | Critical for local search |
| P1 | Real/approximate video upload dates | Small | Improves `VideoObject` structured data |
| P2 | Case-study notes for strongest projects | Large | Converts portfolio into long-tail SEO assets |
| P2 | Default OG image choice | Small | Improves social previews |
| P2 | Female photographer/videographer keyword angle | Small | Potential niche positioning if intentional |
| P3 | Taiwan as secondary service area | Small | Affects local SEO and schema focus |

---

## Effort clusters

### Extra-small fixes: under 30 minutes each

- Confirm current `sameAs` social URLs.
- Add or omit Twitter/X metadata based on whether an active handle exists.
- Adjust category metadata titles/descriptions.
- Add missing visible page headings.
- Remove hidden projects from sitemap.
- Add basic canonical URLs for core pages.

### Small fixes: 30 minutes to 2 hours

- Clean sitemap and update tests.
- Add basic `ProfessionalService` schema.
- Fix hero slideshow eager loading.
- Add reusable breadcrumb schema helper.
- Add simple homepage service intro copy using existing facts only.

### Medium fixes: half day to 1 day

- Create service landing page templates.
- Add visible breadcrumbs across portfolio pages.
- Rewrite top-priority metadata and introductory copy.
- Add selected `ImageObject` structured data.
- Add conversion tracking hooks.
- Add internal linking between service pages and portfolio projects.

### Large fixes: 1 to 3 days

- Write full service pages with proof, deliverables, FAQs, and CTAs.
- Rewrite all thin portfolio descriptions.
- Create internal social media case-study pages.
- Add case-study sections for best commercial examples.
- Prepare Google Ads landing pages and ad group mapping.

### Ongoing work

- Collect reviews.
- Publish fresh portfolio/case-study updates.
- Monitor Google Search Console.
- Monitor Google Ads Quality Score, search terms, landing page experience, and conversion rates.
- Add new long-tail pages based on real impressions and leads.

---

## Recommended 30-day roadmap

### Week 1 — Technical cleanup before ads

1. Fix sitemap accuracy.
2. Clean heading structure.
3. Add canonical URLs.
4. Add breadcrumb schema.
5. Add basic local service schema.
6. Fix hero image loading.
7. Verify in Google Search Console after deployment.

### Week 2 — Service intent pages

1. Create `/services/` hub.
2. Create event photographer and event videographer pages first.
3. Create video producer / documentary producer page as the differentiator.
4. Link pages to best existing portfolio work.
5. Add CTAs to contact, Calendly, email, and optionally WhatsApp/phone.

### Week 3 — Content and trust

1. Rewrite the top 10 most important project descriptions.
2. Add 3 to 5 case studies.
3. Add testimonials or client proof if permitted.
4. Add FAQ blocks for pricing, turnaround, deliverables, booking, and usage rights.

### Week 4 — Ads readiness

1. Add conversion tracking.
2. Create one landing page per ad group.
3. Start with exact/phrase match service keywords.
4. Add negative keywords such as jobs, salary, course, free, internship, school, DIY, template, camera, and unrelated wedding terms if weddings are not targeted.
5. Monitor search terms and landing page experience before scaling budget.

---

## Suggested keyword strategy

Avoid relying only on broad terms like `photographer singapore`. They are crowded, expensive, and ambiguous. Build around more specific buyer intent.

| Intent cluster | Example target phrases | Recommended page |
|---|---|---|
| Event photography | event photographer singapore, corporate event photographer singapore, conference photographer singapore | Event Photographer Singapore |
| Event videography | event videographer singapore, corporate event videography singapore, event highlight video singapore | Event Videographer Singapore |
| Combined package | photographer and videographer singapore, event photography and videography singapore | Photographer & Videographer Singapore |
| Documentary / broadcast | documentary producer singapore, field producer singapore, local fixer singapore, documentary videographer singapore | Documentary Producer Singapore |
| Brand content | brand videographer singapore, corporate video producer singapore, social media video production singapore | Video Producer / Social Media Content |
| Social reels | reels creator singapore, social media videographer singapore, short-form video singapore | Social Media Content Creator Singapore |

---

## Older SEO items now considered complete or superseded

| Former item | Status |
|---|---|
| About/contact title duplication | Complete: page titles now use short segment titles |
| Homepage metadata export | Complete |
| Manifest `short_name` | Complete |
| Privacy/imprint `noindex` | Complete |
| Placeholder `sameAs` URLs | Partly complete; still needs profile confirmation |
| Default OG image | Still needs image choice |
| Breadcrumb structured data | Still open |
| ImageGallery/ImageObject improvements | Still open |
| Real video upload dates | Still needs input |
| LocalBusiness/ProfessionalService schema | Still open |
| Rich About page Person schema | Still open |
| Real sitemap `lastModified` values | Still open after sitemap cleanup |
| Search Console setup | Still needs deployed-site access |
| Keyword-targeted project descriptions | Still open |

---

## Sources and benchmarks consulted

- [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google Search Central — Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)
- [Google Search Central — LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Business Profile Help — Improve local ranking](https://support.google.com/business/answer/7091/improve-your-local-ranking-on-google)
- [Google Ads Help — Quality Score](https://support.google.com/google-ads/answer/6167118)
- [Google Ads Help — Landing page performance](https://support.google.com/google-ads/answer/7543502)
- Competitive SERP examples reviewed: teofu Media, Visual Sixty Five, Motion Pixel, Bespoke Photography, fewStones, Jose Jeuland, Mount Studio, and similar Singapore photography/videography service pages.
