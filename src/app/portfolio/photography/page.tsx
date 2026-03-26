import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPhotographyCards, projectPath } from "@/lib/portfolio-config";

export const metadata: Metadata = {
  title: "Photography",
  description: "Professional photography portfolio — events, travel, portraits and more.",
};

export default function PhotographyIndexPage() {
  const projects = getPhotographyCards();

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Photography</h1>

      <div className="project-cards">
        {projects.map((project) => (
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
              <h2 className="project-card__title">
                {project.portfolioCard!.cardTitle}
              </h2>
              <p className="project-card__desc">{project.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
