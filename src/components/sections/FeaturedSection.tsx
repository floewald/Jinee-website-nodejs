import Link from "next/link";
import Image from "next/image";
import { cx } from "@/styled-system/css";
import { getVideoCards } from "@/lib/portfolio-config";
import { btn } from "@/lib/button-styles";
import { getProjectSlideshowImages, type SlideshowImage } from "@/lib/gallery-images";
import CardSlideshow from "@/components/gallery/CardSlideshow";
import RevealGrid from "@/components/portfolio/RevealGrid";
import {
  featuredProjects,
  sectionDividerLine,
  sectionTitle,
  sectionTitleCenter,
  sectionTitleDivider,
  projectCards,
  projectCard,
  projectCardThumb,
  projectCardImg,
  projectCardBody,
  projectCardTitle,
  projectCardLocation,
  sectionCta,
} from "@/components/portfolio/featured-styles";

export default function FeaturedSection() {
  const videoCards = getVideoCards().slice(0, 6);

  return (
    <section id="portfolio" className={cx(featuredProjects, "featured-projects", "section-bg-white")}>
      <div className={cx(sectionDividerLine, "section-divider-line")} aria-hidden="true" />
      <div className="container">
        <h2 className={cx(sectionTitle, sectionTitleCenter, "section-title", "section-title--center")}>Videography</h2>
        <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />

        <RevealGrid className={cx(projectCards, "project-cards")}>
          {videoCards.map((project, cardIndex) => {
            const slideshowImages = getProjectSlideshowImages(project.slug, "video");
            const previewImages: SlideshowImage[] = slideshowImages.length > 1
              ? slideshowImages
              : (project.portfolioCard!.previewImages ?? []).map((src) => ({ src }));
            return (
            <Link
              key={project.slug}
              href={`/portfolio/video/${project.slug}/`}
              className={cx(projectCard, "project-card")}
            >
              <div className={cx(projectCardThumb, "project-card__thumb")}>
                {previewImages && previewImages.length > 1 ? (
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
                    height={450}
                    loading="lazy"
                    className={cx(projectCardImg, "project-card__img")}
                    unoptimized
                  />
                )}
              </div>
              <div className={cx(projectCardBody, "project-card__body")}>
                <h3 className={cx(projectCardTitle, "project-card__title")}>{project.heading}</h3>
                {project.type === "video" && project.location && (
                  <p className={cx(projectCardLocation, "project-card__location")}>{project.location}</p>
                )}
              </div>
            </Link>
            );
          })}
        </RevealGrid>

        <div className={cx(sectionCta, "section-cta")}>
          <Link href="/portfolio/video/" className={btn({ visual: "primary" })}>
            More Video Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
