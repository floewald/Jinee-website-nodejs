import GallerySection from "@/components/sections/GallerySection";
import FeaturedSection from "@/components/sections/FeaturedSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <h1 className="sr-only">
        Jinee Chen — Photographer &amp; Videographer in Singapore
      </h1>
      <GallerySection />
      <FeaturedSection />
      <AboutSection />
      <div className="section-spacer-white" />
      <ContactSection />
    </>
  );
}
