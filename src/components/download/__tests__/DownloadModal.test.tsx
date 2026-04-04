import { render, screen, fireEvent, act } from "@testing-library/react";
import DownloadModal from "@/components/download/DownloadModal";

jest.mock("@/lib/constants", () => ({
  BACKEND_URL: "http://localhost:8080",
  SITE_NAME: "Jinee Chen",
  SITE_EMAIL: "hello@jineechen.com",
  SITE_URL: "https://jineechen.com",
  SITE_TAGLINE: "Visual storyteller",
  GALLERY_COLUMNS: { xs: 2, sm: 3, md: 4 },
}));

const SELECTED = ["image-001.jpg", "image-002.jpg"];

const baseProps = {
  isOpen: true,
  selectedFiles: SELECTED,
  project: "event-photography",
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe("DownloadModal", () => {
  it("renders nothing when isOpen is false", () => {
    render(<DownloadModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog when isOpen is true", () => {
    render(<DownloadModal {...baseProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows the count of selected files", () => {
    render(<DownloadModal {...baseProps} />);
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it("renders a password input", () => {
    render(<DownloadModal {...baseProps} />);
    // Exact string avoids matching aria-label="Show password" on the eye toggle
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders a download submit button", () => {
    render(<DownloadModal {...baseProps} />);
    expect(
      screen.getByRole("button", { name: /download/i })
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<DownloadModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", () => {
    render(<DownloadModal {...baseProps} />);
    fireEvent.click(screen.getByTestId("download-backdrop"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an error message on wrong password response", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "csrf-abc" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "error", message: "Invalid password." }),
      });

    render(<DownloadModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    const error = await screen.findByText(/invalid password|error/i);
    expect(error).toBeInTheDocument();
  });

  it("disables the submit button while downloading", async () => {
    let resolve: (v: unknown) => void;
    (global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise((res) => {
        resolve = res;
      })
    );

    render(<DownloadModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(
      screen.getByRole("button", { name: /download|processing/i })
    ).toBeDisabled();

    await act(async () => {
      resolve!({ ok: true, json: async () => ({ token: "t" }) });
    });
  });
});
