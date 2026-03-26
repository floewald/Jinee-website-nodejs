import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Photography, video production, and social media content by Jinee Chen.",
};

const categories = [
  {
    slug: "photography",
    label: "Photography",
    description: "Event, travel, behind-the-scenes and portrait photography.",
    href: "/portfolio/photography/",
  },
  {
    slug: "video",
    label: "Video",
    description: "Documentary, commercial and branded video production.",
    href: "/portfolio/video/",
  },
  {
    slug: "social-media",
    label: "Social Media",
    description: "Instagram reels, posts and lifestyle content.",
    href: "/portfolio/social-media/",
  },
];

export default function PortfolioPage() {
  return (
    <main className="portfolio-hub container">
      <h1 className="page-title">Portfolio</h1>
      <p className="page-subtitle">
        Explore my work across photography, video and social media.
      </p>

      <div className="portfolio-categories">
        {categories.map((cat) => (
          <Link key={cat.slug} href={cat.href} className="category-card">
            <h2 className="category-card__title">{cat.label}</h2>
            <p className="category-card__desc">{cat.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
