"use client";

import { useState, useEffect } from "react";
import { css, cx } from "@/styled-system/css";

const COOKIE_NAME = "site_consent";
const COOKIE_DAYS = 400;

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(^|;)\\s?" + name + "=([^;]*)(;|$)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export interface ConsentState {
  analytics: boolean;
}

/** Expose consent state to non-React code (matches original window.getSiteConsent) */
export function getSiteConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_NAME))
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only: read cookie then show banner (SSR-safe)
      setVisible(true);
  }, []);

  function accept() {
    setCookie(COOKIE_NAME, JSON.stringify({ analytics: true }), COOKIE_DAYS);
    setVisible(false);
  }

  function reject() {
    setCookie(COOKIE_NAME, JSON.stringify({ analytics: false }), COOKIE_DAYS);
    setVisible(false);
  }

  if (!visible) return null;

  const bannerStyle = css({
    position: "fixed",
    left: "1rem",
    right: "1rem",
    bottom: "1rem",
    zIndex: 12000,
    background: "rgba(31,31,31,0.95)",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "10px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    maxWidth: "calc(100% - 40px)",
    boxSizing: "border-box",
  });

  const messageStyle = css({
    flex: "1 1 60%",
    color: "#fff",
    fontSize: "0.95rem",
    lineHeight: "1.3",
  });

  const messageLinkStyle = css({ color: "#fff" });

  const actionsStyle = css({
    display: "flex",
    gap: "10px",
    alignItems: "center",
  });

  const btnBase = css({
    cursor: "pointer",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.98rem",
  });

  const btnAccept = css({
    background: "#fff",
    color: "var(--charcoal)",
  });

  const btnReject = css({
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
  });

  const bannerMobile = css({
    "@media (max-width: 700px)": {
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
      left: "12px",
      right: "12px",
    },
  });

  const messageMobile = css({
    "@media (max-width: 700px)": {
      flex: "unset",
    },
  });

  const actionsMobile = css({
    "@media (max-width: 700px)": {
      justifyContent: "flex-end",
    },
  });

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className={cx(bannerStyle, bannerMobile)}
    >
      <div className={cx(messageStyle, messageMobile)}>
        We use cookies to improve the site. Non-essential cookies (analytics)
        are only set with your consent. See our{" "}
        <a href="/privacy/" className={messageLinkStyle}>
          Privacy Policy
        </a>
        .
      </div>
      <div className={cx(actionsStyle, actionsMobile)}>
        <button
          className={cx(btnBase, btnAccept)}
          onClick={accept}
        >
          Accept
        </button>
        <button
          className={cx(btnBase, btnReject)}
          onClick={reject}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
