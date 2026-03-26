import { render, screen, fireEvent } from "@testing-library/react";
import GalleryGrid from "@/components/gallery/GalleryGrid";

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

  it("renders empty grid when images array is empty", () => {
    render(<GalleryGrid images={[]} onImageClick={jest.fn()} />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });
});
