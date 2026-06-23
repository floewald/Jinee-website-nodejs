import { css } from "@/styled-system/css";

export const scrollLinkedRevealSurface = {
  opacity: "var(--reveal-opacity, 1)",
  transform: "translateY(var(--reveal-translate-y, 0px))",
  willChange: "opacity, transform",
} as const;

export const revealGrid = css({
  "& .project-card, & .instagram-preview": scrollLinkedRevealSurface,
});

/* ── Section-level styles ─────────────────────────────────────────────────── */

export const sectionTitle = css({
  fontSize: "2rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
});

export const sectionTitleCenter = css({
  textAlign: "center",
  paddingTop: "0.5rem",
});

export const sectionDividerLine = css({
  borderTop: "none",
  width: "100%",
  marginBottom: "1.75rem",
});

export const sectionTitleDivider = css({
  border: "none",
  borderTop: "1px solid #d1d5db",
  margin: "0 0 1.5rem",
  width: "100%",
});

export const sectionCta = css({
  textAlign: "center",
  marginTop: "2rem",
});

export const featuredProjects = css({
  paddingTop: 0,
  paddingBottom: "1rem",
});

/* ── Play overlay (video/Instagram thumbnails) ────────────────────────────── */

export const playOverlay = css({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  background: "rgba(0, 0, 0, 0.5)",
  color: "#fff",
  borderRadius: "999px",
  padding: ".55rem .85rem",
  fontSize: "1.3rem",
  lineHeight: 1,
  pointerEvents: "none",
  zIndex: 2,
});

/* ── Project cards grid ───────────────────────────────────────────────────── */

export const projectCards = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
  marginTop: "1.25rem",
  alignItems: "stretch",
  "@media (max-width: 1000px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  "@media (max-width: 700px)": { gridTemplateColumns: "1fr" },
});

export const projectGrid = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
  borderRadius: "var(--radius-md)",
  alignItems: "stretch",
  "@media (max-width: 1000px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  "@media (max-width: 700px)": { gridTemplateColumns: "1fr" },
  "& .project-card img": {
    width: "100%",
    height: "auto",
    aspectRatio: "16 / 9",
    objectFit: "cover",
    display: "block",
  },
});

export const projectCard = css({
  ...scrollLinkedRevealSurface,
  display: "flex",
  flexDirection: "column",
  borderRadius: "8px",
  overflow: "hidden",
  textDecoration: "none",
  color: "var(--charcoal)",
  background: "#fff",
  border: "1px solid var(--border-color)",
  height: "100%",
  transition: "box-shadow .18s ease",
  "&:hover": { boxShadow: "0 8px 30px rgba(0,0,0,0.08)" },
});

export const projectCardThumb = css({
  overflow: "hidden",
  "& img, & .project-card__img": {
    transition: "transform 0.35s ease",
  },
});

export const projectCardImg = css({
  width: "100%",
  height: "auto",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  display: "block",
});

export const projectCardBody = css({
  marginTop: "auto",
  padding: ".8rem",
  minHeight: "56px",
});

export const projectCardTitle = css({
  margin: 0,
  color: "var(--charcoal)",
  fontSize: "1.05rem",
  lineHeight: "1.2",
  lineClamp: 2,
  textOverflow: "ellipsis",
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: "0.3rem",
});

export const projectCardLocation = css({
  margin: "0.3rem 0 0",
  fontSize: "0.9rem",
  lineHeight: "1.3",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

/* ── Instagram previews ───────────────────────────────────────────────────── */

export const instagramSection = css({
  containerType: "inline-size",
});

export const instagramPreviews = css({
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "calc(100cqi / 2.5)",
  gap: "20px",
  marginTop: "1.25rem",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  "@container (min-width: 660px)": {
    gridAutoFlow: "row",
    gridTemplateColumns: "repeat(var(--sm-preview-cols, 5), 1fr)",
    gridAutoColumns: "unset",
    overflowX: "visible",
  },
});

export const instagramPreview = css({
  ...scrollLinkedRevealSurface,
  display: "block",
  position: "relative",
  borderRadius: "8px",
  background: "transparent",
  border: "none",
  textDecoration: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
});

export const instagramPreviewThumb = css({
  position: "relative",
  overflow: "hidden",
  borderRadius: "inherit",
  willChange: "transform",
});

export const instagramPreviewImg = css({
  display: "block",
  width: "100%",
  height: "auto",
  aspectRatio: "9 / 16",
  objectFit: "cover",
  transition: "transform 0.35s ease",
});

export const instagramPreviewCard = css({
  display: "flex !important",
  flexDirection: "column",
  overflow: "hidden",
  background: "#fff",
  border: "1px solid var(--border-color)",
  transition: "box-shadow .18s ease",
  "&:hover": { boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)" },
  "& .instagram-preview__thumb": { borderRadius: 0 },
});

export const instagramPreviewBody = css({
  marginTop: "auto",
  padding: "0.4rem 0.5rem 1rem",
});

export const instagramPreviewTags = css({
  margin: 0,
  fontSize: "0.9rem",
  lineHeight: "1.5",
  color: "var(--charcoal)",
  opacity: 0.9,
  wordBreak: "break-word",
  lineClamp: 3,
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: "0.3rem",
});
