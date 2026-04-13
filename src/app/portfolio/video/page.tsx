import type { Metadata } from "next";
import { cx } from "@/styled-system/css";
import { getVideoCards } from "@/lib/portfolio-config";
import ProjectCardsGrid from "@/components/portfolio/ProjectCardsGrid";
import RevealGrid from "@/components/portfolio/RevealGrid";
import { sectionTitleDivider } from "@/components/portfolio/featured-styles";

export const metadata: Metadata = {
  title: "Videography",
  description: "Documentary and commercial video productions by Jinee Chen.",
};

export default function VideoIndexPage() {
  const projects = getVideoCards();

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Videography</h1>
      <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
      <RevealGrid>
        <ProjectCardsGrid
          projects={projects}
          type="video"
          fallbackImageHeight={450}
        />
      </RevealGrid>
    </main>
  );
}
