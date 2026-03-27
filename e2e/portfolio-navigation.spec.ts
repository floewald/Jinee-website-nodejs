import { test, expect } from "@playwright/test";

test.describe("Portfolio Navigation", () => {
  test("portfolio hub shows three category sections with project cards", async ({ page }) => {
    await page.goto("/portfolio/");

    // Three section headings for each category
    await expect(page.locator("h2", { hasText: "Photography" })).toBeAttached();
    await expect(page.locator("h2", { hasText: "Video" })).toBeAttached();
    await expect(page.locator("h2", { hasText: "Social Media" })).toBeAttached();

    // At least one project card per section
    const cards = page.locator(".project-card");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("portfolio hub has More CTA links for each category", async ({ page }) => {
    await page.goto("/portfolio/");
    await expect(page.locator("a", { hasText: /more photography projects/i })).toBeAttached();
    await expect(page.locator("a", { hasText: /more video projects/i })).toBeAttached();
    await expect(page.locator("a", { hasText: /more social media projects/i })).toBeAttached();
  });

  test("photography index lists project cards", async ({ page }) => {
    await page.goto("/portfolio/photography/");
    await expect(page.locator("h1")).toHaveText("Photography");

    const cards = page.locator(".project-card");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("video index lists project cards", async ({ page }) => {
    await page.goto("/portfolio/video/");
    await expect(page.locator("h1")).toHaveText("Video");

    const cards = page.locator(".project-card");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test("navigate from portfolio hub → photography page", async ({ page }) => {
    await page.goto("/portfolio/");

    // Click the "More Photography Projects" CTA
    await page.locator("a", { hasText: /more photography projects/i }).click();
    await expect(page.locator("h1")).toHaveText("Photography");
  });

  test("navigate from portfolio hub → video page", async ({ page }) => {
    await page.goto("/portfolio/");

    // Click the "More Video Projects" CTA
    await page.locator("a", { hasText: /more video projects/i }).click();
    await expect(page.locator("h1")).toHaveText("Video");
  });

  test("video project page shows video player", async ({ page }) => {
    await page.goto("/portfolio/video/stuck-low-pay/");
    await expect(page.locator("h1.project-heading")).toBeAttached();
    // VideoPlayer renders lazy embed wrappers (iframe appears on intersection)
    const embedWrap = page.locator(".video-embed-wrap");
    const count = await embedWrap.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("photography project page shows gallery images", async ({ page }) => {
    await page.goto("/portfolio/photography/travel-photography/");
    await expect(page.locator("h1.project-heading")).toBeAttached();
    // Gallery images should be present
    const images = page.locator("main img");
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
