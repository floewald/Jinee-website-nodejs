"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { css, cx } from "@/styled-system/css";
import { useIntersection } from "@/hooks/useIntersection";
import { useScrollLinkedReveal } from "@/hooks/useScrollLinkedReveal";
import { VIDEO_REVEAL_PRESET } from "@/lib/reveal-config";
import { scrollLinkedRevealSurface } from "@/components/portfolio/featured-styles";
import { getYouTubeThumbnailUrl, getYouTubeVideoId } from "@/lib/youtube";
import type { VideoItem } from "@/types/portfolio";

const playerStack = css({
  marginTop: "1rem",
  display: "grid",
  rowGap: "2rem",
});

const episodeRow = css({
  display: "grid",
  gridTemplateColumns: "1fr",
  rowGap: "1rem",
  alignItems: "start",
  // Fail-open scroll-linked reveal surface (shared with grid tiles / project
  // cards): visible by default, the hook only drives the `--reveal-*` vars.
  ...scrollLinkedRevealSurface,
  "@media (min-width: 900px)": {
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
    columnGap: "2rem",
  },
});

const episodeText = css({
  display: "grid",
  rowGap: "0.75rem",
  alignContent: "start",
});

const episodeMedia = css({
  minWidth: 0,
  "@media (min-width: 900px)": {
    '&[data-media-side="left"]': {
      order: -1,
    },
  },
});

const playerTitle = css({
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--color-site-text)",
  lineHeight: 1.3,
});

const episodeDescription = css({
  margin: 0,
  maxWidth: "58ch",
  fontSize: "0.98rem",
  lineHeight: 1.7,
});

const embedWrap = css({ marginBottom: "0.75rem" });

const embedStyle = css({
  position: "relative",
  width: "100%",
  paddingBottom: "56.25%",
  height: "0",
  overflow: "hidden",
  border: "none",
  // iframe overlays the always-present thumbnail. Starts transparent, then
  // crossfades to opaque on its onLoad — the fade itself is the "video ready"
  // signal, with the thumbnail underneath acting as the natural fallback.
  "& iframe": {
    position: "absolute",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    opacity: 0,
    transition: "opacity 250ms ease-out",
  },
  '& iframe[data-loaded="true"]': {
    opacity: 1,
  },
  // Reduced-motion users would otherwise see a hard snap (the global reset
  // collapses the transition to 0.01ms). Pinning iframe to opacity 1 means
  // the thumbnail behind is simply replaced — no fade, no flash.
  "@media (prefers-reduced-motion: reduce)": {
    "& iframe": {
      opacity: 1,
      transition: "none",
    },
  },
});

// Placeholder lives inside embedStyle as an absolutely-positioned layer so the
// iframe can crossfade over it. Without inset:0 it would collapse — the parent
// uses the padding-bottom aspect-ratio trick (height: 0).
const embedPlaceholder = css({
  position: "absolute",
  inset: 0,
  background: "#f4f4f4",
});

const linkStyle = css({
  display: "block",
  position: "relative",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  textDecoration: "none",
  background: "#111",
  _hover: {
    "& img": { opacity: 0.8 },
  },
});

const linkImgStyle = css({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  transition: "opacity 0.2s",
});

const linkLabelStyle = css({
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  background: "rgba(0, 0, 0, 0.55)",
  color: "#fff",
  textAlign: "center",
  padding: "0.5rem 1rem",
  fontSize: "0.9rem",
  letterSpacing: "0.03em",
});

interface VideoEmbedProps {
  video: VideoItem;
  eager?: boolean;
}

function toParagraphs(value?: string | string[]): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : value.split("\n"))
    .map((line) => line.trim())
    .filter(Boolean);
}

// Safety net for the crossfade. If onLoad never fires (network drop, blocked
// third-party, or cached iframe whose load event predates the React listener)
// the iframe would stay at opacity 0 indefinitely and trap focus on an
// invisible element. Flipping loaded=true after this window means the user
// gets the iframe regardless — worst case is a hard snap instead of a fade.
const IFRAME_LOAD_FALLBACK_MS = 5000;

