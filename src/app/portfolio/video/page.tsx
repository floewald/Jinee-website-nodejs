import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getVideoCards, projectPath } from "@/lib/portfolio-config";
import { getProjectSlideshowImages, type SlideshowImage } from "@/lib/gallery-images";
import CardSlideshow from "@/components/gallery/CardSlideshow";

export const metadata: Metadata = {
  title: "Video",
  description: "Documentary and commercial video productions by Jinee Chen.",
};

export default function VideoIndexPage() {
  const projects = getVideoCards();

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Videography</h1>
      <hr className="section-title-divider" aria-hidden="true" />

      <div className="project-cards">
        {projects.map((project) => {
          const slideshowImages = getProjectSlideshowImages(project.slug, "video");
          const previewImages: SlideshowImage[] = slideshowImages.length > 1
            ? slideshowImages
            : (project.portfolioCard!.previewImages ?? []).map((src) => ({ src }));
          return (
          <Link
            key={project.slug}
            href={projectPath(project)}
            className="project-card"
          >
            <div className="project-card__thumb">
              {previewImages && previewImages.length > 1 ? (
                <CardSlideshow
                  images={previewImages}
                  alt={project.portfolioCard!.cardTitle}
                />
              ) : (
                <Image
                  src={project.portfolioCard!.thumbnail}
                  alt={project.portfolioCard!.cardTitle}
                  width={800}
                  height={450}
                  loading="lazy"
                  className="project-card__img"
                  unoptimized
                />
              )}
            </div>
            <div className="project-card__body">
              <h2 className="project-card__title">
                {project.portfolioCard!.cardTitle}
              </h2>
            </div>
          </Link>
          );
        })}
      </div>
    </main>
  );
}
