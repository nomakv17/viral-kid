import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login Flow", () => {
    test("shows login page with all required elements", async ({ page }) => {
      await page.goto("/login");

      // Wait for form to be visible (after preloader)
      const emailInput = page.getByPlaceholder(/enter your email/i);
      await expect(emailInput).toBeVisible({ timeout: 20000 });
      await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /sign in/i })
      ).toBeVisible();
    });

    test("prevents empty form submission", async ({ page }) => {
      await page.goto("/login");

      // Wait for form to load
      const submitButton = page.getByRole("button", { name: /sign in/i });
      await expect(submitButton).toBeVisible({ timeout: 20000 });

      await submitButton.click();

      // Should stay on login page (form validation prevents submission)
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/\/login/);
    });

    test("handles invalid credentials", async ({ page }) => {
      await page.goto("/login");

      // Wait for form to load
      const emailInput = page.getByPlaceholder(/enter your email/i);
      await expect(emailInput).toBeVisible({ timeout: 20000 });

      await emailInput.fill("nonexistent@example.com");
      await page
        .getByPlaceholder(/enter your password/i)
        .fill("wrongpassword123");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should stay on login page after failed login attempt
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Signup Flow", () => {
    test("signup page loads successfully", async ({ page }) => {
      await page.goto("/signup");
      // Page should load without crashing
      await expect(page).toHaveURL(/\/signup/);
    });
  });
});
