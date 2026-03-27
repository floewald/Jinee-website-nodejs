import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getPhotographyCards,
  getVideoCards,
  getSocialMediaCards,
  projectPath,
} from "@/lib/portfolio-config";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Photography, video production, and social media content by Jinee Chen.",
};

const MAX_CARDS = 6;

export default function PortfolioPage() {
  const photographyCards = getPhotographyCards().slice(0, MAX_CARDS);
  const videoCards = getVideoCards().slice(0, MAX_CARDS);
  const socialMediaCards = getSocialMediaCards().slice(0, MAX_CARDS);

  return (
    <main>
      {/* Photography section */}
      <section className="portfolio-section section-bg-white">
        <div className="container">
          <h2 className="section-title">Photography</h2>
          <div className="project-grid">
            {photographyCards.map((project) => (
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
                    height={534}
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
            <Link href="/portfolio/photography/" className="btn btn--primary">
              More Photography Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Video section */}
      <section className="portfolio-section section-bg-charcoal">
        <div className="container">
          <h2 className="section-title" style={{ color: "#fff" }}>
            Video
          </h2>
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
          <h2 className="section-title">Social Media</h2>
          <div className="project-grid">
            {socialMediaCards.map((project) => (
              <Link
                key={project.slug}
                href={projectPath(project)}
                className="project-card"
              >
                {project.portfolioCard && (
                  <div className="project-card__thumb">
                    <Image
                      src={project.portfolioCard.thumbnail}
                      alt={project.portfolioCard.cardTitle}
                      width={800}
                      height={800}
                      loading="lazy"
                      className="project-card__img"
                      unoptimized
                    />
                  </div>
                )}
                <div className="project-card__body">
                  <h3 className="project-card__title">
                    {project.portfolioCard?.cardTitle ?? project.title}
                  </h3>
                </div>
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
