import { test, expect } from "@playwright/test";

// This test suite requires authentication
test.describe("Profile Functionality", () => {
  // Before each test, log in
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto("/login");

    // Fill in the login form with valid credentials
    // Replace with a test account that exists in your Firebase
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation after successful login
    await expect(page).toHaveURL(/.*\//, { timeout: 10000 });
  });

  test("should display the profile page", async ({ page }) => {
    // Navigate to the profile page
    await page.goto("/profile");

    // Verify profile elements are visible
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('textarea[name="bio"]')).toBeVisible();
  });
});
