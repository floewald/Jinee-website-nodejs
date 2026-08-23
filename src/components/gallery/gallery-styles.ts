import {
  REVEAL_EASING,
  REVEAL_SCROLL_LINKED_TRANSITION_MS,
} from "@/lib/reveal-config";
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
  position: "relative",
  border: "none",
  background: "none",
  padding: 0,
  cursor: "pointer",
  overflow: "hidden",
  borderRadius: "var(--radius-md)",
  width: "100%",
  opacity: "var(--reveal-opacity, 1)",
  transform: "translate3d(0, var(--reveal-translate-y, 0px), 0)",
  willChange: "opacity, transform",
  transition: `opacity ${REVEAL_SCROLL_LINKED_TRANSITION_MS}ms ${REVEAL_EASING}, transform ${REVEAL_SCROLL_LINKED_TRANSITION_MS}ms ${REVEAL_EASING}`,
  backfaceVisibility: "hidden",
  '&[data-reveal-debug-enabled="true"]': {
    boxShadow: "inset 0 0 0 1px rgba(214, 82, 42, 0.9)",
  },
  '&[data-reveal-debug-enabled="true"]::after': {
    content: "attr(data-reveal-debug-summary)",
    position: "absolute",
    top: "0.45rem",
    left: "0.45rem",
    zIndex: 2,
    maxWidth: "calc(100% - 0.9rem)",
    padding: "0.3rem 0.4rem",
    borderRadius: "0.45rem",
    background: "rgba(18, 15, 12, 0.78)",
    color: "#fff7f1",
    fontSize: "0.58rem",
    lineHeight: 1.35,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    whiteSpace: "pre-line",
    textAlign: "left",
    pointerEvents: "none",
  },
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
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, #000 var(--reveal-exit-mask-start, 0%), #000 100%)",
  maskImage:
    "linear-gradient(to bottom, transparent 0%, #000 var(--reveal-exit-mask-start, 0%), #000 100%)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  transition: "transform 0.35s ease",
});
