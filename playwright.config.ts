import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Look for test files in the "tests" directory
  testDir: "./tests",

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: "html",

  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: "http://localhost:3000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Take screenshots on failure
    screenshot: "only-on-failure"
  },

  // Configure projects for different browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
