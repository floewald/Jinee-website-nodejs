"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollToTop } from "@/lib/scroll-config";
import { css, cx } from "@/styled-system/css";
import { skipLinkFocus } from "@/lib/portfolio-styles";

/* ── Style constants ─────────────────────────────────────────────────────── */

const stickyNav = css({
  position: "static",
  zIndex: 1200,
  background: "transparent",
});

const mainNav = css({ width: "100%", "@media (max-width: 800px)": { position: "static !important" } });

const navUl = css({
  display: "flex",
  gap: "2rem",
  justifyContent: "flex-end",
  alignItems: "center",
  padding: 0,
  margin: 0,
  listStyle: "none",
  "@media (min-width: 801px)": {
    display: "flex",
    flexDirection: "row",
    gap: "2rem",
    justifyContent: "flex-end",
    alignItems: "center",
    listStyle: "none",
    padding: 0,
    margin: 0,
    position: "static",
    maxHeight: "none",
    overflow: "visible",
    opacity: 1,
    visibility: "visible",
    background: "none",
    boxShadow: "none",
    border: "none",
  },
  /* Mobile closed state */
  "@media (max-width: 800px)": {
    position: "absolute",
    right: "var(--site-hero-dropdown-right)",
    left: "auto",
    top: "100%",
    marginTop: 0,
    maxHeight: 0,
    overflow: "hidden",
    opacity: 0,
    transition: "max-height 320ms ease, opacity 220ms ease",
    background: "var(--bg-color)",
    padding: ".35rem .6rem",
    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    zIndex: 16001,
    maxWidth: "var(--mobile-nav-max-width)",
    minWidth: "140px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    "& > li": { width: "100%" },
    "& > li > a": { display: "block", padding: ".7rem 1rem" },
  },
});

/** Applied when mobile menu is open */
const navUlOpen = css({
  "@media (max-width: 800px)": {
    maxHeight: "9999px !important",
    opacity: "1 !important",
    paddingBottom: "var(--primary-menu-expanded-padding-bottom)",
    overflow: "visible !important",
  },
});

const navLink = css({
  color: "var(--text-color)",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "1.1rem",
  padding: ".35rem .5rem",
  borderBottom: "2px solid transparent",
  transition: "border-color 0.2s",
  "&:hover, &:focus": {
    borderBottom: "2px solid var(--charcoal)",
  },
});

const navToggle = css({
  display: "none",
  background: "transparent",
  border: "none",
  padding: ".4rem .6rem",
  cursor: "pointer",
  alignSelf: "center",
  "&:focus": { outline: "2px solid rgba(0,0,0,0.12)", outlineOffset: "2px" },
  "@media (max-width: 800px)": {
    display: "inline-flex !important",
    position: "absolute",
    right: "var(--site-hero-padding-horizontal)",
    top: "var(--site-hero-padding-vertical)",
    zIndex: 17000,
  },
});

const navToggleBars = css({
  display: "inline-block",
  width: "22px",
  height: "2px",
  background: "var(--charcoal)",
  position: "relative",
  transition: "transform 220ms ease, top 220ms ease, opacity 200ms ease, background 200ms ease",
  "&::before, &::after": {
    content: "''",
    position: "absolute",
    left: 0,
    width: "22px",
    height: "2px",
    background: "var(--charcoal)",
    transition: "transform 220ms ease, top 220ms ease, opacity 200ms ease, background 200ms ease",
  },
  "&::before": { top: "-7px" },
  "&::after": { top: "7px" },
});

/** Hamburger → X animation when aria-expanded="true" */
const navToggleBarsOpen = css({
  background: "transparent !important",
  "&::before": { transform: "rotate(45deg)", top: 0 },
  "&::after": { transform: "rotate(-45deg)", top: 0 },
});

const navItemPortfolio = css({
  position: "static",
  "@media (min-width: 801px)": {
    /* hover opens submenu on desktop */
    "&:hover .nav-submenu-list": {
      opacity: 1,
      visibility: "visible",
    },
  },
});

const navItemPortfolioOpen = css({
  "@media (max-width: 800px)": {
    "& .nav-submenu-list": {
      display: "flex !important",
    },
  },
});

