import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  photographyProjects,
  getSlugsByType,
} from "@/lib/portfolio-config";
import { SITE_URL } from "@/lib/constants";
import { getGalleryImages } from "@/lib/gallery-images";
import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";
import GalleryWithDownload from "@/components/download/GalleryWithDownload";

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

  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/portfolio/photography/${slug}/`,
    author: {
      "@type": "Person",
      name: "Jinee Chen",
      url: `${SITE_URL}/`,
    },
  };

  return (
    <main className="project-page container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <h1 className="project-heading">{project.heading}</h1>
      {project.description && (
        <p className="project-description">{project.description}</p>
      )}

      {images.length > 0 ? (
        project.enableDownload ? (
          <GalleryWithDownload images={images} project={slug} />
        ) : (
          <GalleryWithLightbox images={images} />
        )
      ) : (
        <p className="gallery-empty">No images available yet.</p>
      )}
    </main>
  );
}
