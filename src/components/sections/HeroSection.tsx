import Image from "next/image";
import { css, cx } from "@/styled-system/css";

const heroSection = css({
  position: "relative",
  width: "100%",
  overflow: "hidden",
  padding: 0,
  margin: 0,
  height: "var(--hero-height)",
});

const heroImg = css({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

interface HeroSectionProps {
  src: string;
  alt: string;
}

export default function HeroSection({ src, alt }: HeroSectionProps) {
  return (
    <section className={cx(heroSection, "hero-section")}>
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={900}
        priority
        className={cx(heroImg, "hero-img")}
        sizes="100vw"
        unoptimized
      />
    </section>
  );
}
