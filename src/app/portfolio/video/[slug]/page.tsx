import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { videoProjects, getSlugsByType } from "@/lib/portfolio-config";
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

  return (
    <main className="project-page container">
      <h1 className="project-heading">{project.heading}</h1>
      {project.longDescription && (
        <p className="project-description">{project.longDescription}</p>
      )}

      <VideoPlayer videos={project.videos} />
    </main>
  );
}
