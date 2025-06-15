import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginForm = page.getByTestId("login-form");
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");
  }

  async goto() {
    await this.page.goto("/auth/login");
    await this.waitForLoad();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async loginSimple(email: string, password: string) {
    // Simpler login method - just fill, submit and wait for redirect
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();

    // Wait for either redirect or stay on current page
    await this.page.waitForTimeout(5000); // Wait 5 seconds for any processing

    const currentUrl = this.page.url();
    console.log(`After login - Current URL: ${currentUrl}`);

    // Check if still on login page - if so, look for errors
    if (currentUrl.includes("/auth/login")) {
      const errorMessage = await this.getErrorMessage();
      if (errorMessage) {
        throw new Error(`Login failed: ${errorMessage}`);
      } else {
        throw new Error(`Login failed - still on login page without error message. URL: ${currentUrl}`);
      }
    }
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();

    // Wait for either success toast or error message
    const successToast = this.page.locator('text="Zalogowano pomyślnie! Za chwilę zostaniesz przekierowany."');
    const errorMessage = this.page.locator('.text-red-500, .text-destructive, [role="alert"]');

    try {
      // Wait for either success or error to appear
      await Promise.race([
        successToast.waitFor({ state: "visible", timeout: 10000 }),
        errorMessage.waitFor({ state: "visible", timeout: 10000 }),
      ]);

      // Check if we got a success message
      if (await successToast.isVisible()) {
        console.log("✅ Success toast appeared, waiting for redirect...");
        // Wait for the 2-second delay mentioned in the code, plus buffer
        await this.page.waitForTimeout(3000);

        // Now wait for the actual redirect
        await this.page.waitForURL((url) => !url.pathname.startsWith("/auth/login"), {
          timeout: 5000,
        });
        console.log("✅ Redirect completed");
      } else if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        throw new Error(`Login failed with error: ${errorText}`);
      }
    } catch {
      // If we timeout waiting for success/error, check current state
      const currentUrl = this.page.url();
      console.log(`Login timeout. Current URL: ${currentUrl}`);

      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        throw new Error(`Login failed with error: ${errorText}`);
      } else if (currentUrl.includes("/auth/login")) {
        throw new Error(`Login appears to have failed - still on login page: ${currentUrl}`);
      }
      // If we're not on login page, assume success
    }
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle", { timeout: 10000 });
  }

  async expectFormVisible() {
    await expect(this.loginForm).toBeVisible({ timeout: 10000 });
  }

  async expectSubmitButtonEnabled() {
    await expect(this.submitButton).toBeEnabled({ timeout: 10000 });
  }

  async expectSubmitButtonDisabled() {
    await expect(this.submitButton).toBeDisabled({ timeout: 10000 });
  }

  async getErrorMessage() {
    const errorElement = this.page.locator('.text-red-500, .text-destructive, [role="alert"]').first();
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async waitForLoginSuccess() {
    // Wait for successful redirect away from login page
    await this.page.waitForURL((url) => !url.pathname.startsWith("/auth/login"), { timeout: 15000 });
  }

  async expectLoginError() {
    // Expect an error message to be visible
    const errorElement = this.page.locator('.text-red-500, .text-destructive, [role="alert"]').first();
    await expect(errorElement).toBeVisible({ timeout: 10000 });
  }
}
