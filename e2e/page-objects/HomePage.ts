import { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navigateButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByTestId("main-heading");
    this.navigateButton = page.getByTestId("navigate-btn");
    this.searchInput = page.getByTestId("search-input");
  }

  async goto() {
    await this.page.goto("/");
  }

  async getTitle() {
    return await this.page.title();
  }

  async clickNavigateButton() {
    await this.navigateButton.click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }
}
