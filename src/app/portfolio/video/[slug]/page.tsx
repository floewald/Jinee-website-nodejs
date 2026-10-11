import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cx } from "@/styled-system/css";
import { videoProjects, getSlugsByType } from "@/lib/portfolio-config";
import VideoPlayer from "@/components/video/VideoPlayer";
import { SITE_URL } from "@/lib/constants";
import { getYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { sectionTitleDivider } from "@/components/portfolio/featured-styles";
import {
  projectPage,
  projectHeading,
  videoProjectDescription,
  videoProjectHeader,
  videoProjectIntro,
  compactProjectFacts,
  compactProjectFact,
  compactProjectFactLabel,
  compactProjectFactValue,
} from "@/lib/portfolio-styles";

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  return getSlugsByType("video").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = videoProjects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      images: [{ url: project.ogImage }],
    },
  };
}

export default async function VideoProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = videoProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  const videoObjects = project.videos.flatMap((video) => {
    // External links are not videos playable on this page. Unknown dates are
    // omitted from markup until verified, rather than publishing invented data.
    if (!video.embedUrl || !video.uploadDate) return [];
    const videoId = getYouTubeVideoId(video.embedUrl);
    const description = (Array.isArray(video.description)
      ? video.description.filter((line) => line.trim()).join(" ")
      : video.description?.trim()) || project.description;
    const thumbnail = video.previewImage
      ? new URL(video.previewImage, SITE_URL).href
      : videoId ? getYouTubeThumbnailUrl(videoId) : project.ogImage;
    return [{
      "@type": "VideoObject",
      name: video.title,
      description,
      thumbnailUrl: [thumbnail],
      embedUrl: video.embedUrl,
      uploadDate: video.uploadDate,
    }];
  });
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@graph": videoObjects,
  };
  const descriptionParagraphs = project.longDescription
    ? (Array.isArray(project.longDescription)
        ? project.longDescription
        : project.longDescription.split("\n")
      ).filter((line) => line.trim().length > 0)
    : [];

  return (
    <main className={cx(projectPage, "project-page", "container")}>
      {videoObjects.length > 0 && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd).replace(/</g, "\\u003c") }}
      />}
      <h1 className={cx(projectHeading, "project-heading")}>{project.title}</h1>
      <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
      <div className={cx(videoProjectHeader, "video-project-header")}>
        <div
          className={cx(
            videoProjectDescription,
            videoProjectIntro,
            "project-description",
          )}
        >
          {descriptionParagraphs.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <dl className={cx(compactProjectFacts, "compact-project-facts")}>
          <div className={cx(compactProjectFact, "compact-project-fact")}>
            <dt className={cx(compactProjectFactLabel, "compact-project-fact-label")}>Role</dt>
            <dd className={cx(compactProjectFactValue, "compact-project-fact-value")}>{project.heading}</dd>
          </div>
          <div className={cx(compactProjectFact, "compact-project-fact")}>
            <dt className={cx(compactProjectFactLabel, "compact-project-fact-label")}>Location</dt>
            <dd className={cx(compactProjectFactValue, "compact-project-fact-value")}>
              {project.location ?? "Not specified"}
            </dd>
          </div>
        </dl>
      </div>
      <VideoPlayer videos={project.videos} />
    </main>
  );
}
