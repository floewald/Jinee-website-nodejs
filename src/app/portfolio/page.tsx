import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getPhotographyCards,
  getVideoCards,
  portfolioIndexConfig,
  projectPath,
} from "@/lib/portfolio-config";
import { MAX_CARDS } from "@/lib/constants";
import { getProjectSlideshowImages, type SlideshowImage } from "@/lib/gallery-images";
import CardSlideshow from "@/components/gallery/CardSlideshow";
import RevealGrid from "@/components/portfolio/RevealGrid";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Photography, video production, and social media content by Jinee Chen.",
};

/** Extract the project slug from an image path like /assets/social-media/SLUG/... */
function slugFromImage(imagePath: string): string {
  return imagePath.split("/")[3];
}

export default function PortfolioPage() {
  const photographyCards = getPhotographyCards().slice(0, MAX_CARDS);
  const videoCards = getVideoCards().slice(0, MAX_CARDS);
  const socialMediaLinks = portfolioIndexConfig.socialMediaLinks;

  return (
    <main className="portfolio-hub">
      {/* Photography section */}
      <section className="portfolio-section section-bg-white">
        <div className="container">
          <h2 className="section-title section-title--center">Photography</h2>
          <hr className="section-title-divider" aria-hidden="true" />
          <RevealGrid className="project-grid">
            {photographyCards.map((project, cardIndex) => {
              const slideshowImages = getProjectSlideshowImages(project.slug, "photography");
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
                      cardIndex={cardIndex}
                    />
                  ) : (
                    <Image
                      src={project.portfolioCard!.thumbnail}
                      alt={project.portfolioCard!.cardTitle}
                      width={800}
                      height={534}
                      loading="lazy"
                      className="project-card__img"
                      unoptimized
                    />
                  )}
                </div>
                <div className="project-card__body">
                  <h3 className="project-card__title">
                    {project.portfolioCard!.cardTitle}
                  </h3>
                </div>
              </Link>
              );
            })}
          </RevealGrid>
          <div className="section-cta">
            <Link href="/portfolio/photography/" className="btn btn--primary">
              More Photography Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Video section */}
      <section className="portfolio-section section-bg-charcoal">
        <div className="container">
          <h2 className="section-title section-title--center" style={{ color: "#fff" }}>
            Videography
          </h2>
          <hr className="section-title-divider" style={{ borderTopColor: "rgba(255,255,255,0.2)" }} aria-hidden="true" />
          <RevealGrid className="project-grid">
            {videoCards.map((project) => (
              <Link
                key={project.slug}
                href={projectPath(project)}
                className="project-card"
              >
                <div className="project-card__thumb">
                  <Image
                    src={project.portfolioCard!.thumbnail}
                    alt={project.portfolioCard!.cardTitle}
                    width={800}
                    height={450}
                    loading="lazy"
                    className="project-card__img"
                    unoptimized
                  />
                </div>
                <div className="project-card__body">
                  <h3 className="project-card__title">
                    {project.portfolioCard!.cardTitle}
                  </h3>
                </div>
              </Link>
            ))}
          </RevealGrid>
          <div className="section-cta">
            <Link href="/portfolio/video/" className="btn btn--inverted">
              More Video Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Social Media section */}
      <section className="portfolio-section section-bg-white">
        <div className="container">
          <h2 className="section-title section-title--center">Social Media</h2>
          <hr className="section-title-divider" aria-hidden="true" />
          <RevealGrid className="instagram-previews">
            {socialMediaLinks.map((link) => (
              <Link
                key={link.url}
                href={`/portfolio/social-media/${slugFromImage(link.image)}/`}
                className="instagram-preview"
              >
                <Image
                  src={link.image}
                  alt={link.alt}
                  width={400}
                  height={711}
                  loading="lazy"
                  className="instagram-preview__img"
                  unoptimized
                />
              </Link>
            ))}
          </RevealGrid>
          <div className="section-cta">
            <Link href="/portfolio/social-media/" className="btn btn--primary">
              More Social Media Projects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
