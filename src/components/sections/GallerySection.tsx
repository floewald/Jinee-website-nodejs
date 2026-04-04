import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";
import { portfolioIndexConfig } from "@/lib/portfolio-config";
import type { GalleryImage } from "@/lib/gallery-images";

/** 3×3 travel-photography collage shown on the homepage.
 *  Images are configured in src/content/portfolio/index-config.json → collageImages
 *  A curated mobile subset (collageImagesMobile) is shown via CSS at ≤800 px. */

export default function GallerySection() {
  const collageImages: GalleryImage[] = portfolioIndexConfig.collageImages;
  const mobileImages: GalleryImage[] =
    portfolioIndexConfig.collageImagesMobile ?? collageImages;

  return (
    <section id="gallery" className="section-bg-white gallery-section">
      <div className="collage-hv collage-3x3 gallery-desktop-only">
        <GalleryWithLightbox images={collageImages} useColumnsLayout />
      </div>
      <div className="collage-hv gallery-mobile-only">
        <GalleryWithLightbox images={mobileImages} useColumnsLayout />
      </div>
    </section>
  );
}
