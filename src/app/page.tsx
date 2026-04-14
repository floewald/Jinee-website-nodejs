import type { Metadata } from "next";
import HeroSlideshow from "@/components/sections/HeroSlideshow";
import GallerySection from "@/components/sections/GallerySection";
import FeaturedSection from "@/components/sections/FeaturedSection";
import { portfolioIndexConfig } from "@/lib/portfolio-config";
import type { HeroFit } from "@/components/sections/HeroSlideshow";

export const metadata: Metadata = {
  title: "Jinee Chen — Videographer & Photographer in Singapore",
  description:
    "Jinee Chen is a Singapore-based videographer and photographer specialising in documentary storytelling, events, travel, and social media content creation.",
};

export default function Home() {
  const heroSlides = (portfolioIndexConfig.slideshowImages ?? portfolioIndexConfig.collageImages).map((img) => ({
    src: img.src,
    alt: img.alt,
    objectPosition: img.objectPosition,
  }));
  const heroFit: HeroFit = (portfolioIndexConfig.heroFit as HeroFit) ?? "cover";

  return (
    <>
      <h1 className="sr-only">
        Jinee Chen — Photographer &amp; Videographer in Singapore
      </h1>
      <HeroSlideshow slides={heroSlides} fit={heroFit} />
      <GallerySection />
      <FeaturedSection />
    </>
  );
}
