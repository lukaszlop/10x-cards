import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load test environment variables (only if .env.test exists - for local development)
try {
  dotenv.config({ path: ".env.test" });
} catch {
  // .env.test doesn't exist (e.g., in CI) - that's fine, we'll use environment variables directly
}

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
      name: "cleanup db",
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      teardown: "cleanup db",
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev:e2e", // Always use dev mode for E2E tests
    url: "http://localhost:4321",
    reuseExistingServer: false, // Always start fresh server for consistent results
    timeout: 120 * 1000,
    env: {
      // Pass through all environment variables
      ...process.env,
      // Ensure test mode is set
      NODE_ENV: "test",
      // Override with explicitly set test variables (this ensures they take precedence)
      ...(process.env.PUBLIC_SUPABASE_URL && { PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL }),
      ...(process.env.PUBLIC_SUPABASE_KEY && { PUBLIC_SUPABASE_KEY: process.env.PUBLIC_SUPABASE_KEY }),
      ...(process.env.E2E_USERNAME && { E2E_USERNAME: process.env.E2E_USERNAME }),
      ...(process.env.E2E_PASSWORD && { E2E_PASSWORD: process.env.E2E_PASSWORD }),
      ...(process.env.E2E_USERNAME_ID && { E2E_USERNAME_ID: process.env.E2E_USERNAME_ID }),
      ...(process.env.CI && { CI: process.env.CI }),
    },
  },
});
