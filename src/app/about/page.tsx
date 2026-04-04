import type { Metadata } from "next";
import AboutSection from "@/components/sections/AboutSection";

export const metadata: Metadata = {
  title: "About — Jinee Chen",
  description:
    "Jinee Chen is a professional photographer and videographer with over 15 years of experience, based in Singapore and Taipei.",
};

export default function AboutPage() {
  return <AboutSection />;
}
