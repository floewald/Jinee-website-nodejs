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
    // images count depends on config — at least one image expected
    const images = gallery.locator("img");
    await expect(images.first()).toBeAttached();
  });

  test("renders hero slideshow at top of page", async ({ page }) => {
    const hero = page.locator(".hero-section .hero-slide");
    await expect(hero.first()).toBeAttached();
  });

  test("renders videography / featured section", async ({ page }) => {
    const section = page.locator("#portfolio");
    await expect(section).toBeAttached();
    await expect(section.locator("h2")).toHaveText("Videography");
  });

  test("about section is on /about/ page (not homepage)", async ({ page }) => {
    await expect(page.locator("#about")).not.toBeAttached();
  });

  test("homepage does not include a contact form (contact moved to /contact/)", async ({ page }) => {
    await expect(page.locator("#contact")).not.toBeAttached();
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
