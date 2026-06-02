import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cx } from "@/styled-system/css";
import { videoProjects, getSlugsByType } from "@/lib/portfolio-config";
import VideoPlayer from "@/components/video/VideoPlayer";
import { sectionTitleDivider } from "@/components/portfolio/featured-styles";
import {
  projectPage,
  projectHeading,
  projectDescription,
  projectMeta,
  projectRoles,
  projectLocation,
  videoProjectDescription,
  videoSectionHeading,
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

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: project.videos[0]?.title ?? project.title,
    description: project.description,
    thumbnailUrl: [project.ogImage],
    embedUrl: project.videos[0]?.embedUrl,
    uploadDate: project.videos[0]?.uploadDate ?? "2023-01-01T00:00:00+08:00",
  };
  const descriptionParagraphs = project.longDescription
    ? (Array.isArray(project.longDescription)
        ? project.longDescription
        : project.longDescription.split("\n")
      ).filter((line) => line.trim().length > 0)
    : [];

  return (
    <main className={cx(projectPage, "project-page", "container")}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <h1 className={cx(projectHeading, "project-heading")}>{project.title}</h1>
      <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
      <div className={cx(projectMeta, "project-meta")}>
        <p className={cx(projectRoles, "project-roles")}>{project.heading}</p>
        {project.location && <p className={cx(projectLocation, "project-location")}>{project.location}</p>}
      </div>
      {descriptionParagraphs.length > 0 && (
        <div className={cx(projectDescription, videoProjectDescription, "project-description")}>
          {descriptionParagraphs.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {project.videos.length > 1 && (
        <h2 className={cx(videoSectionHeading, "video-section-heading")}>Episodes</h2>
      )}
      <VideoPlayer videos={project.videos} />
    </main>
  );
}
