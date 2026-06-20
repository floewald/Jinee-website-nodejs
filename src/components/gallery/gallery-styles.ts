import { css } from "@/styled-system/css";

/** `project-gallery` — flex container for react-masonry-css */
export const projectGallery = css({
  display: "flex",
  gap: "0.9rem",
  marginTop: "var(--gallery-content-gap)",
  width: "100%",
});

/** `project-gallery__col` — each masonry column */
export const projectGalleryCol = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.9rem",
  flex: 1,
  minWidth: 0,
});

/** `gallery-cols` — CSS columns masonry layout */
export const galleryCols = css({
  columns: 3,
  columnGap: "0.9rem",
  columnFill: "balance",
  marginTop: "var(--gallery-content-gap)",
  "@media (max-width: 900px)": { columns: 2 },
  "@media (max-width: 480px)": { columns: 1 },
});

/** Styles for items inside CSS columns layout */
export const galleryColsItem = css({
  breakInside: "avoid",
  verticalAlign: "top",
  marginBottom: "0.9rem",
  display: "inline-block",
  width: "100%",
});

/** `gallery-item` — clickable image wrapper */
export const galleryItem = css({
  display: "block",
  border: "none",
  background: "none",
  padding: 0,
  cursor: "pointer",
  overflow: "hidden",
  borderRadius: "var(--radius-md)",
  width: "100%",
  willChange: "transform",
});

/** `gallery-item__trigger` — inner button in selection mode */
export const galleryItemTrigger = css({
  display: "block",
  border: "none",
  background: "none",
  padding: 0,
  cursor: "pointer",
  overflow: "hidden",
  borderRadius: "var(--radius-md)",
  width: "100%",
});

/** `gallery-img` — image inside gallery items */
export const galleryImg = css({
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: 0,
  transition: "transform 0.35s ease",
});
