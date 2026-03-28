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

  test("shows lightbox image", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    await expect(page.locator(".lightbox__img")).toBeAttached();
  });

  test("navigates with next/prev buttons", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    const currentImage = page.locator(".lightbox__img");
    const srcBefore = await currentImage.getAttribute("src");

    // Click next
    await page.locator(".lightbox__next").click();
    const srcAfterNext = await currentImage.getAttribute("src");
    expect(srcAfterNext).not.toBe(srcBefore);

    // Click prev
    await page.locator(".lightbox__prev").click();
    const srcAfterPrev = await currentImage.getAttribute("src");
    expect(srcAfterPrev).toBe(srcBefore);
  });

  test("navigates with arrow keys", async ({ page }) => {
    const firstButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await firstButton.click();

    const currentImage = page.locator(".lightbox__img");
    const srcBefore = await currentImage.getAttribute("src");

    await page.keyboard.press("ArrowRight");
    const srcAfterRight = await currentImage.getAttribute("src");
    expect(srcAfterRight).not.toBe(srcBefore);

    await page.keyboard.press("ArrowLeft");
    const srcAfterLeft = await currentImage.getAttribute("src");
    expect(srcAfterLeft).toBe(srcBefore);
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
