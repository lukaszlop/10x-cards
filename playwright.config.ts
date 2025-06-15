import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  /* Global test timeout */
  timeout: 60 * 1000, // 60 seconds per test

  /* Expect timeout for assertions */
  expect: {
    timeout: 15 * 1000, // 15 seconds for expect assertions
  },

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:4321",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Collect screenshots on failure */
    screenshot: "only-on-failure",

    /* Configure data-test-id attribute (not data-testid) */
    testIdAttribute: "data-test-id",

    /* Action timeout for individual actions */
    actionTimeout: 15000, // 15 seconds for actions like click, fill, etc.

    /* Navigation timeout */
    navigationTimeout: 30000, // 30 seconds for navigation
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      ...process.env,
      // Ensure test environment variables are available
      NODE_ENV: "test",
    },
  },
});
