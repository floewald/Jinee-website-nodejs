import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";
import type { GalleryImage } from "@/lib/gallery-images";

/** 3×3 travel-photography collage shown on the homepage. */

const collageImages: GalleryImage[] = [
  {
    src: "/assets/photography/travel-photography/0019_16-1600.webp",
    alt: "Travel scene — sunlit street with local architecture",
    srcFull: "/assets/photography/travel-photography/0019_16.webp",
  },
  {
    src: "/assets/photography/travel-photography/0015_12-1600.webp",
    alt: "Travel scene — vibrant market in a Southeast Asian city",
    srcFull: "/assets/photography/travel-photography/0015_12.webp",
  },
  {
    src: "/assets/photography/travel-photography/0031_28-1600.webp",
    alt: "Travel scene — golden hour over waterfront skyline",
    srcFull: "/assets/photography/travel-photography/0031_28.webp",
  },
  {
    src: "/assets/photography/travel-photography/0006_3-1600.webp",
    alt: "Travel scene — narrow alleyway decorated with lanterns",
    srcFull: "/assets/photography/travel-photography/0006_3.webp",
  },
  {
    src: "/assets/photography/travel-photography/0005_33-1600.webp",
    alt: "Travel scene — street vendor preparing local cuisine",
    srcFull: "/assets/photography/travel-photography/0005_33.webp",
  },
  {
    src: "/assets/photography/travel-photography/00002-1600.webp",
    alt: "Travel scene — panoramic view of lush tropical landscape",
    srcFull: "/assets/photography/travel-photography/00002.webp",
  },
  {
    src: "/assets/photography/travel-photography/0008_8-1600.webp",
    alt: "Travel scene — candid moment at an outdoor café",
    srcFull: "/assets/photography/travel-photography/0008_8.webp",
  },
  {
    src: "/assets/photography/travel-photography/0035_35-1600.webp",
    alt: "Travel scene — colourful shophouses along a quiet street",
    srcFull: "/assets/photography/travel-photography/0035_35.webp",
  },
  {
    src: "/assets/photography/travel-photography/0002_2-1600.webp",
    alt: "Travel scene — twilight cityscape reflected in calm water",
    srcFull: "/assets/photography/travel-photography/0002_2.webp",
  },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="section-bg-white">
      <div className="collage-hv collage-3x3">
        <GalleryWithLightbox images={collageImages} />
      </div>
    </section>
  );
}
