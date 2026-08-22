/**
 * Extracts the YouTube video ID from a common YouTube URL shape or a bare ID.
 * Returns null for non-YouTube URLs or unparseable shapes — caller falls back
 * to a neutral placeholder.
 *
 * Handles: youtube.com/watch?v={ID}, youtu.be/{ID}, youtube.com/shorts/{ID},
 * youtube.com/embed/{ID}, and youtube-nocookie.com/embed/{ID}.
 */
const YOUTUBE_ID_PATTERN = /^[\w-]{6,}$/;

function isValidYouTubeVideoId(value: string): boolean {
  return YOUTUBE_ID_PATTERN.test(value);
}

function firstPathSegment(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ?? null;
}

function secondPathSegment(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[1];
  return segment ?? null;
}

export function parseYouTubeVideoId(input: string | undefined): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  if (isValidYouTubeVideoId(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }

  const raw = trimmed.includes("://") ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^(www|m)\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = firstPathSegment(url.pathname);
      return id && isValidYouTubeVideoId(id) ? id : null;
    }

    if (host !== "youtube.com" && host !== "youtube-nocookie.com") {
      return null;
    }

    const watchId = url.searchParams.get("v");
    if (watchId && isValidYouTubeVideoId(watchId)) {
      return watchId;
    }

    const first = firstPathSegment(url.pathname);
    if (!first) return null;

    if (first === "embed" || first === "shorts") {
      const id = secondPathSegment(url.pathname);
      return id && isValidYouTubeVideoId(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeVideoId(input: string | undefined): string | null {
  return parseYouTubeVideoId(input);
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  // sddefault.jpg is 640×480 and always available, unlike maxresdefault which
  // 404s on older uploads. Sharper than hqdefault on high-DPI displays.
  return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
}
