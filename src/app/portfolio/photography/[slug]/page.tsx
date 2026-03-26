import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  photographyProjects,
  getSlugsByType,
} from "@/lib/portfolio-config";
import { getGalleryImages } from "@/lib/gallery-images";
import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  return getSlugsByType("photography").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = photographyProjects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      images: [{ url: project.ogImage }],
    },
  };
}

export default async function PhotographyProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = photographyProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  const images = getGalleryImages(slug, "photography");

  return (
    <main className="project-page container">
      <h1 className="project-heading">{project.heading}</h1>
      {project.description && (
        <p className="project-description">{project.description}</p>
      )}

      {images.length > 0 ? (
        <GalleryWithLightbox images={images} />
      ) : (
        <p className="gallery-empty">No images available yet.</p>
      )}
    </main>
  );
}
