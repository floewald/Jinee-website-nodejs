/**
 * GallerySection tests (homepage collage)
 *
 * Verifies:
 *  - Collage images are read from portfolioIndexConfig (config-driven)
 *  - Renders the correct number of images from the config
 *  - Section has gallery id for anchor navigation
 */

import { render, screen } from "@testing-library/react";
import GallerySection from "@/components/sections/GallerySection";

// jest.mock is hoisted — arrays must be inlined, not referenced by variable
jest.mock("@/lib/portfolio-config", () => ({
  portfolioIndexConfig: {
    collageImages: [
      { src: "/assets/img1.webp", alt: "Image 1", srcFull: "/assets/img1.webp", width: 800, height: 533 },
      { src: "/assets/img2.webp", alt: "Image 2", srcFull: "/assets/img2.webp", width: 800, height: 533 },
      { src: "/assets/img3.webp", alt: "Image 3", srcFull: "/assets/img3.webp", width: 800, height: 533 },
    ],
    videoSectionTitle: "Video",
  },
}));

// Mock GalleryWithLightbox to isolate GallerySection logic
jest.mock("@/components/gallery/GalleryWithLightbox", () => {
  return function MockGalleryWithLightbox({
    images,
    mobileImages,
  }: {
    images: { src: string; alt: string }[];
    mobileImages?: { src: string; alt: string }[];
  }) {
    return (
      <div
        data-testid="gallery-with-lightbox"
        data-mobile-count={mobileImages?.length ?? 0}
      >
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={img.src} alt={img.alt} />
        ))}
      </div>
    );
  };
});

describe("GallerySection", () => {
  it("renders a section with id 'gallery'", () => {
    render(<GallerySection />);
    expect(document.getElementById("gallery")).toBeInTheDocument();
  });

  it("renders images from config (not hardcoded)", () => {
    render(<GallerySection />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
  });

  it("passes config images to GalleryWithLightbox", () => {
    render(<GallerySection />);
    const gallery = screen.getByTestId("gallery-with-lightbox");
    expect(gallery).toBeInTheDocument();
    expect(gallery).toHaveAttribute("data-mobile-count", "3");
    expect(screen.getByAltText("Image 1")).toBeInTheDocument();
  });

  it("every image has an alt attribute", () => {
    render(<GallerySection />);
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img.getAttribute("alt")).toBeTruthy();
    });
  });
});
