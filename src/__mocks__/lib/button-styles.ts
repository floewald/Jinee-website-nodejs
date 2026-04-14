// Mock for @/lib/button-styles — returns variant-aware class names
// so that unit tests can verify the correct variant props are passed.
export function btn(opts?: { visual?: string; size?: string; active?: boolean }): string {
  const parts = ["panda-btn"];
  if (opts?.visual) parts.push(`visual-${opts.visual}`);
  if (opts?.size && opts.size !== "default") parts.push(`size-${opts.size}`);
  if (opts?.active) parts.push("active");
  return parts.join(" ");
}
