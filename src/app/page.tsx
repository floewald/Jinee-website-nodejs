import HeroSlideshow from "@/components/sections/HeroSlideshow";
import GallerySection from "@/components/sections/GallerySection";
import FeaturedSection from "@/components/sections/FeaturedSection";
import { portfolioIndexConfig } from "@/lib/portfolio-config";

export default function Home() {
  const heroSlides = portfolioIndexConfig.collageImages.map((img) => ({
    src: img.src,
    alt: img.alt,
  }));

  return (
    <>
      <h1 className="sr-only">
        Jinee Chen — Photographer &amp; Videographer in Singapore
      </h1>
      <HeroSlideshow slides={heroSlides} />
      <GallerySection />
      <FeaturedSection />
    </>
  );
}
