import { SITE_EMAIL } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__col">
        <p className="site-footer__copyright">
          © {year} Jinee Chen. All rights reserved.
        </p>
      </div>

      <div className="site-footer__col">
        <p className="site-footer__contact">
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

      <div className="site-footer__col site-footer__links">
        <a
          className="site-footer__link"
          href="/imprint/"
        >
          Imprint / Author
        </a>
        <a
          className="site-footer__link"
          href="/privacy/"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
