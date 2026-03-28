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

/** Auto-advance interval (ms) for card slideshow */
export const SLIDESHOW_CYCLE_MS = 4000;

/**
 * Prime-number step used to stagger slideshow offsets across multiple cards.
 * gcd(997, 4000) === 1, so 4000 unique offsets are produced before any two
 * cards share the same phase — eliminating the "pairs changing together" effect.
 */
export const SLIDESHOW_PRIME_STEP = 997;