function LazyVideoEmbed({ video, eager = false }: VideoEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Eager iframes skip the intersection gate so `loading="eager"` actually
  // takes effect — otherwise the iframe wouldn't render until IO fires.
  const isVisible = useIntersection(ref, { rootMargin: "200px", once: true });
  const shouldRenderIframe = eager || isVisible;
  const videoId = getYouTubeVideoId(video.embedUrl);
  // Drives the iframe crossfade. Flips true once the YouTube player has loaded;
  // the data-loaded attribute is what the CSS selector keys off of.
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!shouldRenderIframe || iframeLoaded) return;
    const timeoutId = window.setTimeout(
      () => setIframeLoaded(true),
      IFRAME_LOAD_FALLBACK_MS
    );
    return () => window.clearTimeout(timeoutId);
  }, [shouldRenderIframe, iframeLoaded]);

  // Non-embeddable external video — show a clickable image preview
  if (!video.embedUrl && video.linkUrl) {
    return (
      <div className={cx(embedWrap, "video-embed-wrap")}>
        <a
          href={video.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkStyle}
          aria-label={`Watch: ${video.title}`}
        >
          {video.previewImage && (
            <Image
              src={video.previewImage}
              alt={video.title}
              width={640}
              height={360}
              className={linkImgStyle}
              loading="lazy"
              unoptimized
            />
          )}
          <span className={linkLabelStyle}>Watch ↗</span>
        </a>
      </div>
    );
  }

  return (
    <div className={cx(embedWrap, "video-embed-wrap")} ref={ref}>
      <div className={cx(embedStyle, "video-embed__ratio")}>
        {/* Always present as the "behind" layer so the iframe can crossfade
            over it. Purely decorative — kept aria-hidden. */}
        <div
          className={cx(embedPlaceholder, "video-embed--placeholder")}
          aria-hidden="true"
          style={
            videoId
              ? {
                  backgroundImage: `url(${getYouTubeThumbnailUrl(videoId)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        {shouldRenderIframe && (
          <iframe
            src={video.embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading={eager ? "eager" : "lazy"}
            // Double rAF: YouTube fires `load` when the iframe document parses,
            // but the player chrome paints a frame or two later. Waiting two
            // frames before flipping to opacity 1 means the fade resolves onto
            // painted content, not a blank document.
            onLoad={() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setIframeLoaded(true));
              });
            }}
            data-loaded={iframeLoaded ? "true" : undefined}
            // While invisible, keep the iframe out of the tab order and the
            // AOM. Once loaded the iframe becomes a normal focusable region.
            tabIndex={iframeLoaded ? undefined : -1}
            aria-hidden={iframeLoaded ? undefined : true}
          />
        )}
      </div>
    </div>
  );
}

interface EpisodeRowProps {
  video: VideoItem;
  eager: boolean;
  layout: "media-left" | "media-right";
}

function EpisodeRow({ video, eager, layout }: EpisodeRowProps) {
  const paragraphs = toParagraphs(video.description);

  // Reveal is owned by the shared scroll-linked system (see VideoPlayer below).
  // The row is fail-open: visible by default via the `--reveal-opacity` CSS var,
  // so a soft navigation can never leave it stuck hidden.
  return (
    <div
      className={cx(episodeRow, "video-episode-row")}
      data-episode-layout={layout}
    >
      <div className={cx(episodeText, "video-episode-text")}>
        <h3 className={playerTitle}>{video.title}</h3>
        {paragraphs.map((paragraph, paragraphIndex) => (
          <p
            key={`${video.title}-${paragraphIndex}`}
            className={cx(episodeDescription, "video-episode-copy")}
          >
            {paragraph}
          </p>
        ))}
      </div>
      <div
        className={cx(episodeMedia, "video-episode-media")}
        data-media-side={layout === "media-left" ? "left" : "right"}
      >
        <LazyVideoEmbed video={video} eager={eager} />
      </div>
    </div>
  );
}

interface VideoPlayerProps {
  videos: VideoItem[];
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  // Shared scroll-linked reveal engine (same as project cards and gallery
  // images) with the video-specific tuning. Runs in a passive effect and
  // re-measures on scroll, so it survives App Router soft navigations and can
  // never leave a row stuck hidden.
  useScrollLinkedReveal(stackRef, ".video-episode-row", VIDEO_REVEAL_PRESET);

  return (
    <div ref={stackRef} className={cx(playerStack, "video-player")}>
      {videos.map((v, i) => (
        <EpisodeRow
          key={i}
          video={v}
          eager={i < 2}
          layout={i % 2 === 0 ? "media-left" : "media-right"}
        />
      ))}
    </div>
  );
}
