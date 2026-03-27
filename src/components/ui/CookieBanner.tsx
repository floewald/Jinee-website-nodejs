"use client";

import { useState, useEffect } from "react";

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

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="cookie-consent-banner"
    >
      <div className="cookie-consent__message">
        We use cookies to improve the site. Non-essential cookies (analytics)
        are only set with your consent. See our{" "}
        <a href="/privacy/">
          Privacy Policy
        </a>
        .
      </div>
      <div className="cookie-consent__actions">
        <button
          className="cookie-consent__btn cookie-consent__btn--accept"
          onClick={accept}
        >
          Accept
        </button>
        <button
          className="cookie-consent__btn cookie-consent__btn--reject"
          onClick={reject}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
