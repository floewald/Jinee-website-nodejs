import { test, expect } from "@playwright/test";

test.describe("Lightbox", () => {
  test.beforeEach(async ({ page }) => {
    // Photography project page with gallery images
    await page.goto("/portfolio/photography/travel-photography/");
    await page.waitForSelector("main img", { timeout: 10000 });
  });

  test("opens lightbox on image click", async ({ page }) => {
    // Click first gallery image button
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    // Lightbox dialog should appear
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeAttached();
  });

  test("shows image counter", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    const counter = page.locator(".lightbox__counter");
    await expect(counter).toContainText("1 /");
  });

  test("navigates with next/prev buttons", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    // Click next
    await page.locator(".lightbox__next").click();
    const counter = page.locator(".lightbox__counter");
    await expect(counter).toContainText("2 /");

    // Click prev
    await page.locator(".lightbox__prev").click();
    await expect(counter).toContainText("1 /");
  });

  test("navigates with arrow keys", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    await page.keyboard.press("ArrowRight");
    const counter = page.locator(".lightbox__counter");
    await expect(counter).toContainText("2 /");

    await page.keyboard.press("ArrowLeft");
    await expect(counter).toContainText("1 /");
  });

  test("closes with Escape key", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeAttached();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeAttached();
  });

  test("closes with close button", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeAttached();

    await page.locator(".lightbox__close").click();
    await expect(dialog).not.toBeAttached();
  });

  test("closes on backdrop click", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeAttached();

    // Backdrop is positioned behind the dialog via CSS; dispatch click event directly
    await page.locator(".lightbox__backdrop").dispatchEvent("click");
    await expect(dialog).not.toBeAttached();
  });
});
