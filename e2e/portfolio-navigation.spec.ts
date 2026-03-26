import { test, expect } from "@playwright/test";

test.describe("Portfolio Navigation", () => {
  test("portfolio hub shows three category cards", async ({ page }) => {
    await page.goto("/portfolio/");
    await expect(page.locator("h1")).toHaveText("Portfolio");

    const cards = page.locator(".category-card");
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText("Photography");
    await expect(cards.nth(1)).toContainText("Video");
    await expect(cards.nth(2)).toContainText("Social Media");
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

  test("navigate from portfolio hub → photography → project → back", async ({
    page,
  }) => {
    await page.goto("/portfolio/");

    // Click Photography card
    await page.locator(".category-card", { hasText: "Photography" }).click();
    await expect(page.locator("h1")).toHaveText("Photography");

    // Click first project card
    const firstCard = page.locator(".project-card").first();
    const cardTitle = await firstCard
      .locator(".project-card__title")
      .textContent();
    await firstCard.click();

    // Should be on a project page with an h1
    await expect(page.locator("h1.project-heading")).toBeAttached();

    // Go back
    await page.goBack();
    await expect(page.locator("h1")).toHaveText("Photography");
  });

  test("navigate from portfolio hub → video → project → back", async ({
    page,
  }) => {
    await page.goto("/portfolio/");

    // Click Video card
    await page.locator(".category-card", { hasText: "Video" }).click();
    await expect(page.locator("h1")).toHaveText("Video");

    // Click first project card
    const firstCard = page.locator(".project-card").first();
    await firstCard.click();

    // Should be on a video project page
    await expect(page.locator("h1.project-heading")).toBeAttached();

    // Go back
    await page.goBack();
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
