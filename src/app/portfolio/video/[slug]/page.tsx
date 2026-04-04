import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { videoProjects, getSlugsByType } from "@/lib/portfolio-config";
import { SITE_URL } from "@/lib/constants";
import VideoPlayer from "@/components/video/VideoPlayer";

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
    thumbnailUrl: [`${SITE_URL}/assets/video/${slug}/${slug}-800.webp`],
    embedUrl: project.videos[0]?.embedUrl,
    uploadDate: project.videos[0]?.uploadDate ?? "2023-01-01T00:00:00+08:00",
  };

  return (
    <main className="project-page container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <h1 className="project-heading">{project.title}</h1>
      <p className="project-roles">{project.heading}</p>
      {project.location && <p className="project-location">{project.location}</p>}
      {project.longDescription && (
        <p className="project-description">{project.longDescription}</p>
      )}

      <VideoPlayer videos={project.videos} />
    </main>
  );
}
