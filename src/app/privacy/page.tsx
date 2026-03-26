import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for jineechen.com — what data we collect and how you can control it.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="container">
      <section className="portfolio-section section-bg-white section--compact">
        <h1 className="section-heading-full">Privacy Policy</h1>
        <p className="last-updated">Last updated: 18 January 2026</p>
        <p>
          This page explains what personal data we collect, why, and how you can
          control it.
        </p>
      </section>

      <section className="portfolio-section section-bg-white section--compact">
        <h2>What we collect</h2>
        <ul className="services-list">
          <li>
            Data you provide in the contact form: name, email, phone (optional)
            and message.
          </li>
          <li>
            The date and time you gave consent when submitting the contact form.
          </li>
          <li>
            Technical information related to form submissions such as IP address
            and browser user agent (used for support and to prevent abuse).
          </li>
          <li>
            Your cookie preferences (stored to remember whether you allowed
            analytics).
          </li>
        </ul>

        <h2>Cookies &amp; consent</h2>
        <p>
          We display a cookie banner to obtain your consent for non&#8209;essential
          cookies. We store a cookie to remember your choice so you won&apos;t
          need to re&#8209;confirm it on each visit. This cookie does not contain
          personal data; it is only used to enable or disable non&#8209;essential
          scripts.
        </p>

        <h2>Contact form and logs</h2>
        <p>
          Contact form submissions are emailed to the configured recipient and
          may be retained for support and delivery diagnostics. Delivery logs may
          be kept for a limited time to troubleshoot issues. Default retention
          for contact&#8209;related logs is 6 months unless you request earlier
          deletion.
        </p>

        <h2>Download diagnostics &amp; server logs</h2>
        <p>
          To help diagnose download failures and improve reliability we collect
          limited diagnostic data when you use the download feature. This may
          include:
        </p>
        <ul className="services-list">
          <li>
            A request identifier (used to correlate client and server logs).
          </li>
          <li>
            Non&#8209;sensitive request metadata such as timestamp, IP address
            (server&#8209;side), browser user agent, HTTP status and outcome
            (success, rate limit, error).
          </li>
          <li>
            Short client&#8209;side diagnostic beacons that do NOT include
            passwords or the full contents of files — only minimal metadata and
            optional error messages.
          </li>
        </ul>
        <p>
          We retain download diagnostics for up to 30 days and then delete them
          automatically. If you want us to remove any logs earlier, contact{" "}
          <strong>hello@jineechen.com</strong> and provide the request id (if
          available) or an approximate timestamp.
        </p>

        <h2>Third&#8209;party embeds</h2>
        <p>
          Some pages include embedded content (for example, videos hosted on
          YouTube). These embeds are served by external providers who may collect
          information and set cookies independently. We do not control their data
          collection — consult the third party&apos;s privacy policy for details
          (for Google/YouTube see{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://policies.google.com/privacy
          </a>
          ).
        </p>

        <h2>Your rights</h2>
        <p>
          You may request access, correction or deletion of personal data we hold
          about you. To exercise these rights or ask privacy questions, contact{" "}
          <strong>hello@jineechen.com</strong>.
        </p>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href="/" className="btn btn--primary">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
