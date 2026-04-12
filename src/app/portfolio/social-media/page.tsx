import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { socialMediaProjects, projectPath } from "@/lib/portfolio-config";
import RevealGrid from "@/components/portfolio/RevealGrid";

export const metadata: Metadata = {
  title: "Social Media",
  description: "Instagram reels, posts and lifestyle content by Jinee Chen.",
};

export default function SocialMediaIndexPage() {
  const visible = socialMediaProjects.filter((p) => p.visible !== false);
  const lifestyle = visible.filter((p) => p.category === "lifestyle");
  const editorial = visible.filter((p) => p.category === "editorial");
  const other = visible.filter((p) => !p.category);

  function renderGrid(projects: typeof visible) {
    return (
      <RevealGrid className="instagram-previews">
        {projects.map((project) => {
          const href = project.instagramUrl ?? projectPath(project);
          const isExternal = !!project.instagramUrl;
          return (
            <Link
              key={project.slug}
              href={href}
              className="instagram-preview"
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
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
            </Link>
          );
        })}
      </RevealGrid>
    );
  }

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Social Media</h1>
      <hr className="section-title-divider" aria-hidden="true" />

      {other.length > 0 && renderGrid(other)}

      {lifestyle.length > 0 && (
        <>
          <p className="section-category-label">Lifestyle</p>
          {renderGrid(lifestyle)}
        </>
      )}

      {editorial.length > 0 && (
        <>
          <p className="section-category-label">Editorial</p>
          {renderGrid(editorial)}
        </>
      )}
    </main>
  );
}
