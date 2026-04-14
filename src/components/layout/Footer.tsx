import { SITE_EMAIL } from "@/lib/constants";
import { css } from "@/styled-system/css";

const footer = css({
  borderTop: "1px solid var(--border-color)",
  marginTop: 0,
  fontSize: "0.95rem",
  color: "var(--muted-text)",
  display: "flex",
  gap: "1rem",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.25rem 2rem",
  navDown: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    gap: "0.6rem",
  },
});

const col = css({
  flex: "1 1 0",
});

const copyrightText = css({
  margin: 0,
  color: "var(--muted-text)",
});

const contactText = css({
  margin: 0,
  color: "var(--muted-text)",
  "& a": {
    color: "var(--muted-text)",
  },
});

const linksContainer = css({
  display: "flex",
  gap: "1rem",
  justifyContent: "flex-end",
  alignItems: "center",
  navDown: {
    justifyContent: "flex-start",
  },
});

const link = css({
  color: "var(--muted-text)",
  textDecoration: "none",
  borderBottom: "1px solid transparent",
  paddingBottom: "0.1rem",
  "&:hover": {
    color: "var(--charcoal)",
    borderBottomColor: "var(--border-color)",
  },
});

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={footer}>
      <div className={col}>
        <p className={copyrightText}>
          © {year} Jinee Chen. All rights reserved.
        </p>
      </div>

      <div className={col}>
        <p className={contactText}>
          Contact:{" "}
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> —{" "}
          <a
            href="https://calendly.com/jineechen/15min"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a meeting
          </a>
        </p>
      </div>

      <div className={`${col} ${linksContainer}`}>
        <a
          className={link}
          href="/imprint/"
        >
          Imprint / Author
        </a>
        <a
          className={link}
          href="/privacy/"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
