import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact/");
  });

  test("shows required fields", async ({ page }) => {
    const form = page.locator("form.contact-form");
    await expect(form.locator("label[for='cf-first-name']")).toBeAttached();
    await expect(form.locator("label[for='cf-last-name']")).toBeAttached();
    await expect(form.locator("label[for='cf-email']")).toBeAttached();
    await expect(form.locator("label[for='cf-message']")).toBeAttached();
  });

  test("submit button exists and is enabled", async ({ page }) => {
    const submit = page.locator("form.contact-form button[type='submit']");
    await expect(submit).toBeAttached();
    await expect(submit).toBeEnabled();
  });

  test("honeypot field is hidden", async ({ page }) => {
    const honeypot = page.locator("form.contact-form input[name='website']");
    await expect(honeypot).toBeAttached();
    await expect(honeypot).toBeHidden();
  });

  test("consent checkbox exists", async ({ page }) => {
    const checkbox = page.locator("form.contact-form input[name='consent']");
    await expect(checkbox).toBeAttached();
  });

  test("shows network error on failed submission", async ({ page }) => {
    // Block backend calls to simulate network error
    await page.route("**/csrf-token.php", (route) => route.abort());

    // Fill required fields
    await page.fill("#cf-first-name", "Test");
    await page.fill("#cf-last-name", "User");
    await page.fill("#cf-email", "test@example.com");
    await page.fill("#cf-message", "Hello from Playwright");
    await page.locator("input[name='consent']").check();

    // Submit
    await page.locator("form.contact-form button[type='submit']").click();

    // Should show a network error message
    const errorMsg = page.locator(".contact-form").getByText(/network error/i);
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  });

  test("persists draft in sessionStorage", async ({ page }) => {
    const firstName = page.locator("#cf-first-name");
    await firstName.fill("Draft");
    await firstName.blur();
    await page.fill("#cf-email", "draft@example.com");

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const raw = sessionStorage.getItem("contactFormDraft");
          if (!raw) return null;
          try {
            const parsed = JSON.parse(raw) as {
              firstName?: string;
              email?: string;
            };
            return {
              firstName: parsed.firstName ?? "",
              email: parsed.email ?? "",
            };
          } catch {
            return null;
          }
        })
      )
      .toEqual({
        firstName: "Draft",
        email: "draft@example.com",
      });
  });
});
