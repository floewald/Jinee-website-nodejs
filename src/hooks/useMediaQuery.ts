import { useState, useEffect } from "react";

/**
 * Returns true when the given CSS media query matches the current viewport.
 * SSR-safe: returns false during server-side rendering.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);

    function onChange(e: MediaQueryListEvent | { matches: boolean }) {
      setMatches(e.matches);
    }

    mql.addEventListener("change", onChange as EventListener);
    return () => mql.removeEventListener("change", onChange as EventListener);
  }, [query]);

  return matches;
}
