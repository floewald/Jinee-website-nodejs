import Image from "next/image";

interface HeroSectionProps {
  src: string;
  alt: string;
}

export default function HeroSection({ src, alt }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={900}
        priority
        className="hero-img"
        sizes="100vw"
        unoptimized
      />
    </section>
  );
}
