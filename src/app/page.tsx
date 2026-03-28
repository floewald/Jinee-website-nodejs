import HeroSlideshow from "@/components/sections/HeroSlideshow";
import GallerySection from "@/components/sections/GallerySection";
import FeaturedSection from "@/components/sections/FeaturedSection";
import { portfolioIndexConfig } from "@/lib/portfolio-config";
import type { HeroFit } from "@/components/sections/HeroSlideshow";

export default function Home() {
  const heroSlides = portfolioIndexConfig.collageImages.map((img) => ({
    src: img.src,
    alt: img.alt,
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
