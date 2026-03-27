import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { socialMediaProjects, projectPath } from "@/lib/portfolio-config";

export const metadata: Metadata = {
  title: "Social Media",
  description: "Instagram reels, posts and lifestyle content by Jinee Chen.",
};

export default function SocialMediaIndexPage() {
  const projects = socialMediaProjects;

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Social Media</h1>

      <div className="project-cards">
        {projects.map((project) => (
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
              <h2 className="project-card__title">
                {project.portfolioCard?.cardTitle ?? project.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
