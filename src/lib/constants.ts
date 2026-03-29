export const SITE_URL = "https://jineechen.com";
export const SITE_NAME = "Jinee Chen";
export const SITE_EMAIL = "hello@jineechen.com";
export const SITE_TAGLINE = "Videographer & Photographer based in Singapore";

/** Base path for backend PHP services, configurable via env for local dev */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "/backend";

/** Number of thumbnail columns at each responsive breakpoint */
export const GALLERY_COLUMNS = { xs: 2, sm: 3, md: 4 };

/** Maximum number of portfolio cards shown per category on the homepage */
export const MAX_CARDS = 6;

/** Minimum auto-advance interval (ms) for card slideshow.
 * Each card picks a random interval between this value and
 * SLIDESHOW_CYCLE_MS + SLIDESHOW_JITTER_MS so no two cards ever sync up. */
export const SLIDESHOW_CYCLE_MS = 4000;
/** Extra random milliseconds added on top of SLIDESHOW_CYCLE_MS per card (0–this value). */
export const SLIDESHOW_JITTER_MS = 4000;
