import { test, expect } from "@playwright/test";

test.describe("Registration Functionality", () => {
  test("should show the registration form", async ({ page }) => {
    // Navigate to the registration page
    await page.goto("/register");

    // Verify the registration form is displayed
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for mismatched passwords", async ({ page }) => {
    // Navigate to the registration page
    await page.goto("/register");

    // Fill in the form with mismatched passwords
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "DifferentPassword123!");

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for validation message about passwords not matching
    // Adjust the selector based on your actual error message elements
    await expect(page.locator("text=Passwords do not match")).toBeVisible({ timeout: 5000 });
  });
});
