import { expect, test } from "@playwright/test";
import { LoginPage } from "./page-objects";

// Test credentials from environment variables
const TEST_EMAIL = process.env.E2E_USERNAME || "";
const TEST_PASSWORD = process.env.E2E_PASSWORD || "";

test.describe("Login Debug Tests", () => {
  test.beforeEach(() => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test file");
    }
  });

  test("debug login process step by step", async ({ page }) => {
    // Enable request/response logging
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/login")) {
        console.log(`>> LOGIN REQUEST: ${request.method()} ${request.url()}`);
        console.log(`>> Headers:`, request.headers());
        console.log(`>> Body:`, request.postData());
      }
    });

    page.on("response", (response) => {
      if (response.url().includes("/api/auth/login")) {
        console.log(`<< LOGIN RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    const loginPage = new LoginPage(page);

    console.log("Step 1: Navigate to login page");
    await loginPage.goto();
    await loginPage.expectFormVisible();

    console.log("Step 2: Fill login form");
    await loginPage.fillEmail(TEST_EMAIL);
    await loginPage.fillPassword(TEST_PASSWORD);

    console.log("Step 3: Check form state before submission");
    await loginPage.expectSubmitButtonEnabled();

    // Check if form has proper action and method
    const form = page.getByTestId("login-form");
    const formAction = await form.getAttribute("action");
    const formMethod = await form.getAttribute("method");
    console.log(`Form action: ${formAction}, method: ${formMethod}`);

    console.log("Step 4: Submit form and monitor network");
    await loginPage.clickSubmit();

    try {
      // Wait for redirect away from login page (same logic as loginSimple)
      await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"), {
        timeout: 10000, // 10 seconds to handle 2s delay + CI latency
      });

      const currentUrl = page.url();
      console.log(`Current URL after successful redirect: ${currentUrl}`);
      console.log("✅ Login appears to have succeeded");
      await expect(page).toHaveURL("/", { timeout: 5000 });
    } catch {
      // If redirect timeout, check for errors
      const currentUrl = page.url();
      console.log(`Current URL after timeout: ${currentUrl}`);

      // Check for any error messages
      const errorMessage = await loginPage.getErrorMessage();
      if (errorMessage) {
        console.log(`Error message found: ${errorMessage}`);
      }

      // Check if we're still on login page
      if (currentUrl.includes("/auth/login")) {
        console.log("Still on login page - checking for form validation errors");

        // Look for validation errors
        const validationErrors = await page.locator(".text-red-500, .text-destructive").allTextContents();
        console.log("Validation errors:", validationErrors);

        // Only check input values if still on login page
        try {
          const emailInput = page.getByTestId("login-email-input");
          const passwordInput = page.getByTestId("login-password-input");

          const emailValue = await emailInput.inputValue();
          const passwordValue = await passwordInput.inputValue();
          console.log(`Email input value: ${emailValue}`);
          console.log(`Password input has value: ${passwordValue ? "Yes" : "No"}`);
        } catch {
          console.log("Could not check input values - possibly redirected already");
        }

        throw new Error("Login debug test failed - still on login page");
      }
    }
  });

  test("simple login without page objects", async ({ page }) => {
    // Direct approach without page objects for comparison
    console.log("Direct login test starting");

    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Fill form directly
    await page.getByTestId("login-email-input").fill(TEST_EMAIL);
    await page.getByTestId("login-password-input").fill(TEST_PASSWORD);

    console.log("Form filled, clicking submit");
    await page.getByTestId("login-submit-button").click();

    try {
      // Wait for redirect away from login page (consistent with other tests)
      await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"), {
        timeout: 10000, // 10 seconds for CI reliability
      });

      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);
      console.log("✅ Login successful");
    } catch {
      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);
      console.log("❌ Login failed or incomplete");
      throw new Error("Simple login test failed");
    }
  });

  test("check login API directly", async ({ page }) => {
    // Test the login API endpoint directly
    const response = await page.request.post("/api/auth/login", {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`API Response status: ${response.status()}`);
    const responseBody = await response.text();
    console.log(`API Response body: ${responseBody}`);

    if (response.ok()) {
      console.log("✅ API login successful");
    } else {
      console.log("❌ API login failed");
    }
  });
});
