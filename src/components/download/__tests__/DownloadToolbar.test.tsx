import { render, screen, fireEvent, act } from "@testing-library/react";
import DownloadToolbar from "@/components/download/DownloadToolbar";

describe("DownloadToolbar", () => {
  const baseProps = {
    selectionMode: false,
    selectedCount: 0,
    totalCount: 5,
    onToggleSelection: jest.fn(),
    onSelectAll: jest.fn(),
    onClearSelection: jest.fn(),
    onDownload: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders a toggle select button", () => {
    render(<DownloadToolbar {...baseProps} />);
    expect(
      screen.getByRole("button", { name: /select/i })
    ).toBeInTheDocument();
  });

  it("calls onToggleSelection when toggle button is clicked", () => {
    render(<DownloadToolbar {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /select/i }));
    expect(baseProps.onToggleSelection).toHaveBeenCalledTimes(1);
  });

  it("shows select all and clear buttons when selectionMode is active", () => {
    render(<DownloadToolbar {...baseProps} selectionMode={true} />);
    expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("hides select all and clear buttons when selectionMode is off", () => {
    render(<DownloadToolbar {...baseProps} selectionMode={false} />);
    expect(screen.queryByRole("button", { name: /^all$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("shows the selected count", () => {
    render(
      <DownloadToolbar {...baseProps} selectionMode={true} selectedCount={3} />
    );
    expect(screen.getByText(/3 of 5 selected/i)).toBeInTheDocument();
  });

  it("shows a download button when items are selected", () => {
    render(
      <DownloadToolbar {...baseProps} selectionMode={true} selectedCount={2} />
    );
    expect(
      screen.getByRole("button", { name: /download/i })
    ).toBeInTheDocument();
  });

  it("calls onDownload when download button is clicked", () => {
    render(
      <DownloadToolbar {...baseProps} selectionMode={true} selectedCount={1} />
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(baseProps.onDownload).toHaveBeenCalledTimes(1);
  });

  it("shows All button as active when all images are selected", () => {
    render(
      <DownloadToolbar {...baseProps} selectionMode={true} selectedCount={5} totalCount={5} />
    );
    expect(screen.getByRole("button", { name: /^all$/i })).toHaveClass("active");
  });

  it("shows All button as inactive when not all images are selected", () => {
    render(
      <DownloadToolbar {...baseProps} selectionMode={true} selectedCount={3} totalCount={5} />
    );
    expect(screen.getByRole("button", { name: /^all$/i })).not.toHaveClass("active");
  });

  it("flashes Clear button as active for 100ms then resets", () => {
    jest.useFakeTimers();
    render(<DownloadToolbar {...baseProps} selectionMode={true} />);
    const clearBtn = screen.getByRole("button", { name: /clear/i });

    fireEvent.click(clearBtn);
    expect(clearBtn).toHaveClass("active");

    act(() => jest.advanceTimersByTime(100));
    expect(clearBtn).not.toHaveClass("active");
    jest.useRealTimers();
  });

  it("hides All button when selection mode is toggled off", () => {
    const { rerender } = render(
      <DownloadToolbar {...baseProps} selectionMode={true} selectedCount={5} totalCount={5} />
    );
    expect(screen.getByRole("button", { name: /^all$/i })).toHaveClass("active");

    rerender(<DownloadToolbar {...baseProps} selectionMode={false} />);
    expect(screen.queryByRole("button", { name: /^all$/i })).not.toBeInTheDocument();
  });
});
