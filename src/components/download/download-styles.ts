import { css } from "@/styled-system/css";

/* ── Download toolbar ─────────────────────────────────────────────────────── */

/** Spacing for the idle Select chip (rendered directly in <main>, so the sticky
 *  bar that replaces it can stick within the tall page rather than a short wrapper). */
export const toolbarSelectIdle = css({
  marginBottom: "1rem",
});

/* ── Toolbar: an outline "Select" chip that opens a contained selection bar ──
   One palette throughout: ink #1f1f1f (--charcoal) · border #dcdcdc · surface
   #fafafa · hover #f3f3f3. Idle shows only the Select chip; selection mode
   replaces it with the bar, so no control ever sits alone beside the bar. */

const chipBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.5rem 0.95rem",
  borderRadius: "6px",
  font: "inherit",
  fontSize: "0.9rem",
  lineHeight: "1.4",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s",
} as const;

/** Outline chip — Select (idle), Done, All, Clear. `.active` fills it with ink. */
export const toolbarChip = css({
  ...chipBase,
  background: "#fff",
  color: "var(--charcoal)",
  border: "1px solid #dcdcdc",
  _hover: { background: "#f3f3f3" },
  "&.active": {
    background: "var(--charcoal)",
    color: "#fff",
    borderColor: "var(--charcoal)",
  },
  _focusVisible: { outline: "2px solid var(--charcoal)", outlineOffset: "2px" },
});

/** Primary chip — Download (the one filled control). */
export const toolbarChipPrimary = css({
  ...chipBase,
  background: "var(--charcoal)",
  color: "#fff",
  border: "1px solid var(--charcoal)",
  _hover: { background: "#333", borderColor: "#333" },
  "&:disabled": { opacity: 0.35, cursor: "default" },
  _focusVisible: { outline: "2px solid var(--charcoal)", outlineOffset: "2px" },
});

/** Contained bar that groups the selection chips. Sticks just below the fixed
 *  site header while in selection mode, so Download stays reachable as you
 *  scroll the gallery. (top tracks the header height var; switches on mobile.) */
export const selectionBar = css({
  position: "sticky",
  top: "calc(var(--site-hero-current-height) + 0.75rem)",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  maxWidth: "100%",
  overflowX: "auto",
  marginBottom: "1rem",
  background: "#fafafa",
  border: "1px solid #ececec",
  borderRadius: "8px",
  padding: "0.55rem 0.65rem",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
  "@media (max-width: 800px)": {
    top: "calc(var(--site-hero-mobile-height) + 0.75rem)",
  },
});

export const selectionBarRule = css({
  width: "1px",
  height: "1.4rem",
  background: "#e5e5e5",
  flexShrink: 0,
});

/** "N of M selected" status — tabular figures so the number never jitters. */
export const selectionStatus = css({
  fontSize: "0.9rem",
  color: "var(--charcoal)",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  padding: "0 0.15rem",
});

/* ── Download modal ───────────────────────────────────────────────────────── */

export const downloadModal = css({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
});

export const downloadModalBackdrop = css({
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
});

export const downloadModalDialog = css({
  position: "relative",
  background: "#fff",
  borderRadius: "12px",
  padding: 0,
  maxWidth: "598px",
  width: "90%",
  boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
  zIndex: 1,
});

export const downloadModalHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 1.25rem",
  borderBottom: "1px solid var(--border-color)",
});

export const downloadModalTitle = css({
  fontSize: "1.2rem",
  fontWeight: 700,
  margin: 0,
});

export const downloadModalClose = css({
  background: "#1f1f1f",
  border: "none",
  color: "#fff",
  borderRadius: "6px",
  width: "26px",
  height: "26px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
});

export const downloadModalBody = css({
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const downloadModalBodyPrimary = css({
  width: "calc(100% - 0px)",
  alignSelf: "stretch",
  textAlign: "center",
  justifyContent: "center",
});

export const downloadModalInfo = css({
  fontSize: "0.95rem",
  color: "#333",
  maxWidth: "none",
  lineHeight: "1.6",
});

export const downloadModalNoticeError = css({
  color: "#c62828",
  fontSize: "0.9rem",
});

export const downloadModalPasswordWrapper = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const downloadModalInput = css({
  flex: 1,
  width: "100%",
  padding: ".75rem 3rem .75rem .875rem",
  border: "1px solid #d0d0d0",
  borderRadius: "8px",
  fontSize: "1rem",
  fontFamily: "inherit",
  outline: "none",
  _focus: {
    borderColor: "#888",
    boxShadow: "0 0 0 2px rgba(0,0,0,0.08)",
  },
});

export const downloadModalPasswordToggle = css({
  position: "absolute",
  right: ".75rem",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#888",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  width: "24px",
  height: "24px",
  flexShrink: 0,
  _hover: {
    color: "#333",
  },
  "& svg": {
    display: "block",
  },
});

/* ── Gallery selection / checkbox overlay ──────────────────────────────────── */

export const galleryCheckbox = css({
  position: "absolute",
  top: "8px",
  right: "8px",
  zIndex: 2,
  width: "22px",
  height: "22px",
  display: "block",
  opacity: 0.6,
  _before: {
    content: "''",
    position: "absolute",
    inset: 0,
    background: "rgba(255, 255, 255, 0.45)",
    border: "1.5px solid rgba(255, 255, 255, 0.7)",
    borderRadius: "7px",
    boxSizing: "border-box",
    backdropFilter: "blur(2px)",
    transition: "background 0.15s, border-color 0.15s",
  },
});

export const inlineSelect = css({
  position: "absolute",
  opacity: 0,
  width: "22px",
  height: "22px",
  margin: 0,
  cursor: "pointer",
  zIndex: 1,
});

export const galleryCheckboxIcon = css({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  opacity: 0,
  transition: "opacity 0.15s",
});