const navPortfolioToggle = css({
  "&::after": { content: "''", display: "none" },
  "@media (min-width: 801px)": {
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: "100%",
      height: "30px",
      background: "transparent",
      pointerEvents: "auto",
      zIndex: 999,
    },
  },
});

const navSubmenu = css({
  listStyle: "none",
  "@media (min-width: 801px)": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    padding: 0,
    margin: 0,
    position: "absolute",
    top: "100%",
    right: "11.5rem",
    left: "auto",
    background: "var(--bg-color)",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    opacity: 0,
    visibility: "hidden",
    transition: "opacity 220ms ease, visibility 220ms ease",
    zIndex: 1000,
    minWidth: "180px",
    "& li a": {
      display: "block",
      padding: "0.2rem 1rem",
      color: "var(--text-color)",
      textDecoration: "none",
      fontWeight: 500,
      fontSize: "1.1rem",
      borderBottom: "2px solid transparent",
      whiteSpace: "nowrap",
      transition: "border-color 0.2s",
    },
    "& li a:hover, & li a:focus": {
      borderBottom: "2px solid var(--charcoal)",
      textDecoration: "none",
    },
    "& li:first-child a": { marginTop: "calc(0.7rem + 0.5rem)" },
    "& li:last-child a": { marginBottom: "calc(0.7rem + 0.5rem)" },
  },
  "@media (max-width: 800px)": {
    position: "static !important",
    display: "none !important",
    flexDirection: "column",
    opacity: "1 !important",
    background: "transparent !important",
    border: "none !important",
    boxShadow: "none !important",
    padding: "0 !important",
    margin: 0,
    width: "100%",
    "& li": { width: "100%" },
    "& li a": {
      padding: "0.6rem 1rem 0.6rem 2.2rem !important",
      display: "block !important",
      fontSize: "0.95rem",
    },
  },
});

/* ── Component ───────────────────────────────────────────────────────────── */

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const pathname = usePathname();

  /** When already on the target page, scroll to top instead of re-navigating. */
  function handleNavClick(href: string) {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === href) {
        e.preventDefault();
        scrollToTop();
      }
    };
  }

  function handlePortfolioClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // On mobile, toggle the submenu instead of navigating
    if (window.innerWidth <= 800) {
      e.preventDefault();
      setSubmenuOpen((open) => !open);
      return;
    }
    // On desktop, scroll to top if already on /portfolio/, otherwise navigate
    if (pathname === "/portfolio/") {
      e.preventDefault();
      scrollToTop();
    }
  }

  return (
    <>
      <a className={cx(skipLinkFocus, "skip-link", "sr-only", "focus:not-sr-only")} href="#main-content">
        Skip to content
      </a>
      <nav
        className={cx(mainNav, stickyNav)}
        role="navigation"
        aria-label="Main"
      >
        <button
          className={navToggle}
          aria-controls="primary-menu"
          aria-expanded={menuOpen ? "true" : "false"}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={cx(navToggleBars, menuOpen && navToggleBarsOpen)}
            aria-hidden="true"
          />
        </button>

        <ul
          id="primary-menu"
          className={cx(navUl, menuOpen && navUlOpen)}
        >
          <li>
            <Link href="/" className={navLink} onClick={handleNavClick("/")}>Home</Link>
          </li>
          <li
            className={cx(navItemPortfolio, submenuOpen && navItemPortfolioOpen)}
            onMouseEnter={() => setSubmenuOpen(true)}
            onMouseLeave={() => setSubmenuOpen(false)}
          >
            <Link
              href="/portfolio/"
              className={cx(navLink, navPortfolioToggle)}
              onClick={handlePortfolioClick}
            >
              Portfolio
            </Link>
            <ul
              className={cx(navSubmenu, "nav-submenu-list")}
              aria-label="Portfolio categories"
            >
              <li>
                <Link href="/portfolio/photography/">Photography</Link>
              </li>
              <li>
                <Link href="/portfolio/video/">Videography</Link>
              </li>
              <li>
                <Link href="/portfolio/social-media/">Social Media</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/about/" className={navLink} onClick={handleNavClick("/about/")}>About</Link>
          </li>
          <li>
            <Link href="/contact/" className={navLink} onClick={handleNavClick("/contact/")}>Contact</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
