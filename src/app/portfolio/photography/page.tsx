import type { Metadata } from "next";
import { cx } from "@/styled-system/css";
import { getPhotographyCards } from "@/lib/portfolio-config";
import ProjectCardsGrid from "@/components/portfolio/ProjectCardsGrid";
import RevealGrid from "@/components/portfolio/RevealGrid";
import { sectionTitleDivider } from "@/components/portfolio/featured-styles";

export const metadata: Metadata = {
  title: "Photography",
  description: "Professional photography portfolio — events, travel, portraits and more.",
};

export default function PhotographyIndexPage() {
  const projects = getPhotographyCards();

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Photography</h1>
      <hr className={cx(sectionTitleDivider, "section-title-divider")} aria-hidden="true" />
      <RevealGrid>
        <ProjectCardsGrid
          projects={projects}
          type="photography"
          fallbackImageHeight={534}
        />
      </RevealGrid>
    </main>
  );
}
