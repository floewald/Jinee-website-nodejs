import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum / Author",
  description: "Author and ownership information for the site. Contact hello@jineechen.com for enquiries.",
  robots: { index: true, follow: true },
};

export default function ImprintPage() {
  return (
    <main className="container">
      <section className="portfolio-section section-bg-white">
        <h1 className="section-heading-full">Impressum / Author</h1>

        <p>
          This website is owned and operated by{" "}
          <strong>Jinee Chen &amp; Florian Ewald</strong>. For enquiries about
          content, licensing, or bookings, contact:{" "}
          <a href="mailto:hello@jineechen.com">hello@jineechen.com</a>.
        </p>

        <h2>Author &amp; Ownership</h2>
        <p>
          Owner: Jinee Chen &amp; Florian Ewald<br />
          Email:{" "}
          <a href="mailto:hello@jineechen.com">hello@jineechen.com</a>
          <br />
          Location: Singapore &amp; Taipei (address available on request)
        </p>

        <h2>Business details</h2>
        <p>Business registration / VAT: Not applicable</p>

        <p>
          This page provides an author/ownership statement and contact details
          for legal notices.
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
