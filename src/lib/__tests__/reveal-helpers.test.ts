describe("reveal-helpers", () => {
  afterEach(() => {
    jest.resetModules();
    jest.unmock("@/lib/reveal-state");
  });

  it("settles reduced-motion items without entering the animating state", () => {
    jest.isolateModules(() => {
      jest.doMock("@/lib/reveal-state", () => {
        const actual = jest.requireActual("@/lib/reveal-state");
        return {
          ...actual,
          markRevealAnimating: jest.fn(() => true),
          markRevealSettled: jest.fn(actual.markRevealSettled),
        };
      });

      const revealState = jest.requireMock("@/lib/reveal-state") as {
        markRevealAnimating: jest.Mock;
        markRevealSettled: jest.Mock;
      };
      const { animateRevealElement } = jest.requireActual(
        "@/lib/reveal-helpers"
      ) as typeof import("@/lib/reveal-helpers");

      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const item = document.createElement("div");
      Object.defineProperty(item, "animate", {
        configurable: true,
        writable: true,
        value: jest.fn(),
      });
      jest
        .spyOn(item, "getBoundingClientRect")
        .mockReturnValue({
          top: window.innerHeight + 5,
          bottom: window.innerHeight + 205,
          left: 0,
          right: 200,
          width: 200,
          height: 200,
          x: 0,
          y: window.innerHeight + 5,
          toJSON: () => ({}),
        } as DOMRect);

      animateRevealElement(item);

      expect(revealState.markRevealAnimating).not.toHaveBeenCalled();
      expect(revealState.markRevealSettled).toHaveBeenCalledWith(item);
    });
  });
});
