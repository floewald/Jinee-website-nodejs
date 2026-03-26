/**
 * Build WebP asset URLs from a base path and image basename.
 * Convention: {basename}-320.webp (thumb), {basename}-800.webp (md), {basename}-1600.webp (lg)
 */

/** 320 px thumbnail used in gallery grids */
export function getThumbUrl(basePath: string, basename: string): string {
  return `${basePath}/${basename}-320.webp`;
}

/** 800 px mid-size used for lightbox previews and og:image */
export function getMdUrl(basePath: string, basename: string): string {
  return `${basePath}/${basename}-800.webp`;
}

/** 1600 px full-size used in high-DPI lightbox / download preview */
export function getLgUrl(basePath: string, basename: string): string {
  return `${basePath}/${basename}-1600.webp`;
}

/** Return the YouTube embed URL from a full embed URL or bare video ID */
export function toYouTubeEmbedUrl(idOrUrl: string): string {
  if (idOrUrl.startsWith("http")) return idOrUrl;
  return `https://www.youtube.com/embed/${idOrUrl}`;
}

/** Extract YouTube video ID from an embed URL */
export function youTubeIdFromEmbedUrl(embedUrl: string): string {
  return embedUrl.split("/").pop() ?? "";
}
