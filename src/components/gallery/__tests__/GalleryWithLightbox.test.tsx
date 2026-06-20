import { fireEvent, render, screen } from "@testing-library/react";
import GalleryWithLightbox from "@/components/gallery/GalleryWithLightbox";

const mockUseMediaQuery = jest.fn();

jest.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}));

jest.mock("@/components/gallery/GalleryGrid", () => ({
  __esModule: true,
  default: ({
    images,
    onImageClick,
    hiddenOnMobileIndices,
  }: {
    images: Array<{ alt: string }>;
    onImageClick: (index: number) => void;
    hiddenOnMobileIndices?: number[];
  }) => (
    <div data-testid="gallery-grid" data-hidden={hiddenOnMobileIndices?.join(",") ?? ""}>
      {images.map((image, index) => (
        <button
          key={image.alt}
          type="button"
          data-testid={`grid-item-${index}`}
          onClick={() => onImageClick(index)}
        >
          {image.alt}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/components/gallery/Lightbox", () => ({
  __esModule: true,
  default: ({
    images,
    isOpen,
    currentIndex,
  }: {
    images: Array<{ alt: string }>;
    isOpen: boolean;
    currentIndex: number;
  }) => (
    <div
      data-testid="lightbox"
      data-current-index={String(currentIndex)}
      data-images={images.map((image) => image.alt).join("|")}
      data-open={String(isOpen)}
    />
  ),
}));

const DESKTOP_IMAGES = [
  { src: "/img/one.webp", srcFull: "/img/one-full.webp", alt: "One", width: 1600, height: 1061 },
  { src: "/img/two.webp", srcFull: "/img/two-full.webp", alt: "Two", width: 1600, height: 1061 },
  { src: "/img/three.webp", srcFull: "/img/three-full.webp", alt: "Three", width: 1600, height: 1061 },
  { src: "/img/four.webp", srcFull: "/img/four-full.webp", alt: "Four", width: 1600, height: 2400 },
];

const MOBILE_IMAGES = [
  DESKTOP_IMAGES[0],
  DESKTOP_IMAGES[2],
  DESKTOP_IMAGES[3],
];

describe("GalleryWithLightbox", () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset();
  });

  it("keeps the full desktop image set active on wider viewports", () => {
    mockUseMediaQuery.mockReturnValue(false);

    render(<GalleryWithLightbox images={DESKTOP_IMAGES} mobileImages={MOBILE_IMAGES} useColumnsLayout />);

    expect(screen.getByTestId("gallery-grid")).toHaveAttribute("data-hidden", "1");
    expect(screen.getByTestId("lightbox")).toHaveAttribute("data-images", "One|Two|Three|Four");
  });

  it("uses the curated mobile subset for lightbox navigation on mobile", () => {
    mockUseMediaQuery.mockReturnValue(true);

    render(<GalleryWithLightbox images={DESKTOP_IMAGES} mobileImages={MOBILE_IMAGES} useColumnsLayout />);

    fireEvent.click(screen.getByTestId("grid-item-2"));

    expect(screen.getByTestId("lightbox")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("lightbox")).toHaveAttribute("data-images", "One|Three|Four");
    expect(screen.getByTestId("lightbox")).toHaveAttribute("data-current-index", "1");
  });
});
