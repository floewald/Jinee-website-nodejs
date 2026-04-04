import type { Metadata } from "next";
import { getVideoCards } from "@/lib/portfolio-config";
import ProjectCardsGrid from "@/components/portfolio/ProjectCardsGrid";
import RevealGrid from "@/components/portfolio/RevealGrid";

export const metadata: Metadata = {
  title: "Videography",
  description: "Documentary and commercial video productions by Jinee Chen.",
};

export default function VideoIndexPage() {
  const projects = getVideoCards();

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Videography</h1>
      <hr className="section-title-divider" aria-hidden="true" />
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
