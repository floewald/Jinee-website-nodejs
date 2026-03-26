import { render, screen, fireEvent } from "@testing-library/react";
import GallerySelection from "@/components/download/GallerySelection";

const IMAGES = [
  { src: "/img/a-800.webp", alt: "Photo A", srcFull: "/img/a-1600.webp" },
  { src: "/img/b-800.webp", alt: "Photo B", srcFull: "/img/b-1600.webp" },
  { src: "/img/c-800.webp", alt: "Photo C", srcFull: "/img/c-1600.webp" },
];

describe("GallerySelection", () => {
  it("renders all images", () => {
    render(
      <GallerySelection
        images={IMAGES}
        selectionMode={false}
        selected={[]}
        onImageClick={jest.fn()}
        onSelectionChange={jest.fn()}
      />
    );
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("shows no checkboxes when selectionMode is false", () => {
    render(
      <GallerySelection
        images={IMAGES}
        selectionMode={false}
        selected={[]}
        onImageClick={jest.fn()}
        onSelectionChange={jest.fn()}
      />
    );
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("shows checkboxes when selectionMode is true", () => {
    render(
      <GallerySelection
        images={IMAGES}
        selectionMode={true}
        selected={[]}
        onImageClick={jest.fn()}
        onSelectionChange={jest.fn()}
      />
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("calls onSelectionChange when a checkbox is toggled", () => {
    const onSelectionChange = jest.fn();
    render(
      <GallerySelection
        images={IMAGES}
        selectionMode={true}
        selected={[]}
        onImageClick={jest.fn()}
        onSelectionChange={onSelectionChange}
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("calls onImageClick when an image is clicked in view mode", () => {
    const onImageClick = jest.fn();
    render(
      <GallerySelection
        images={IMAGES}
        selectionMode={false}
        selected={[]}
        onImageClick={onImageClick}
        onSelectionChange={jest.fn()}
      />
    );
    fireEvent.click(
      screen.getByRole("img", { name: "Photo A" }).closest("button")!
    );
    expect(onImageClick).toHaveBeenCalledWith(0);
  });
});
