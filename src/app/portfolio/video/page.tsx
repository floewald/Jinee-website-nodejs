import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getVideoCards, projectPath } from "@/lib/portfolio-config";

export const metadata: Metadata = {
  title: "Video",
  description: "Documentary and commercial video productions by Jinee Chen.",
};

export default function VideoIndexPage() {
  const projects = getVideoCards();

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Video</h1>

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
                height={450}
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
