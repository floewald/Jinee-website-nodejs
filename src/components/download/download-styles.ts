import { css } from "@/styled-system/css";

/* ── Download toolbar ─────────────────────────────────────────────────────── */

export const downloadToolbar = css({
  display: "flex",
  flexWrap: "nowrap",
  gap: ".75rem",
  alignItems: "center",
  marginBottom: "1rem",
  padding: ".5rem 0",
  overflowX: "auto",
  "@media (max-width: 600px)": {
    flexWrap: "wrap",
    overflowX: "visible",
  },
});

/** Compact button overrides applied inside the toolbar */
export const toolbarBtn = css({
  alignSelf: "center",
  whiteSpace: "nowrap",
  padding: ".35rem .7rem",
  lineHeight: "1.4",
  display: "inline-flex",
  alignItems: "center",
});

export const selectedCountBadge = css({
  background: "#f0f0f0",
  borderRadius: "999px",
  padding: ".35rem .7rem",
  fontSize: "0.9rem",
  lineHeight: "1.4",
  color: "var(--charcoal)",
  whiteSpace: "nowrap",
});

export const toolbarPipe = css({
  alignSelf: "center",
  color: "#d0d0d0",
  fontSize: "1.1rem",
  lineHeight: "1",
  userSelect: "none",
  "@media (max-width: 600px)": {
    display: "none",
  },
});

export const toolbarDivider = css({
  width: "1px",
  alignSelf: "stretch",
  background: "#d0d0d0",
  flexShrink: 0,
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
