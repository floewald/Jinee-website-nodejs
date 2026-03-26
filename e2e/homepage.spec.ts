import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Jinee Chen/);
  });

  test("shows the sr-only h1", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toHaveText(/Jinee Chen/);
  });

  test("renders gallery section", async ({ page }) => {
    const gallery = page.locator("#gallery");
    await expect(gallery).toBeAttached();
    // 9 images in the 3×3 collage
    const images = gallery.locator("img");
    await expect(images).toHaveCount(9);
  });

  test("renders portfolio / featured section", async ({ page }) => {
    const section = page.locator("#portfolio");
    await expect(section).toBeAttached();
    await expect(section.locator("h2")).toHaveText("My Work");
  });

  test("renders about section", async ({ page }) => {
    const section = page.locator("#about");
    await expect(section).toBeAttached();
    await expect(section.locator("h2")).toContainText("Video Producer");
  });

  test("renders contact section", async ({ page }) => {
    const section = page.locator("#contact");
    await expect(section).toBeAttached();
    await expect(section.locator("form.contact-form")).toBeAttached();
  });

  test("nav links are present", async ({ page }) => {
    const nav = page.locator("nav[aria-label='Main']");
    await expect(nav.getByRole("link", { name: "Home" })).toBeAttached();
    await expect(nav.getByRole("link", { name: "Portfolio" })).toBeAttached();
    await expect(nav.getByRole("link", { name: "About" })).toBeAttached();
    await expect(nav.getByRole("link", { name: "Contact" })).toBeAttached();
  });

  test("header logo links to home", async ({ page }) => {
    const logo = page.locator("header a[aria-label='Home']");
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("footer contains email link", async ({ page }) => {
    const emailLink = page.locator("footer a[href='mailto:hello@jineechen.com']");
    await expect(emailLink).toBeAttached();
  });
});
