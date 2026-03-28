/**
 * src/app/error.tsx — error boundary tests
 *
 * Verifies the branded error page renders correctly and resets on button click.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import GlobalError from "@/app/error";

describe("GlobalError", () => {
  it("renders an error heading", () => {
    render(<GlobalError error={new Error("boom")} reset={jest.fn()} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("renders a Try again button", () => {
    render(<GlobalError error={new Error("boom")} reset={jest.fn()} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset() when the Try again button is clicked", () => {
    const reset = jest.fn();
    render(<GlobalError error={new Error("boom")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("does not call reset() before the button is clicked", () => {
    const reset = jest.fn();
    render(<GlobalError error={new Error("boom")} reset={reset} />);
    expect(reset).not.toHaveBeenCalled();
  });
});
