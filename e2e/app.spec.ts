import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test("login page renders form elements", async ({ page }) => {
    await page.goto("/login");

    // Wait for preloader to disappear and form to be visible
    const emailInput = page.getByPlaceholder(/enter your email/i);
    await expect(emailInput).toBeVisible({ timeout: 20000 });
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("login form accepts input", async ({ page }) => {
    await page.goto("/login");

    // Wait for form to be ready
    const emailInput = page.getByPlaceholder(/enter your email/i);
    await expect(emailInput).toBeVisible({ timeout: 20000 });
    const passwordInput = page.getByPlaceholder(/enter your password/i);

    await emailInput.fill("test@example.com");
    await passwordInput.fill("testpassword");

    // Verify values were entered
    await expect(emailInput).toHaveValue("test@example.com");
    await expect(passwordInput).toHaveValue("testpassword");
  });

  test("signup page loads successfully", async ({ page }) => {
    await page.goto("/signup");
    // Page should load without crashing
    await expect(page).toHaveURL(/\/signup/);
  });
});
