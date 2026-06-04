import { css } from "@/styled-system/css";

/* ── Portfolio subpages ───────────────────────────────────────────────────── */

export const portfolioSection = css({ paddingTop: 0 });

export const portfolioHub = css({
  paddingTop: "2rem",
  paddingBottom: "3rem",
});

export const portfolioCategory = css({
  paddingTop: "2rem",
  paddingBottom: "3rem",
});

export const projectPage = css({
  paddingTop: "2rem",
  paddingBottom: "3rem",
});

export const pageTitle = css({
  fontSize: "2rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
  paddingTop: "0.5rem",
  textAlign: "center",
});

export const projectHeading = css({
  fontSize: "1.8rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
});

export const projectDescription = css({
  maxWidth: "100%",
  marginTop: "1.5rem",
  marginBottom: "2rem",
  lineHeight: "1.6",
  color: "var(--charcoal)",
});

export const videoProjectDescription = css({
  maxWidth: "100%",
  "& p": {
    marginBottom: "1rem",
  },
  "& p:last-child": {
    marginBottom: 0,
  },
});

export const videoProjectHeader = css({
  display: "grid",
  gap: "1rem",
  alignItems: "start",
  gridTemplateColumns: "1fr",
  marginTop: "1.25rem",
  marginBottom: "2rem",
  "@media (min-width: 760px)": {
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(14rem, 0.9fr)",
    gap: "1.75rem",
  },
});

export const videoProjectIntro = css({
  minWidth: 0,
  maxWidth: "100%",
  marginTop: 0,
  marginBottom: 0,
  lineHeight: "1.6",
  color: "var(--charcoal)",
  order: 1,
  "@media (min-width: 760px)": {
    order: 0,
  },
});

export const compactProjectFacts = css({
  display: "grid",
  gap: "0.9rem",
  alignContent: "start",
  position: "relative",
  order: -1,
  paddingBottom: "1rem",
  borderBottom: "1px solid var(--border-color)",
  "&::before": {
    content: '""',
    display: "none",
  },
  "@media (min-width: 760px)": {
    order: 0,
    paddingBottom: 0,
    paddingLeft: "2rem",
    borderBottom: "none",
    "&::before": {
      display: "block",
      position: "absolute",
      left: 0,
      top: "0.1rem",
      bottom: "0.1rem",
      width: "1px",
      background: "var(--border-color)",
    },
  },
});

export const compactProjectFact = css({
  display: "grid",
  gap: "0.2rem",
});

export const compactProjectFactLabel = css({
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted-text)",
});

export const compactProjectFactValue = css({
  fontSize: "1rem",
  lineHeight: "1.5",
  color: "var(--charcoal)",
  margin: 0,
});

export const projectMeta = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem 0.9rem",
  alignItems: "center",
  margin: "0.6rem 0 1.25rem",
});

export const projectRoles = css({
  fontSize: "1rem",
  color: "var(--muted-text)",
  margin: 0,
});

export const projectLocation = css({
  fontSize: "0.95rem",
  color: "var(--muted-text)",
  margin: 0,
});

export const galleryEmpty = css({
  color: "var(--muted-text)",
  fontStyle: "italic",
  marginTop: "2rem",
});

/* ── Static pages (imprint, privacy) ──────────────────────────────────────── */

export const sectionHeadingFull = css({
  fontSize: "1.8rem",
  fontWeight: 600,
  marginBottom: "1.2rem",
});

/**
 * Apply to any section that contains flowing prose with multiple h2 headings
 * (imprint, privacy). Ensures consistent vertical rhythm: large gap above
 * each h2, smaller gap below — regardless of whether the preceding element
 * is a paragraph, list, or another block.
 * Also aligns paragraph and list widths so both share the same reading measure.
 */
export const proseSection = css({
  "& h2": {
    marginTop: "2rem",
    marginBottom: "0.75rem",
  },
  "& p": {
    maxWidth: "72ch",
  },
  "& ul": {
    maxWidth: "72ch",
  },
});

export const sectionCompact = css({
  paddingTop: "1.5rem",
  paddingBottom: "1.5rem",
});

export const lastUpdated = css({
  color: "var(--muted-text)",
  fontSize: "0.9rem",
  fontStyle: "italic",
  marginBottom: "1rem",
});

export const servicesList = css({
  listStyle: "disc",
  paddingLeft: "1.5rem",
  marginBottom: "1rem",
  color: "var(--muted-text)",
  "& li": {
    marginBottom: "0.4rem",
    lineHeight: "1.5",
  },
});

/* ── Mobile / desktop gallery toggle ──────────────────────────────────────── */

export const galleryDesktopOnly = css({
  display: "block",
  "@media (max-width: 800px)": {
    display: "none",
  },
});

export const galleryMobileOnly = css({
  display: "none",
  "@media (max-width: 800px)": {
    display: "block",
  },
});

/* ── Skip-link ────────────────────────────────────────────────────────────── */

export const skipLinkFocus = css({
  _focus: {
    position: "fixed",
    top: "8px",
    left: "8px",
    zIndex: 20000,
    width: "auto",
    height: "auto",
    padding: "0.5rem 1rem",
    clip: "unset",
    margin: 0,
    overflow: "visible",
    whiteSpace: "normal",
    background: "var(--charcoal)",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "0.95rem",
    textDecoration: "none",
  },
});
