import type { Metadata } from "next";
import { getPhotographyCards } from "@/lib/portfolio-config";
import ProjectCardsGrid from "@/components/portfolio/ProjectCardsGrid";
import RevealGrid from "@/components/portfolio/RevealGrid";

export const metadata: Metadata = {
  title: "Photography",
  description: "Professional photography portfolio — events, travel, portraits and more.",
};

export default function PhotographyIndexPage() {
  const projects = getPhotographyCards();

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Photography</h1>
      <hr className="section-title-divider" aria-hidden="true" />
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
