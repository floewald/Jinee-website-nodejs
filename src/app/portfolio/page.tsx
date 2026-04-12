import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getPhotographyCards,
  getVideoCards,
  socialMediaProjects,
  projectPath,
} from "@/lib/portfolio-config";
import { MAX_CARDS, SOCIAL_MEDIA_PREVIEW_COLUMNS, SOCIAL_MEDIA_CARD_MODE } from "@/lib/constants";
import { getProjectSlideshowImages, type SlideshowImage } from "@/lib/gallery-images";
import CardSlideshow from "@/components/gallery/CardSlideshow";
import RevealGrid from "@/components/portfolio/RevealGrid";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Photography, video production, and social media content by Jinee Chen.",
};

export default function PortfolioPage() {
  const photographyCards = getPhotographyCards().slice(0, MAX_CARDS);
  const videoCards = getVideoCards().slice(0, MAX_CARDS);
  const socialMediaPreviews = socialMediaProjects
    .filter((p) => p.visible !== false)
    .slice(0, 5);

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
                      alt={project.title}
                      cardIndex={cardIndex}
                    />
                  ) : (
                    <Image
                      src={project.portfolioCard!.thumbnail}
                      alt={project.title}
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
                    {project.title}
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
          <h2 className="section-title section-title--center">
            Videography
          </h2>
          <hr className="section-title-divider" aria-hidden="true" />
          <RevealGrid className="project-grid">
            {videoCards.map((project, cardIndex) => {
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
                  {previewImages.length > 1 ? (
                    <CardSlideshow
                      images={previewImages}
                      alt={project.title}
                      cardIndex={cardIndex}
                    />
                  ) : (
                    <Image
                      src={project.portfolioCard!.thumbnail}
                      alt={project.title}
                      width={800}
                      height={450}
                      loading="lazy"
                      className="project-card__img"
                      unoptimized
                    />
                  )}
                </div>
                <div className="project-card__body">
                  <h3 className="project-card__title">{project.title}</h3>
                  {project.location && (
                    <p className="project-card__location">{project.location}</p>
                  )}
                </div>
              </Link>
              );
            })}
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
          <div className="instagram-section" style={{ "--sm-preview-cols": SOCIAL_MEDIA_PREVIEW_COLUMNS } as React.CSSProperties}>
            <RevealGrid className="instagram-previews">
            {socialMediaPreviews.map((project) => {
              const href = project.instagramUrl ?? projectPath(project);
              const isExternal = !!project.instagramUrl;
              const previewClass = `instagram-preview${SOCIAL_MEDIA_CARD_MODE ? " instagram-preview--card" : ""}`;
              return (
                <Link
                  key={project.slug}
                  href={href}
                  className={previewClass}
                  {...(isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <div className="instagram-preview__thumb">
                    <Image
                      src={project.ogImage.replace("https://jineechen.com", "")}
                      alt={project.title}
                      width={400}
                      height={711}
                      loading="lazy"
                      className="instagram-preview__img"
                      unoptimized
                    />
                    <span className="play-overlay" aria-hidden="true">▶</span>
                  </div>
                  {SOCIAL_MEDIA_CARD_MODE && project.tags && project.tags.length > 0 && (
                    <div className="instagram-preview__body">
                      <p className="instagram-preview__tags">{project.tags.join(" ")}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </RevealGrid>
          </div>
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
