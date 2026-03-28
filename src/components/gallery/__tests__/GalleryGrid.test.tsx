import { render, screen, fireEvent } from "@testing-library/react";
import GalleryGrid from "@/components/gallery/GalleryGrid";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { unoptimized: _unoptimized, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...rest} />;
  },
}));

// react-masonry-css renders flex columns; mock it to render children directly
// so tests aren't coupled to the library's DOM structure.
jest.mock("react-masonry-css", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="masonry-grid">{children}</div>
  ),
}));

const IMAGES = [
  { src: "/img/a-800.webp", alt: "Photo A", srcFull: "/img/a-1600.webp" },
  { src: "/img/b-800.webp", alt: "Photo B", srcFull: "/img/b-1600.webp" },
  { src: "/img/c-800.webp", alt: "Photo C", srcFull: "/img/c-1600.webp" },
];

describe("GalleryGrid", () => {
  it("renders a grid item for every image", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    const items = screen.getAllByRole("img");
    expect(items).toHaveLength(3);
  });

  it("renders each image with the correct alt text", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(screen.getByRole("img", { name: "Photo A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Photo B" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Photo C" })).toBeInTheDocument();
  });

  it("calls onImageClick(0) when the first image is clicked", () => {
    const onImageClick = jest.fn();
    render(<GalleryGrid images={IMAGES} onImageClick={onImageClick} />);
    fireEvent.click(screen.getByRole("img", { name: "Photo A" }).closest("button")!);
    expect(onImageClick).toHaveBeenCalledWith(0);
  });

  it("calls onImageClick(2) when the third image is clicked", () => {
    const onImageClick = jest.fn();
    render(<GalleryGrid images={IMAGES} onImageClick={onImageClick} />);
    fireEvent.click(screen.getByRole("img", { name: "Photo C" }).closest("button")!);
    expect(onImageClick).toHaveBeenCalledWith(2);
  });

  it("renders nothing when images array is empty", () => {
    const { container } = render(<GalleryGrid images={[]} onImageClick={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders images inside the masonry grid container", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(screen.getByTestId("masonry-grid")).toBeInTheDocument();
  });

  it("does not render portrait background blur divs", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(document.querySelector(".gallery-portrait-bg")).toBeNull();
  });

  it("does not add gallery-item--portrait class to any item", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    expect(document.querySelector(".gallery-item--portrait")).toBeNull();
  });

  it("every button has an accessible aria-label", () => {
    render(<GalleryGrid images={IMAGES} onImageClick={jest.fn()} />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).toHaveAttribute("aria-label");
    });
  });
});
