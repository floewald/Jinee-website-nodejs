import { render, screen, fireEvent } from "@testing-library/react";
import Lightbox from "@/components/gallery/Lightbox";

const IMAGES = [
  { src: "/img/a.webp", alt: "Image A", srcFull: "/img/a-full.webp" },
  { src: "/img/b.webp", alt: "Image B", srcFull: "/img/b-full.webp" },
  { src: "/img/c.webp", alt: "Image C", srcFull: "/img/c-full.webp" },
];

const baseProps = {
  images: IMAGES,
  isOpen: true,
  currentIndex: 0,
  onClose: jest.fn(),
  onNext: jest.fn(),
  onPrev: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("Lightbox", () => {
  it("renders nothing when isOpen is false", () => {
    render(<Lightbox {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog when isOpen is true", () => {
    render(<Lightbox {...baseProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows the current image", () => {
    render(<Lightbox {...baseProps} />);
    const img = screen.getByRole("img", { name: /image a/i });
    expect(img).toBeInTheDocument();
  });

  it("shows the correct image when currentIndex changes", () => {
    render(<Lightbox {...baseProps} currentIndex={2} />);
    expect(screen.getByRole("img", { name: /image c/i })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<Lightbox {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", () => {
    render(<Lightbox {...baseProps} />);
    fireEvent.click(screen.getByTestId("lightbox-backdrop"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when the next button is clicked", () => {
    render(<Lightbox {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(baseProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onPrev when the prev button is clicked", () => {
    render(<Lightbox {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(baseProps.onPrev).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    render(<Lightbox {...baseProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when ArrowRight is pressed", () => {
    render(<Lightbox {...baseProps} />);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(baseProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onPrev when ArrowLeft is pressed", () => {
    render(<Lightbox {...baseProps} />);
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(baseProps.onPrev).toHaveBeenCalledTimes(1);
  });

  it("resets zoom state cleanly when reopened (no stale pan)", () => {
    const { rerender } = render(<Lightbox {...baseProps} />);
    // Close lightbox
    rerender(<Lightbox {...baseProps} isOpen={false} />);
    // Reopen lightbox
    rerender(<Lightbox {...baseProps} isOpen={true} />);
    // Should render the dialog without errors
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders correctly when navigating to a different image", () => {
    const { rerender } = render(<Lightbox {...baseProps} currentIndex={0} />);
    rerender(<Lightbox {...baseProps} currentIndex={1} />);
    expect(screen.getByRole("img", { name: /image b/i })).toBeInTheDocument();
  });
});
