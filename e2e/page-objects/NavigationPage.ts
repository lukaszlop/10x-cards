import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class NavigationPage {
  readonly page: Page;
  readonly flashcardsLinkDesktop: Locator;
  readonly flashcardsLinkMobile: Locator;
  readonly logoutButtonDesktop: Locator;
  readonly logoutButtonMobile: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcardsLinkDesktop = page.getByTestId("nav-flashcards-desktop");
    this.flashcardsLinkMobile = page.getByTestId("nav-flashcards-mobile");
    this.logoutButtonDesktop = page.getByTestId("nav-logout-desktop");
    this.logoutButtonMobile = page.getByTestId("nav-logout-mobile");
    this.mobileMenuButton = page.locator('button[aria-label="Toggle menu"]');
  }

  async clickFlashcardsLink() {
    console.log("[NavigationPage] Attempting to click flashcards link...");

    // Check viewport and navigation visibility
    const viewport = this.page.viewportSize();
    console.log(`[NavigationPage] Viewport: ${viewport?.width}x${viewport?.height}`);

    const desktopVisible = await this.flashcardsLinkDesktop.isVisible();
    const mobileButtonVisible = await this.mobileMenuButton.isVisible();

    console.log(`[NavigationPage] Desktop link visible: ${desktopVisible}`);
    console.log(`[NavigationPage] Mobile button visible: ${mobileButtonVisible}`);

    // Try desktop first, fall back to mobile if not visible
    if (desktopVisible) {
      console.log("[NavigationPage] Using desktop navigation");
      await this.flashcardsLinkDesktop.click();
    } else if (mobileButtonVisible) {
      console.log("[NavigationPage] Using mobile navigation");
      // Open mobile menu first, then click the link
      await this.openMobileMenu();
      await this.flashcardsLinkMobile.click();
    } else {
      // Last resort - try to wait for either to become visible
      console.log("[NavigationPage] Neither navigation visible, waiting...");
      await this.page.waitForTimeout(2000);

      if (await this.flashcardsLinkDesktop.isVisible()) {
        console.log("[NavigationPage] Desktop became visible, using it");
        await this.flashcardsLinkDesktop.click();
      } else {
        console.log("[NavigationPage] Forcing desktop click as fallback");
        await this.flashcardsLinkDesktop.click({ force: true });
      }
    }
  }

  async clickLogout() {
    // Try desktop first, fall back to mobile if not visible
    if (await this.logoutButtonDesktop.isVisible()) {
      await this.logoutButtonDesktop.click();
    } else {
      // Open mobile menu first, then click logout
      await this.openMobileMenu();
      await this.logoutButtonMobile.click();
    }
  }

  async openMobileMenu() {
    console.log("[NavigationPage] Attempting to open mobile menu...");

    // Check if mobile menu button is visible
    const mobileButtonVisible = await this.mobileMenuButton.isVisible();
    console.log(`[NavigationPage] Mobile menu button visible: ${mobileButtonVisible}`);

    if (mobileButtonVisible) {
      const isMenuOpen = await this.flashcardsLinkMobile.isVisible();
      console.log(`[NavigationPage] Menu already open: ${isMenuOpen}`);

      if (!isMenuOpen) {
        console.log("[NavigationPage] Clicking mobile menu button...");
        await this.mobileMenuButton.click();

        try {
          // Wait for menu to animate open with longer timeout for CI
          console.log("[NavigationPage] Waiting for mobile menu to open...");
          await this.flashcardsLinkMobile.waitFor({ state: "visible", timeout: 10000 });
          console.log("[NavigationPage] ✅ Mobile menu opened successfully");
        } catch (error) {
          console.log(`[NavigationPage] ❌ Failed to open mobile menu: ${error}`);

          // Try alternative approach - click again and wait
          console.log("[NavigationPage] Retrying mobile menu click...");
          await this.mobileMenuButton.click();
          await this.page.waitForTimeout(1000); // Give it time to animate

          const isNowVisible = await this.flashcardsLinkMobile.isVisible();
          console.log(`[NavigationPage] Menu visible after retry: ${isNowVisible}`);

          if (!isNowVisible) {
            throw new Error("Failed to open mobile menu after retry");
          }
        }
      } else {
        console.log("[NavigationPage] Mobile menu already open, skipping click");
      }
    } else {
      console.log("[NavigationPage] Mobile menu button not visible, assuming desktop mode");
    }
  }

  async closeMobileMenu() {
    // Close mobile menu if it's open
    if (await this.mobileMenuButton.isVisible()) {
      const isMenuOpen = await this.flashcardsLinkMobile.isVisible();
      if (isMenuOpen) {
        await this.mobileMenuButton.click();
        // Wait for menu to animate closed
        await this.flashcardsLinkMobile.waitFor({ state: "hidden", timeout: 5000 });
      }
    }
  }

  async expectFlashcardsLinkVisible() {
    // Check that desktop is visible OR mobile menu button is available
    const desktopVisible = await this.flashcardsLinkDesktop.isVisible();
    const mobileMenuAvailable = await this.mobileMenuButton.isVisible();
    expect(desktopVisible || mobileMenuAvailable).toBe(true);
  }

  async expectLogoutButtonVisible() {
    // Check that desktop is visible OR mobile menu button is available
    const desktopVisible = await this.logoutButtonDesktop.isVisible();
    const mobileMenuAvailable = await this.mobileMenuButton.isVisible();
    expect(desktopVisible || mobileMenuAvailable).toBe(true);
  }

  async waitForNavigation() {
    await this.page.waitForLoadState("networkidle");
  }
}
