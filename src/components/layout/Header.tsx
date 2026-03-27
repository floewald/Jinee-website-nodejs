import Link from "next/link";
import Image from "next/image";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-left">
        <div className="logo-tagline-wrap logo-stack">
          <Link href="/" aria-label="Home">
            <Image
              className="logo"
              src="/assets/photos/Jinee_Chen_logo4.webp"
              alt="Jinee Chen logo"
              width={220}
              height={60}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          <p className="tagline tagline-subtle">
            Visual storyteller for brands and creators — videography and
            photography.
          </p>
        </div>
      </div>

      <div className="header-right">
        <Navigation />
      </div>
    </header>
  );
}
