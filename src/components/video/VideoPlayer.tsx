"use client";

import { useRef } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import type { VideoItem } from "@/types/portfolio";

interface VideoEmbedProps {
  video: VideoItem;
}

function LazyVideoEmbed({ video }: VideoEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersection(ref, { rootMargin: "200px" });

  // Non-embeddable external video — show a clickable image preview
  if (!video.embedUrl && video.linkUrl) {
    return (
      <div className="video-embed-wrap">
        <a
          href={video.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="video-embed-link"
          aria-label={`Watch: ${video.title}`}
        >
          {video.previewImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={video.previewImage} alt={video.title} className="video-embed-link__img" />
          )}
          <span className="video-embed-link__label">Watch ↗</span>
        </a>
      </div>
    );
  }

  return (
    <div className="video-embed-wrap" ref={ref}>
      {isVisible ? (
        <iframe
          className="video-embed"
          src={video.embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="video-embed video-embed--placeholder" aria-hidden="true" />
      )}
    </div>
  );
}

interface VideoPlayerProps {
  videos: VideoItem[];
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  return (
    <div className="video-player">
      {videos.map((v, i) => (
        <div key={i} className="video-player__item">
          <h3 className="video-player__title">{v.title}</h3>
          <LazyVideoEmbed video={v} />
        </div>
      ))}
    </div>
  );
}
