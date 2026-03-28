import HeroSection from "@/components/sections/HeroSection";
import GallerySection from "@/components/sections/GallerySection";
import FeaturedSection from "@/components/sections/FeaturedSection";
import AboutSection from "@/components/sections/AboutSection";

export default function Home() {
  return (
    <>
      <h1 className="sr-only">
        Jinee Chen — Photographer &amp; Videographer in Singapore
      </h1>
      <HeroSection
        src="/assets/photography/travel-photography/0019_16-1600.webp"
        alt="Jinee Chen — travel photography hero"
      />
      <GallerySection />
      <FeaturedSection />
      <AboutSection />
    </>
  );
}
