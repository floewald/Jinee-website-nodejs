# Video source review

Collected on 11 October 2026 for the portfolio summary and video metadata audit.

## Files

- `index.json`: one entry for each of the 62 portfolio videos, recording the project, source URL, caption availability, and verified YouTube publish timestamp.
- `<video-id>/transcript.json`: captions obtained with the sibling `yt-transcript` tool, retaining text, start times, and durations.
- `<video-id>/metadata.json`: YouTube's publisher description and original publish timestamp, with source URL and retrieval time.
- `review.json`: editorial changes and the evidence used for each project, including which pages relied on publisher descriptions.

These editorial research files are versioned with the branch, outside `public/`. They are not imported by the application or included in its static export. Caption text and publisher descriptions remain source material; the website displays original summaries.

## Coverage and limitations

The first pass retrieved 21 transcripts. YouTube reported captions disabled for 26 videos and blocked caption requests for seven others. Eight episodes are hosted on mewatch and are outside this tool's scope. See the index for the current per-video status after any retry.

All 54 YouTube publish timestamps were verified. Eleven dates in the portfolio were corrected, including ten `2023-01-01` placeholders and the Dormitory Awards date. Eight remaining placeholders belonged to mewatch episodes and were removed pending a source timestamp.

The review compares available caption passages and publisher descriptions with page copy; it does not claim a complete visual viewing of every film. Caption errors can affect proper names and wording. Publisher descriptions were used to cross-check concrete details, and `review.json` distinguishes that evidence from captions. Medical, financial, and other reporting is described as a film's subject, not converted into new advice.

## Repeat the workflow

```bash
npm run download:video-transcripts
npm run download:video-transcripts -- --slug retirement-aging
npm run download:video-transcripts -- --metadata-only
npm run test:transcripts
```

The collector reuses valid captions and cached metadata, records failures, and stops further caption requests after a provider IP block. `--force` refreshes sources and retries disabled captions. `YT_TRANSCRIPT_PATH` overrides the default sibling repository. See [the project guide](../../docs/ADDING-PROJECTS.md#optional-review-copy-against-source-captions) for setup and editorial instructions.

## Review outcomes

- The Frontline page now covers all three included reports rather than presenting them as a two-episode family series.
- Lion-dance copy describes Nicolas Goh's young troupe, TikTok recruitment, and competition, replacing an unsupported general history description.
- Re: Old Times names Fort Canning's actual lost attractions. Lunch With Us distinguishes Banqiao in New Taipei City from Taipei City.
- Into The Gym describes eight guest episodes plus a highlights compilation.
- Each embedded episode with a verified date has its own structured description and thumbnail. External mewatch links do not claim a video playable on this page.
- Source timestamps are optional when unknown, and new scaffolds no longer manufacture them from today's date.

## Search guidance

Google recommends accurate, unique video metadata; see its [VideoObject documentation](https://developers.google.com/search/docs/appearance/structured-data/video). Concise meta descriptions are an editorial convention, not a fixed ranking threshold: Google has [no fixed meta-description length limit](https://developers.google.com/search/docs/appearance/snippet). The changes improve source accuracy and page context; search visibility still depends on crawling, indexing, and relevance.

## Delivery notes

Source collection worked without installing dependencies or changing the sibling tool. Provider blocks and disabled captions limited coverage; the index makes those gaps visible. Offline tests cover unsafe identifiers, corrupt caches, and invalid dates, while page tests cover per-episode markup and unknown or external-only videos. A future review can retry blocked videos and obtain mewatch captions directly from the project owner or publisher.

Verification also found four existing TypeScript errors in test code on the starting `main`: two DOM element types and two accesses to optional scaffold card fields. The narrow typing corrections preserve the same test assertions.

Final verification passed lint, TypeScript, 434 Jest tests, the offline collector tests, documentation checks, manifest validation, and the full production build. The sandbox initially prevented Next.js build workers from binding a port; the same build passed with the required host permissions. Inspection of all 28 exported video pages confirmed 51 episode-specific `VideoObject` records, correct page descriptions, and no placeholder dates. The three hidden commercial/corporate projects remain excluded from the export, and the research directory is not published.
