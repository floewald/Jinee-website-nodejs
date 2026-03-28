import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { portfolioIndexConfig } from "@/lib/portfolio-config";

export const metadata: Metadata = {
  title: "Social Media",
  description: "Instagram reels, posts and lifestyle content by Jinee Chen.",
};

/** Extract the project slug from an image path like /assets/social-media/SLUG/... */
function slugFromImage(imagePath: string): string {
  return imagePath.split("/")[3];
}

export default function SocialMediaIndexPage() {
  const links = portfolioIndexConfig.socialMediaLinks;

  return (
    <main className="portfolio-category container">
      <h1 className="page-title">Social Media</h1>
      <hr className="section-title-divider" aria-hidden="true" />

      <div className="instagram-previews">
        {links.map((link) => (
          <Link
            key={link.url}
            href={`/portfolio/social-media/${slugFromImage(link.image)}/`}
            className="instagram-preview"
          >
            <Image
              src={link.image}
              alt={link.alt}
              width={400}
              height={711}
              loading="lazy"
              className="instagram-preview__img"
              unoptimized
            />
            <span className="play-overlay" aria-hidden="true">▶</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
