/**
 * Extracts the YouTube video ID from a player embed URL.
 * Returns null for non-YouTube URLs or unparseable shapes — caller falls back
 * to a neutral placeholder.
 *
 * Handles: youtube.com/embed/{ID}, youtube-nocookie.com/embed/{ID},
 * with or without query params, with or without trailing slash.
 */
export function getYouTubeVideoId(embedUrl: string | undefined): string | null {
  if (!embedUrl) return null;
  const match = embedUrl.match(
    /^https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/([\w-]{6,})/i
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  // sddefault.jpg is 640×480 and always available, unlike maxresdefault which
  // 404s on older uploads. Sharper than hqdefault on high-DPI displays.
  return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
}
