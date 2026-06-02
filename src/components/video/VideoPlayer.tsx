"use client";

import { useRef } from "react";
import Image from "next/image";
import { css, cx } from "@/styled-system/css";
import { useIntersection } from "@/hooks/useIntersection";
import type { VideoItem } from "@/types/portfolio";

const playerGrid = css({
  marginTop: "1rem",
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridAutoRows: "auto",
  columnGap: "1.5rem",
  rowGap: "0.75rem",
  "@media (min-width: 1400px)": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  "@media (max-width: 540px)": {
    gridTemplateColumns: "1fr",
  },
});

const playerItem = css({
  display: "grid",
  gridRow: "span 2",
  gridTemplateRows: "subgrid",
});

const playerTitle = css({
  fontSize: "1.05rem",
  fontWeight: 700,
  alignSelf: "start",
});

const embedWrap = css({ marginBottom: "0.75rem" });

const embedStyle = css({
  position: "relative",
  width: "100%",
  paddingBottom: "56.25%",
  height: "0",
  overflow: "hidden",
  border: "none",
  "& iframe": {
    position: "absolute",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
  },
});

const embedPlaceholder = css({ background: "#f4f4f4" });

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
}

function LazyVideoEmbed({ video }: VideoEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersection(ref, { rootMargin: "200px", once: true });

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
            <Image src={video.previewImage} alt={video.title} width={640} height={360} className={linkImgStyle} loading="lazy" unoptimized />
          )}
          <span className={linkLabelStyle}>Watch ↗</span>
        </a>
      </div>
    );
  }

  return (
    <div className={cx(embedWrap, "video-embed-wrap")} ref={ref}>
      {isVisible ? (
        <div className={cx(embedStyle, "video-embed__ratio")}>
          <iframe
            src={video.embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className={cx(embedStyle, embedPlaceholder, "video-embed--placeholder")} aria-hidden="true" />
      )}
    </div>
  );
}

interface VideoPlayerProps {
  videos: VideoItem[];
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  return (
    <div className={cx(playerGrid, "video-player")}>
      {videos.map((v, i) => (
        <div key={i} className={cx(playerItem, "video-player__item")}>
          <h3 className={playerTitle}>{v.title}</h3>
          <LazyVideoEmbed video={v} />
        </div>
      ))}
    </div>
  );
}
