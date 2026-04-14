import Link from "next/link";
import Image from "next/image";
import Navigation from "./Navigation";
import { css, cx } from "@/styled-system/css";

const siteHeader = css({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  minHeight: "var(--site-hero-current-height)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "var(--bg-color)",
  padding: "var(--site-hero-padding-vertical) var(--site-hero-padding-horizontal)",
  zIndex: 1300,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  width: "100vw",
  boxSizing: "border-box",
  "@media (max-width: 800px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "1rem",
    overflow: "visible",
    paddingRight: "var(--site-hero-toggle-space-right)",
    paddingLeft: "var(--site-hero-padding-horizontal)",
    paddingTop: "var(--site-hero-mobile-padding-vertical)",
    paddingBottom: "var(--site-hero-mobile-padding-vertical)",
    minHeight: "var(--site-hero-mobile-height)",
  },
});

const headerLeft = css({
  display: "flex",
  alignItems: "center",
  gap: "1.2rem",
  "@media (max-width: 800px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: ".5rem",
  },
});

const logoTaglineWrap = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.4rem",
  "& > a, & > a img, & .tagline-text": {
    WebkitUserSelect: "none",
    userSelect: "none",
    cursor: "pointer",
  },
  "@media (max-width: 800px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: ".5rem",
  },
});

const logoStyle = css({
  maxHeight: "var(--logo-size-fluid)",
  width: "auto",
  height: "auto",
  display: "block",
  "@media (max-width: 800px)": {
    maxHeight: "28px",
    width: "auto",
    height: "auto",
    paddingLeft: 0,
  },
});

const taglineStyle = css({
  fontSize: "1rem",
  color: "var(--muted-text)",
  fontWeight: 400,
  margin: 0,
  whiteSpace: "normal",
  maxWidth: "680px",
  "@media (max-width: 800px)": {
    fontSize: "0.85rem",
    whiteSpace: "normal",
  },
});

const taglineSubtle = css({ opacity: 0.75 });

const headerRight = css({
  marginLeft: "auto",
  "@media (max-width: 800px)": {
    marginLeft: 0,
  },
});

export default function Header() {
  return (
    <header className={siteHeader}>
      <div className={headerLeft}>
        <div className={logoTaglineWrap}>
          <Link href="/" aria-label="Home">
            <Image
              className={logoStyle}
              src="/assets/photos/Jinee_Chen_logo4.webp"
              alt="Jinee Chen logo"
              width={220}
              height={60}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          <p className={cx(taglineStyle, taglineSubtle, "tagline-text")}>
            Visual storyteller for brands and creators — videography and
            photography.
          </p>
        </div>
      </div>

      <div className={headerRight}>
        <Navigation />
      </div>
    </header>
  );
}
