import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";
import { portfolioIndexConfig } from "@/lib/portfolio-config";
import type { GalleryImage } from "@/lib/gallery-images";

/** 3×3 travel-photography collage shown on the homepage.
 *  Images are configured in src/content/portfolio/index-config.json → collageImages */

export default function GallerySection() {
  const collageImages: GalleryImage[] = portfolioIndexConfig.collageImages;

  return (
    <section id="gallery" className="section-bg-white gallery-section">
      <div className="collage-hv collage-3x3">
        <GalleryWithLightbox images={collageImages} useColumnsLayout />
      </div>
    </section>
  );
}
