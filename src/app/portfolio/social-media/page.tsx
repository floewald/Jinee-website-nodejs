import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { cx } from "@/styled-system/css";
import { socialMediaProjects, socialMediaSections } from "@/lib/portfolio-config";
import { SOCIAL_MEDIA_PREVIEW_COLUMNS, SOCIAL_MEDIA_CARD_MODE } from "@/lib/constants";
import RevealGrid from "@/components/portfolio/RevealGrid";
import {
  sectionTitleDivider,
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
import { portfolioCategory, pageTitle } from "@/lib/portfolio-styles";

export const metadata: Metadata = {
  title: "Social Media",
  description: "Instagram reels, posts and lifestyle content by Jinee Chen.",
};

export default function SocialMediaIndexPage() {
  const visible = socialMediaProjects.filter((p) => p.visible !== false);
  const colStyle = { "--sm-preview-cols": SOCIAL_MEDIA_PREVIEW_COLUMNS } as React.CSSProperties;

  function renderGrid(projects: typeof visible) {
    return (
      <div className={cx(instagramSection, "instagram-section")} style={colStyle}>
        <RevealGrid className={cx(instagramPreviews, "instagram-previews")}>
          {projects.map((project) => {
            const href = project.instagramUrl!;
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
                target="_blank"
                rel="noopener noreferrer"
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
    );
  }

  return (
    <main className={cx(portfolioCategory, "portfolio-category", "container")}>
      {socialMediaSections.map((section) => {
        const projects = visible.filter((p) => p.category === section.key);
        if (!projects.length) return null;
        return (
          <section key={section.key} className="social-media-section">
            <h1 className={cx(pageTitle, "page-title")}>{section.label}</h1>
            <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
            {renderGrid(projects)}
          </section>
        );
      })}
    </main>
  );
}
