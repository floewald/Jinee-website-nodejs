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
          {videos.length > 1 && (
            <h3 className="video-player__title">{v.title}</h3>
          )}
          <LazyVideoEmbed video={v} />
        </div>
      ))}
    </div>
  );
}
