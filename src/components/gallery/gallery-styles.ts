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

/** Desktop-only responsive gallery shell shown before hydration. */
export const galleryResponsiveShellDesktop = css({
  display: "block",
  "@media (max-width: 800px)": {
    display: "none",
  },
});

/** Mobile-only responsive gallery shell shown before hydration. */
export const galleryResponsiveShellMobile = css({
  display: "none",
  "@media (max-width: 800px)": {
    display: "block",
  },
});

/** Placeholder tile used before the responsive gallery resolves its viewport. */
export const galleryPlaceholderSurface = css({
  display: "block",
  width: "100%",
  borderRadius: "var(--radius-md)",
  background: "linear-gradient(180deg, rgba(236,231,224,0.96) 0%, rgba(224,216,206,0.9) 100%)",
  boxShadow: "inset 0 0 0 1px rgba(35, 27, 20, 0.06)",
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
  opacity: "var(--reveal-opacity, 1)",
  transform: "translateY(var(--reveal-translate-y, 0px))",
  willChange: "opacity, transform",
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
