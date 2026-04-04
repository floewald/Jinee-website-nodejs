import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";

// Self-hosted Inter — avoids Google Fonts CDN (GDPR compliance)
const inter = localFont({
  src: [
    {
      path: "../../public/assets/fonts/inter-latin-ext.woff2",
      weight: "300 600",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/inter-latin.woff2",
      weight: "300 600",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  description: SITE_TAGLINE,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_SG",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/assets/photos/favicon.ico" },
      { url: "/assets/photos/icon-32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/assets/photos/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: "/assets/photos/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  sameAs: [
    "https://www.instagram.com/",
    "https://www.linkedin.com/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <SmoothScroll />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
