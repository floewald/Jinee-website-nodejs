import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { cx } from "@/styled-system/css";
import { btn } from "@/lib/button-styles";
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
import {
  sectionTitle,
  sectionTitleCenter,
  sectionTitleDivider,
  sectionCta,
  projectGrid,
  projectCard,
  projectCardThumb,
  projectCardImg,
  projectCardBody,
  projectCardTitle,
  projectCardLocation,
  playOverlay,
  instagramSection,
  instagramPreviews,
  instagramPreview,
  instagramPreviewCard,
  instagramPreviewThumb,
  instagramPreviewImg,
  instagramPreviewBody,
  instagramPreviewTags,
} from "@/components/portfolio/featured-styles";
import { portfolioHub, portfolioSection } from "@/lib/portfolio-styles";

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
    <main className={cx(portfolioHub, "portfolio-hub")}>
      {/* Photography section */}
      <section className={cx(portfolioSection, "portfolio-section", "section-bg-white")}>
        <div className="container">
          <h2 className={cx(sectionTitle, sectionTitleCenter, "section-title", "section-title--center")}>Photography</h2>
          <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
          <RevealGrid className={cx(projectGrid, "project-grid")}>
            {photographyCards.map((project, cardIndex) => {
              const slideshowImages = getProjectSlideshowImages(project.slug, "photography");
              const previewImages: SlideshowImage[] = slideshowImages.length > 1
                ? slideshowImages
                : (project.portfolioCard!.previewImages ?? []).map((src) => ({ src }));
              return (
              <Link
                key={project.slug}
                href={projectPath(project)}
                className={cx(projectCard, "project-card")}
              >
                <div className={cx(projectCardThumb, "project-card__thumb")}>
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
                      className={cx(projectCardImg, "project-card__img")}
                      unoptimized
                    />
                  )}
                </div>
                <div className={cx(projectCardBody, "project-card__body")}>
                  <h3 className={cx(projectCardTitle, "project-card__title")}>
                    {project.title}
                  </h3>
                </div>
              </Link>
              );
            })}
          </RevealGrid>
          <div className={cx(sectionCta, "section-cta")}>
            <Link href="/portfolio/photography/" className={btn({ visual: "primary" })}>
              More Photography Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Video section */}
      <section className={cx(portfolioSection, "portfolio-section", "section-bg-charcoal")}>
        <div className="container">
          <h2 className={cx(sectionTitle, sectionTitleCenter, "section-title", "section-title--center")}>
            Videography
          </h2>
          <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
          <RevealGrid className={cx(projectGrid, "project-grid")}>
            {videoCards.map((project, cardIndex) => {
              const slideshowImages = getProjectSlideshowImages(project.slug, "video");
              const previewImages: SlideshowImage[] = slideshowImages.length > 1
                ? slideshowImages
                : (project.portfolioCard!.previewImages ?? []).map((src) => ({ src }));
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
                      className={cx(projectCardImg, "project-card__img")}
                      unoptimized
                    />
                  )}
                </div>
                <div className={cx(projectCardBody, "project-card__body")}>
                  <h3 className={cx(projectCardTitle, "project-card__title")}>{project.title}</h3>
                  {project.location && (
                    <p className={cx(projectCardLocation, "project-card__location")}>{project.location}</p>
                  )}
                </div>
              </Link>
              );
            })}
          </RevealGrid>
          <div className={cx(sectionCta, "section-cta")}>
            <Link href="/portfolio/video/" className={btn({ visual: "inverted" })}>
              More Video Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Social Media section */}
      <section className={cx(portfolioSection, "portfolio-section", "section-bg-white")}>
        <div className="container">
          <h2 className={cx(sectionTitle, sectionTitleCenter, "section-title", "section-title--center")}>Social Media</h2>
          <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
          <div className={cx(instagramSection, "instagram-section")} style={{ "--sm-preview-cols": SOCIAL_MEDIA_PREVIEW_COLUMNS } as React.CSSProperties}>
            <RevealGrid className={cx(instagramPreviews, "instagram-previews")}>
            {socialMediaPreviews.map((project) => {
              const href = project.instagramUrl ?? "/portfolio/social-media/";
              const isExternal = !!project.instagramUrl;
              return (
                <Link
                  key={project.slug}
                  href={href}
                  className={cx(
                    instagramPreview,
                    "instagram-preview",
                    SOCIAL_MEDIA_CARD_MODE && instagramPreviewCard,
                    SOCIAL_MEDIA_CARD_MODE && "instagram-preview--card",
                  )}
                  {...(isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <div className={cx(instagramPreviewThumb, "instagram-preview__thumb")}>
                    <Image
                      src={project.ogImage.replace("https://jineechen.com", "")}
                      alt={project.title}
                      width={400}
                      height={711}
                      loading="lazy"
                      className={cx(instagramPreviewImg, "instagram-preview__img")}
                      unoptimized
                    />
                    <span className={cx(playOverlay, "play-overlay")} aria-hidden="true">▶</span>
                  </div>
                  {SOCIAL_MEDIA_CARD_MODE && project.tags && project.tags.length > 0 && (
                    <div className={cx(instagramPreviewBody, "instagram-preview__body")}>
                      <p className={cx(instagramPreviewTags, "instagram-preview__tags")}>{project.tags.join(" ")}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </RevealGrid>
          </div>
          <div className={cx(sectionCta, "section-cta")}>
            <Link href="/portfolio/social-media/" className={btn({ visual: "primary" })}>
              More Social Media Projects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
