import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";
import { css, cx } from "@/styled-system/css";
import { portfolioIndexConfig } from "@/lib/portfolio-config";
import type { GalleryImage } from "@/lib/gallery-images";
import { galleryDesktopOnly, galleryMobileOnly } from "@/lib/portfolio-styles";

const collage = css({
  width: "100%",
  overflow: "hidden",
  padding: "0 clamp(12px, 1.5vw, 24px)",
});

const gallerySectionStyle = css({ paddingBottom: 0 });

/** 3×3 travel-photography collage shown on the homepage.
 *  Images are configured in src/content/portfolio/index-config.json → collageImages
 *  A curated mobile subset (collageImagesMobile) is shown via CSS at ≤800 px. */

export default function GallerySection() {
  const collageImages: GalleryImage[] = portfolioIndexConfig.collageImages;
  const mobileImages: GalleryImage[] =
    portfolioIndexConfig.collageImagesMobile ?? collageImages;

  return (
    <section id="gallery" className={cx(gallerySectionStyle, "section-bg-white", "gallery-section")}>
      <div className={cx(collage, galleryDesktopOnly, "gallery-desktop-only")}>
        <GalleryWithLightbox images={collageImages} useColumnsLayout />
      </div>
      <div className={cx(collage, galleryMobileOnly, "gallery-mobile-only")}>
        <GalleryWithLightbox images={mobileImages} useColumnsLayout />
      </div>
    </section>
  );
}
