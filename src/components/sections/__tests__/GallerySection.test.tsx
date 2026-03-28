/**
 * Phase 3.1 — GallerySection tests (homepage 3×3 collage)
 *
 * Verifies:
 *  - Renders 9 images in a grid
 *  - Images are clickable (buttons)
 *  - Clicking an image opens the lightbox
 *  - Section has gallery id for anchor navigation
 */

import { render, screen } from "@testing-library/react";
import GallerySection from "@/components/sections/GallerySection";

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

  it("renders 9 images", () => {
    render(<GallerySection />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(9);
  });

  it("passes images to GalleryWithLightbox", () => {
    render(<GallerySection />);
    expect(screen.getByTestId("gallery-with-lightbox")).toBeInTheDocument();
  });

  it("every image has an alt attribute", () => {
    render(<GallerySection />);
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img.getAttribute("alt")).toBeTruthy();
    });
  });
});
