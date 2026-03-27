import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getPhotographyCards,
  getVideoCards,
  portfolioIndexConfig,
  projectPath,
} from "@/lib/portfolio-config";
import CardSlideshow from "@/components/gallery/CardSlideshow";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Photography, video production, and social media content by Jinee Chen.",
};

/** Extract the project slug from an image path like /assets/social-media/SLUG/... */
function slugFromImage(imagePath: string): string {
  return imagePath.split("/")[3];
}

const MAX_CARDS = 6;

export default function PortfolioPage() {
  const photographyCards = getPhotographyCards().slice(0, MAX_CARDS);
  const videoCards = getVideoCards().slice(0, MAX_CARDS);
  const socialMediaLinks = portfolioIndexConfig.socialMediaLinks;

  return (
    <main>
      {/* Photography section */}
      <section className="portfolio-section section-bg-white">
        <div className="container">
          <h2 className="section-title section-title--center">Photography</h2>
          <hr className="section-title-divider" aria-hidden="true" />
          <div className="project-grid">
            {photographyCards.map((project) => (
              <Link
                key={project.slug}
                href={projectPath(project)}
                className="project-card"
              >
                <div className="project-card__thumb">
                  {project.portfolioCard!.previewImages && project.portfolioCard!.previewImages.length > 1 ? (
                    <CardSlideshow
                      images={project.portfolioCard!.previewImages}
                      alt={project.portfolioCard!.cardTitle}
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
            ))}
          </div>
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
          <div className="project-grid">
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
          </div>
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
          <div className="instagram-previews">
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
                <span className="play-overlay" aria-hidden="true">▶</span>
              </Link>
            ))}
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
