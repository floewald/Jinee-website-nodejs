export const SITE_URL = "https://jineechen.com";
export const SITE_NAME = "Jinee Chen";
export const SITE_EMAIL = "hello@jineechen.com";
export const SITE_TAGLINE = "Videographer & Photographer based in Singapore";

/** Base path for backend PHP services, configurable via env for local dev */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "/backend";

/** Number of thumbnail columns at each responsive breakpoint */
export const GALLERY_COLUMNS = { xs: 2, sm: 3, md: 4 };
