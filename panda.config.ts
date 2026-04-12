import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: false, // We have our own reset in globals.css during migration

  // Where to look for Panda CSS usage
  include: [
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],

  // Files to exclude
  exclude: [],

  // Output directory for generated files
  outdir: "src/styled-system",

  // Don't emit JS runtime — use static CSS extraction only
  // (smaller bundle, works with RSC)
  jsxFramework: "react",

  // === DESIGN TOKENS ===
  // Every value copied verbatim from globals.css :root block
  theme: {
    tokens: {
      colors: {
        charcoal: { value: "#1f1f1f" },
        black: { value: "#000000" },
        white: { value: "#ffffff" },
        "site.bg": { value: "#ffffff" },
        "site.text": { value: "#1f1f1f" },
        "site.muted": { value: "#666666" },
        "site.border": { value: "#e5e5e5" },
      },
      spacing: {
        site: { value: "1.5rem" },
        "collage.gutter": { value: "24px" },
        "gallery.contentGap": { value: "20px" },
        "section.paddingTop": { value: "2rem" },
        "section.paddingBottom": { value: "2rem" },
      },
      radii: {
        site: { value: "6px" },
        sm: { value: "6px" },
        md: { value: "8px" },
        lg: { value: "12px" },
      },
      sizes: {
        "site.maxWidth": { value: "1200px" },
        "hero.height": { value: "clamp(280px, 50vw, 720px)" },
        "logo.size": { value: "40px" },
        "logo.min": { value: "28px" },
      },
      fonts: {
        sans: {
          value:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
      },
    },
    breakpoints: {
      sm: "480px",
      md: "600px",
      nav: "800px",
      lg: "900px",
      xl: "1200px",
    },
  },

  // === GLOBAL CSS ===
  // Kept minimal during migration — only the Panda layer import.
  // The existing globals.css remains the source of truth until each section is migrated.
  globalCss: {},
});
