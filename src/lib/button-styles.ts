import { css, cx } from "@/styled-system/css";

/**
 * Panda CSS button helper — equivalent to the old .btn + .btn--{variant} classes.
 * Uses css() (which generates @layer utilities) rather than recipes (@layer recipes)
 * because Tailwind v4 PostCSS strips the Panda-generated @layer recipes block.
 */

const base = css({
  padding: "0.6rem 0.95rem",
  borderRadius: "6px",
  cursor: "pointer",
  alignSelf: "flex-start",
  border: "1px solid transparent",
  font: "inherit",
  fontSize: "0.95rem",
  lineHeight: "1.4",
  textDecoration: "none",
  display: "inline-block",
  _hover: { opacity: 0.95 },
});

const visuals = {
  primary: css({
    background: "#1f1f1f",
    color: "#fff",
    opacity: 1,
    transition: "background 0.15s",
    _hover: { background: "#333", color: "#fff", opacity: 0.95 },
    _focus: { background: "#333", color: "#fff", opacity: 1 },
  }),
  inverted: css({
    background: "#fff",
    color: "var(--charcoal)",
    border: "1px solid var(--border-color)",
    opacity: 1,
    transition: "background 0.15s",
    _hover: {
      background: "#f5f5f5",
      color: "var(--charcoal)",
      border: "1px solid var(--border-color)",
      opacity: 0.95,
    },
    _focus: {
      background: "#f5f5f5",
      color: "var(--charcoal)",
      border: "1px solid var(--border-color)",
      opacity: 1,
    },
  }),
  outline: css({
    background: "transparent",
    color: "var(--charcoal)",
    border: "1px solid var(--border-color)",
    opacity: 1,
    transition: "background 0.15s, color 0.15s, border-color 0.15s",
    _hover: {
      background: "var(--charcoal)",
      color: "#fff",
      borderColor: "var(--charcoal)",
      opacity: 1,
    },
    _focus: {
      background: "transparent",
      color: "var(--charcoal)",
      border: "1px solid var(--border-color)",
      opacity: 1,
    },
  }),
  ghost: css({
    background: "transparent",
    color: "var(--charcoal)",
    border: "none",
    opacity: 1,
  }),
} as const;

const sizeStyles = {
  large: css({
    padding: "0.75rem 1.2rem",
    fontSize: "1rem",
  }),
} as const;

const activeOutline = css({
  background: "var(--charcoal)",
  color: "#fff",
  borderColor: "var(--charcoal)",
  opacity: 1,
  _hover: { background: "#333" },
});

interface BtnOptions {
  visual?: keyof typeof visuals;
  size?: "default" | "large";
  active?: boolean;
}

export function btn(opts?: BtnOptions): string {
  const parts = [base];
  if (opts?.visual) parts.push(visuals[opts.visual]);
  if (opts?.size === "large") parts.push(sizeStyles.large);
  if (opts?.active && opts?.visual === "outline") parts.push(activeOutline);
  return cx(...parts);
}
