import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class NavigationPage {
  readonly page: Page;
  readonly flashcardsLinkDesktop: Locator;
  readonly flashcardsLinkMobile: Locator;
  readonly logoutButtonDesktop: Locator;
  readonly logoutButtonMobile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcardsLinkDesktop = page.getByTestId("nav-flashcards-desktop");
    this.flashcardsLinkMobile = page.getByTestId("nav-flashcards-mobile");
    this.logoutButtonDesktop = page.getByTestId("nav-logout-desktop");
    this.logoutButtonMobile = page.getByTestId("nav-logout-mobile");
  }

  async clickFlashcardsLink() {
    // Try desktop first, fall back to mobile if not visible
    if (await this.flashcardsLinkDesktop.isVisible()) {
      await this.flashcardsLinkDesktop.click();
    } else {
      await this.flashcardsLinkMobile.click();
    }
  }

  async clickLogout() {
    // Try desktop first, fall back to mobile if not visible
    if (await this.logoutButtonDesktop.isVisible()) {
      await this.logoutButtonDesktop.click();
    } else {
      await this.logoutButtonMobile.click();
    }
  }

  async expectFlashcardsLinkVisible() {
    // Check that at least one version is visible
    const desktopVisible = await this.flashcardsLinkDesktop.isVisible();
    const mobileVisible = await this.flashcardsLinkMobile.isVisible();
    expect(desktopVisible || mobileVisible).toBe(true);
  }

  async expectLogoutButtonVisible() {
    // Check that at least one version is visible
    const desktopVisible = await this.logoutButtonDesktop.isVisible();
    const mobileVisible = await this.logoutButtonMobile.isVisible();
    expect(desktopVisible || mobileVisible).toBe(true);
  }

  async waitForNavigation() {
    await this.page.waitForLoadState("networkidle");
  }
}
