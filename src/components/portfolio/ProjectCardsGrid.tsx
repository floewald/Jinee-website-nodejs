import Link from "next/link";
import Image from "next/image";
import { getProjectSlideshowImages } from "@/lib/gallery-images";
import { projectPath } from "@/lib/portfolio-config";
import CardSlideshow from "@/components/gallery/CardSlideshow";
import type { PortfolioProject, ProjectType } from "@/types/portfolio";
import type { SlideshowImage } from "@/lib/gallery-images";

interface ProjectCardsGridProps {
  projects: PortfolioProject[];
  type: ProjectType;
  /** Height (px) used for the fallback static image (maintains aspect ratio) */
  fallbackImageHeight: number;
}

/**
 * Server Component — renders a grid of portfolio project cards.
 * Each card shows a CardSlideshow when more than one preview image is available,
 * or falls back to a single static thumbnail.
 *
 * Shared between the Photography and Video category index pages.
 */
export default function ProjectCardsGrid({
  projects,
  type,
  fallbackImageHeight,
}: ProjectCardsGridProps) {
  return (
    <div className="project-cards">
      {projects.map((project) => {
        const slideshowImages = getProjectSlideshowImages(project.slug, type);
        const previewImages: SlideshowImage[] =
          slideshowImages.length > 1
            ? slideshowImages
            : (project.portfolioCard?.previewImages ?? []).map((src) => ({ src }));

        return (
          <Link
            key={project.slug}
            href={projectPath(project)}
            className="project-card"
          >
            <div className="project-card__thumb">
              {previewImages.length > 1 ? (
                <CardSlideshow
                  images={previewImages}
                  alt={project.portfolioCard!.cardTitle}
                />
              ) : (
                <Image
                  src={project.portfolioCard!.thumbnail}
                  alt={project.portfolioCard!.cardTitle}
                  width={800}
                  height={fallbackImageHeight}
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
  );
}
