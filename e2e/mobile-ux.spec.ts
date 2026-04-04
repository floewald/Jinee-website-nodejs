import { test, expect } from "@playwright/test";

// These tests run on all projects including Mobile Safari (iPhone 14).
// Use test.describe to group mobile-specific assertions.

test.describe("Mobile UX — Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact/");
  });

  test("form inputs have font-size >= 16px (prevents iOS auto-zoom)", async ({
    page,
  }) => {
    const email = page.locator("#cf-email");
    const fontSize = await email.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test("form-row stacks vertically on narrow viewports", async ({
    page,
    browserName,
  }) => {
    // Only meaningful check on mobile viewport (< 600px wide)
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 600) {
      test.skip(browserName !== "webkit", "Desktop viewport — skip");
    }

    // Resize to a narrow width to test responsive behavior
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/contact/");

    const formRow = page.locator(".form-row").first();
    const direction = await formRow.evaluate(
      (el) => getComputedStyle(el).flexDirection,
    );
    expect(direction).toBe("column");
  });
});

test.describe("Mobile UX — Lightbox touch targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/photography/travel-photography/");
    await page.waitForSelector("main img", { timeout: 10000 });
  });

  test("lightbox buttons are at least 44x44px on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Open lightbox
    const firstButton = page
      .locator("button")
      .filter({ has: page.locator("img") })
      .first();
    await firstButton.click();
    await page.waitForSelector("[role='dialog']", { timeout: 5000 });

    // Check close button size
    const closeBtn = page.locator(".lightbox__close");
    const box = await closeBtn.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Mobile UX — Navigation", () => {
  test("hamburger menu opens and shows nav links on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const toggle = page.locator(".nav-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();

    const nav = page.locator("nav[aria-label='Main']");
    await expect(nav.getByRole("link", { name: "Portfolio" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
  });
});
