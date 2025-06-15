import type { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly mainHeading: Locator;
  readonly generationsCard: Locator;
  readonly flashcardsCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeading = page.locator("h1");
    this.generationsCard = page.locator('.grid a[href="/generations"]');
    this.flashcardsCard = page.locator('.grid a[href="/flashcards"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async getTitle() {
    return await this.page.title();
  }

  async getMainHeadingText() {
    return await this.mainHeading.textContent();
  }

  async clickGenerationsCard() {
    await this.generationsCard.click();
  }

  async clickFlashcardsCard() {
    await this.flashcardsCard.click();
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageLoaded() {
    await this.mainHeading.waitFor({ state: "visible" });
  }

  async expectCardsVisible() {
    await this.generationsCard.waitFor({ state: "visible" });
    await this.flashcardsCard.waitFor({ state: "visible" });
  }
}
