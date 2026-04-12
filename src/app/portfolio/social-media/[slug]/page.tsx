import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { socialMediaProjects } from "@/lib/portfolio-config";
import { getGalleryImages } from "@/lib/gallery-images";
import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  // Only generate a page for projects that have actual content to display
  // (a gallery or custom HTML). Projects with only an instagramUrl link
  // directly to Instagram from the grid and don't need a subpage.
  return socialMediaProjects
    .filter((p) => p.visible !== false && (p.hasGallery || p.customContent))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = socialMediaProjects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      images: [{ url: project.ogImage }],
    },
  };
}

export default async function SocialMediaProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = socialMediaProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  const images = project.hasGallery ? getGalleryImages(slug, "social-media") : [];

  return (
    <main className="project-page container">
      <h1 className="project-heading">{project.heading}</h1>
      <hr className="section-title-divider" aria-hidden="true" />
      {project.description && (
        <p className="project-description">{project.description}</p>
      )}

      {project.hasGallery && images.length > 0 ? (
        <GalleryWithLightbox images={images} showSlideshow />
      ) : project.customContent ? (
        <div
          className="project-custom-content"
          dangerouslySetInnerHTML={{ __html: project.customContent }}
        />
      ) : null}
    </main>
  );
}
