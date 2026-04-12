import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { socialMediaProjects, socialMediaSections, projectPath } from "@/lib/portfolio-config";
import { SOCIAL_MEDIA_PREVIEW_COLUMNS } from "@/lib/constants";
import RevealGrid from "@/components/portfolio/RevealGrid";

export const metadata: Metadata = {
  title: "Social Media",
  description: "Instagram reels, posts and lifestyle content by Jinee Chen.",
};

export default function SocialMediaIndexPage() {
  const visible = socialMediaProjects.filter((p) => p.visible !== false);
  const colStyle = { "--sm-preview-cols": SOCIAL_MEDIA_PREVIEW_COLUMNS } as React.CSSProperties;

  function renderGrid(projects: typeof visible) {
    return (
      <div className="instagram-section" style={colStyle}>
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
      </div>
    );
  }

  return (
    <main className="portfolio-category container">
      {socialMediaSections.map((section) => {
        const projects = visible.filter((p) => p.category === section.key);
        if (!projects.length) return null;
        return (
          <section key={section.key} className="social-media-section">
            <h1 className="page-title">{section.label}</h1>
            <hr className="section-title-divider" aria-hidden="true" />
            {renderGrid(projects)}
          </section>
        );
      })}
    </main>
  );
}
