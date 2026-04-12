/**
 * Visual regression baseline — captures full-page screenshots of every route.
 *
 * Usage:
 *   npx playwright test e2e/visual-regression.spec.ts --update-snapshots   # capture baseline
 *   npx playwright test e2e/visual-regression.spec.ts                      # compare against baseline
 *
 * Screenshots are stored in e2e/visual-regression.spec.ts-snapshots/
 */
import { test, expect } from "@playwright/test";

const routes: { name: string; path: string }[] = [
  { name: "homepage", path: "/" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "portfolio-index", path: "/portfolio" },
  { name: "portfolio-photography", path: "/portfolio/photography" },
  { name: "portfolio-photography-detail", path: "/portfolio/photography/event-photography" },
  { name: "portfolio-video", path: "/portfolio/video" },
  { name: "portfolio-video-detail", path: "/portfolio/video/stuck-low-pay" },
  { name: "portfolio-social-media", path: "/portfolio/social-media" },
  { name: "imprint", path: "/imprint" },
  { name: "privacy", path: "/privacy" },
];

test.describe("Visual regression", () => {
  for (const route of routes) {
    test(`${route.name} matches baseline`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });

      // Wait for React hydration and initial layout
      await page.waitForTimeout(800);

      // Stop ALL JS timers and freeze visual state
      await page.evaluate(() => {
        // Clear every pending interval and timeout (brute-force: IDs 1..10000)
        for (let i = 1; i <= 10000; i++) {
          clearInterval(i);
          clearTimeout(i);
        }

        // Freeze CSS animations and transitions
        const style = document.createElement("style");
        style.textContent = `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            animation-delay: 0s !important;
            transition-delay: 0s !important;
            animation-duration: 0s !important;
            transition-duration: 0s !important;
          }
        `;
        document.head.appendChild(style);

        // Hide cookie banner
        document.querySelectorAll(".cookie-banner").forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });

        // Mask YouTube/video embeds — external content varies between runs
        document.querySelectorAll("iframe, .video-player, .video-wrapper").forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.visibility = "hidden";
        });

        // Force hero slideshow to first slide
        document.querySelectorAll(".hero-slide").forEach((el, i) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.opacity = i === 0 ? "1" : "0";
          htmlEl.style.transition = "none";
        });

        // Force card slideshows to first slide
        document.querySelectorAll(".card-slideshow__slide").forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.transition = "none";
        });
        document.querySelectorAll(".card-slideshow__slide--active").forEach((el) => {
          el.classList.remove("card-slideshow__slide--active");
        });
        document.querySelectorAll(".card-slideshow").forEach((slideshow) => {
          const firstSlide = slideshow.querySelector(".card-slideshow__slide");
          if (firstSlide) firstSlide.classList.add("card-slideshow__slide--active");
        });
      });

      // Let forced state settle
      await page.waitForTimeout(200);

      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.001,
        animations: "disabled",
      });
    });
  }
});
