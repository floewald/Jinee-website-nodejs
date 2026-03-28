import type { Metadata } from "next";
import ContactSection from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: "Contact — Jinee Chen",
  description:
    "Get in touch with Jinee Chen — photographer and videographer based in Singapore. Book a session, ask about a project, or just say hello.",
};

export default function ContactPage() {
  return <ContactSection />;
}
