import { test, expect } from "@playwright/test";

test.describe("Download Modal", () => {
  // Use a photography project with enableDownload: true
  const projectUrl = "/portfolio/photography/walking-tour-little-india/";

  test.beforeEach(async ({ page }) => {
    await page.goto(projectUrl);
    await page.waitForSelector("main img", { timeout: 10000 });
  });

  test("shows Select button in toolbar", async ({ page }) => {
    const selectBtn = page.locator("button", { hasText: "Select" });
    await expect(selectBtn).toBeAttached();
  });

  test("entering selection mode shows Select All and Clear", async ({
    page,
  }) => {
    await page.locator("button", { hasText: "Select" }).click();
    await expect(
      page.locator("button", { hasText: /Select All/ })
    ).toBeAttached();
    await expect(
      page.locator("button", { hasText: "Clear" })
    ).toBeAttached();
  });

  test("Select All selects all images and shows Download ZIP", async ({
    page,
  }) => {
    await page.locator("button", { hasText: "Select" }).click();
    await page.locator("button", { hasText: /Select All/ }).click();

    const downloadBtn = page.locator("button.download-button");
    await expect(downloadBtn).toBeAttached();
    await expect(downloadBtn).toContainText("Download ZIP");
  });

  test("opens download modal on Download ZIP click", async ({ page }) => {
    await page.locator("button", { hasText: "Select" }).click();
    await page.locator("button", { hasText: /Select All/ }).click();
    await page.locator("button.download-button").click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeAttached();
    await expect(dialog).toContainText("Download Selected Images");
    await expect(page.locator("#dm-password")).toBeAttached();
  });

  test("wrong password shows error", async ({ page }) => {
    // Mock the CSRF endpoint to return a token
    await page.route("**/csrf-token.php", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: "test-token" }),
      });
    });

    // Mock the download endpoint to return an error
    await page.route("**/download.php", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          message: "Incorrect password.",
        }),
      });
    });

    await page.locator("button", { hasText: "Select" }).click();
    await page.locator("button", { hasText: /Select All/ }).click();
    await page.locator("button.download-button").click();

    // Type wrong password and submit
    await page.fill("#dm-password", "wrong-password");
    await page
      .locator(".download-modal__dialog button", { hasText: "Download ZIP" })
      .click();

    // Should show error alert inside the modal
    const alert = page.locator(".download-modal__notice--error");
    await expect(alert).toContainText("Incorrect password", { timeout: 10000 });
  });

  test("closes modal with close button", async ({ page }) => {
    await page.locator("button", { hasText: "Select" }).click();
    await page.locator("button", { hasText: /Select All/ }).click();
    await page.locator("button.download-button").click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeAttached();

    await page.locator(".download-modal__close").click();
    await expect(dialog).not.toBeAttached();
  });

  test("closes modal with Escape key", async ({ page }) => {
    await page.locator("button", { hasText: "Select" }).click();
    await page.locator("button", { hasText: /Select All/ }).click();
    await page.locator("button.download-button").click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeAttached();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeAttached();
  });

  test("Cancel Select exits selection mode", async ({ page }) => {
    await page.locator("button", { hasText: "Select" }).click();
    await expect(
      page.locator("button", { hasText: "Cancel Select" })
    ).toBeAttached();

    await page.locator("button", { hasText: "Cancel Select" }).click();
    await expect(
      page.locator("button", { hasText: "Cancel Select" })
    ).not.toBeAttached();
  });
});
