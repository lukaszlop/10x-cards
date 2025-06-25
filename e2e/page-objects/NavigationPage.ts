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
    // Try desktop first, fall back to mobile if not visible
    if (await this.flashcardsLinkDesktop.isVisible()) {
      await this.flashcardsLinkDesktop.click();
    } else {
      // Open mobile menu first, then click the link
      await this.openMobileMenu();
      await this.flashcardsLinkMobile.click();
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
    // Only open if mobile menu button is visible and menu is not already open
    if (await this.mobileMenuButton.isVisible()) {
      const isMenuOpen = await this.flashcardsLinkMobile.isVisible();
      if (!isMenuOpen) {
        await this.mobileMenuButton.click();
        // Wait for menu to animate open
        await this.flashcardsLinkMobile.waitFor({ state: "visible", timeout: 5000 });
      }
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
