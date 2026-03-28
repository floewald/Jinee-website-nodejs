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
      { src: "/assets/img1.webp", alt: "Image 1", srcFull: "/assets/img1.webp" },
      { src: "/assets/img2.webp", alt: "Image 2", srcFull: "/assets/img2.webp" },
      { src: "/assets/img3.webp", alt: "Image 3", srcFull: "/assets/img3.webp" },
    ],
    socialMediaLinks: [],
    videoSectionTitle: "Video",
  },
}));

// Mock GalleryWithLightbox to isolate GallerySection logic
jest.mock("@/components/gallery/GalleryWithLightbox", () => {
  return function MockGalleryWithLightbox({
    images,
  }: {
    images: { src: string; alt: string }[];
  }) {
    return (
      <div data-testid="gallery-with-lightbox">
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
    expect(images).toHaveLength(3); // matches the 3 mock collage images
  });

  it("passes config images to GalleryWithLightbox", () => {
    render(<GallerySection />);
    expect(screen.getByTestId("gallery-with-lightbox")).toBeInTheDocument();
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
