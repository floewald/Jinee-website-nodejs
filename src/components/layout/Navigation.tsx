"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollToTop } from "@/lib/scroll-config";

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
      <a className="skip-link sr-only focus:not-sr-only" href="#main-content">
        Skip to content
      </a>
      <nav
        className="main-nav sticky-nav"
        role="navigation"
        aria-label="Main"
      >
        <button
          className="nav-toggle"
          aria-controls="primary-menu"
          aria-expanded={menuOpen ? "true" : "false"}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="nav-toggle__bars" aria-hidden="true" />
        </button>

        <ul
          id="primary-menu"
          className={menuOpen ? "open" : undefined}
        >
          <li>
            <Link href="/" onClick={handleNavClick("/")}>Home</Link>
          </li>
          <li
            className={`nav-item-portfolio${submenuOpen ? " open" : ""}`}
            onMouseEnter={() => setSubmenuOpen(true)}
            onMouseLeave={() => setSubmenuOpen(false)}
          >
            <Link
              href="/portfolio/"
              className="nav-portfolio-toggle"
              onClick={handlePortfolioClick}
            >
              Portfolio
            </Link>
            <ul
              className="nav-submenu"
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
            <Link href="/about/" onClick={handleNavClick("/about/")}>About</Link>
          </li>
          <li>
            <Link href="/contact/" onClick={handleNavClick("/contact/")}>Contact</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
