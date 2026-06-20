import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * Returns false for the server render and true once React is running on the
 * client. Using useSyncExternalStore keeps hydration-safe branching explicit
 * without effect-driven state updates.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
