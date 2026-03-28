import Link from "next/link";
import Image from "next/image";
import { getVideoCards } from "@/lib/portfolio-config";
import { getProjectSlideshowImages, type SlideshowImage } from "@/lib/gallery-images";
import CardSlideshow from "@/components/gallery/CardSlideshow";
import RevealGrid from "@/components/portfolio/RevealGrid";

export default function FeaturedSection() {
  const videoCards = getVideoCards().slice(0, 6);

  return (
    <section id="portfolio" className="featured-projects section-bg-white">
      {/* Full-viewport-width charcoal rule above the heading */}
      <div className="section-divider-line" aria-hidden="true" />
      <div className="container">
        <h2 className="section-title section-title--center">Videography</h2>
        <hr className="section-title-divider" aria-hidden="true" />

        {/* Video cards */}
        <RevealGrid className="project-cards">
          {videoCards.map((project, cardIndex) => {
            const slideshowImages = getProjectSlideshowImages(project.slug, "video");
            const previewImages: SlideshowImage[] = slideshowImages.length > 1
              ? slideshowImages
              : (project.portfolioCard!.previewImages ?? []).map((src) => ({ src }));
            return (
            <Link
              key={project.slug}
              href={`/portfolio/video/${project.slug}/`}
              className="project-card"
            >
              <div className="project-card__thumb">
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
                    className="project-card__img"
                    unoptimized
                  />
                )}
              </div>
              <div className="project-card__body">
                {project.heading.includes(" | 📍") ? (
                  <>
                    <h3 className="project-card__role">
                      {project.heading.split(" | 📍")[0]}
                    </h3>
                    <p className="project-card__location">
                      📍{project.heading.split(" | 📍")[1]}
                    </p>
                  </>
                ) : (
                  <h3 className="project-card__role">{project.heading}</h3>
                )}
              </div>
            </Link>
            );
          })}
        </RevealGrid>

        <div className="section-cta">
          <Link href="/portfolio/" className="btn btn--primary">
            View More Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
