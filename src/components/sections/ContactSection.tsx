import Image from "next/image";
import ContactForm from "@/components/forms/ContactForm";
import { css, cx } from "@/styled-system/css";
import { CONTACT_PAGE_THEME } from "@/lib/constants";

const contactGrid = css({
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: "2rem",
  alignItems: "stretch",
  marginTop: "1rem",
  "@media (max-width: 900px)": {
    gridTemplateColumns: "1fr",
  },
});

const contactCard = css({
  background: "#fff",
  border: "1px solid var(--border-color)",
  padding: "1.2rem",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
  height: "100%",
  "& p": {
    color: "var(--charcoal)",
    maxWidth: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  "& a": { color: "var(--charcoal)", opacity: 1 },
  "& a:hover, & a:focus": { color: "var(--charcoal)", opacity: 0.7 },
});

const contactPhoto = css({
  width: "100%",
  height: "auto",
  objectFit: "cover",
  borderRadius: "8px",
  marginBottom: ".9rem",
  maxHeight: "320px",
  "@media (max-width: 900px)": {
    maxHeight: "220px",
  },
});

const iconStyle = css({
  width: "18px",
  height: "18px",
  verticalAlign: "middle",
  marginRight: "6px",
  display: "inline-block",
});

const contactFormWrap = css({ display: "flex" });

export default function ContactSection() {
  return (
    <section id="contact" className={CONTACT_PAGE_THEME}>
      <div className="container">
        <div className={contactGrid}>
          {/* Contact card */}
          <div>
            <div className={contactCard}>
              <Image
                className={contactPhoto}
                src="/assets/photos/DSC09978_YT.webp"
                alt="Jinee Chen — professional portrait"
                width={200}
                height={200}
                loading="lazy"
                unoptimized
              />

              <p>
                <svg
                  className={iconStyle}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6.5l-10 7-10-7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span><b>Email:</b>&#32;<a href="mailto:hello@jineechen.com">hello@jineechen.com</a></span>
              </p>

              <p>
                <svg
                  className={iconStyle}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M16 2v4M8 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M7 11h10M7 15h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span><b>Meet me:</b>&#32;<a
                  href="https://calendly.com/jineechen/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                >Calendly — 15 min</a></span>
              </p>

              <p>
                <svg
                  className={iconStyle}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.2" fill="currentColor" />
                </svg>
                <span><b>Location:</b>&#32;Singapore &amp; Taipei</span>
              </p>

              <p>
                <svg
                  className={iconStyle}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                </svg>
                <span><b>Instagram:</b>&#32;<a
                  href="https://instagram.com/jineechen"
                  target="_blank"
                  rel="noopener noreferrer"
                >@jineechen</a></span>
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className={cx(contactFormWrap, "contact-form")}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
