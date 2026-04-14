import Link from "next/link";
import Image from "next/image";
import { cx } from "@/styled-system/css";
import { getProjectSlideshowImages } from "@/lib/gallery-images";
import { projectPath } from "@/lib/portfolio-config";
import CardSlideshow from "@/components/gallery/CardSlideshow";
import type { PortfolioProject, ProjectType } from "@/types/portfolio";
import type { SlideshowImage } from "@/lib/gallery-images";
import {
  projectCards,
  projectCard,
  projectCardThumb,
  projectCardImg,
  projectCardBody,
  projectCardTitle,
  projectCardLocation,
} from "./featured-styles";

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
    <div className={cx(projectCards, "project-cards")}>
      {projects.map((project, cardIndex) => {
        const slideshowImages = getProjectSlideshowImages(project.slug, type);
        const previewImages: SlideshowImage[] =
          slideshowImages.length > 1
            ? slideshowImages
            : (project.portfolioCard?.previewImages ?? []).map((src) => ({ src }));

        return (
          <Link
            key={project.slug}
            href={projectPath(project)}
            className={cx(projectCard, "project-card")}
          >
            <div className={cx(projectCardThumb, "project-card__thumb")}>
              {previewImages.length > 1 ? (
                <CardSlideshow
                  images={previewImages}
                  alt={project.portfolioCard!.cardTitle}
                  cardIndex={cardIndex}
                />
              ) : (
                <Image
                  src={project.portfolioCard!.thumbnail}
                  alt={project.portfolioCard!.cardTitle}
                  width={800}
                  height={fallbackImageHeight}
                  loading="lazy"
                  className={cx(projectCardImg, "project-card__img")}
                  unoptimized
                />
              )}
            </div>
            <div className={cx(projectCardBody, "project-card__body")}>
              <h2 className={cx(projectCardTitle, "project-card__title")}>{project.title}</h2>
              {project.type === "video" && project.location && (
                <p className={cx(projectCardLocation, "project-card__location")}>{project.location}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
