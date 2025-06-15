import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class FlashcardsPage {
  readonly page: Page;
  readonly pageContainer: Locator;
  readonly addFlashcardButton: Locator;
  readonly flashcardsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageContainer = page.getByTestId("flashcards-page");
    this.addFlashcardButton = page.getByTestId("add-flashcard-button");
    this.flashcardsList = page.getByTestId("flashcards-list");
  }

  async goto() {
    await this.page.goto("/flashcards");
  }

  async clickAddFlashcard() {
    await this.addFlashcardButton.click();
  }

  getFlashcardItem(id: number) {
    return this.page.getByTestId(`flashcard-item-${id}`);
  }

  getEditButton(id: number) {
    return this.page.getByTestId(`edit-flashcard-${id}`);
  }

  getDeleteButton(id: number) {
    return this.page.getByTestId(`delete-flashcard-${id}`);
  }

  async clickEditFlashcard(id: number) {
    const editButton = this.getEditButton(id);
    await editButton.click();
  }

  async clickDeleteFlashcard(id: number) {
    const deleteButton = this.getDeleteButton(id);
    await deleteButton.click();
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async expectPageVisible() {
    await expect(this.pageContainer).toBeVisible();
  }

  async expectAddButtonVisible() {
    await expect(this.addFlashcardButton).toBeVisible();
  }

  async expectFlashcardVisible(id: number) {
    const flashcardItem = this.getFlashcardItem(id);
    await expect(flashcardItem).toBeVisible();
  }

  async expectFlashcardNotVisible(id: number) {
    const flashcardItem = this.getFlashcardItem(id);
    await expect(flashcardItem).not.toBeVisible();
  }

  async getFlashcardsCount() {
    const flashcards = this.flashcardsList.locator('[data-test-id^="flashcard-item-"]');
    return await flashcards.count();
  }

  async waitForFlashcardToAppear() {
    // Wait for any new flashcard to appear
    await this.page.waitForSelector('[data-test-id^="flashcard-item-"]', {
      state: "visible",
      timeout: 5000,
    });
  }

  async getLatestFlashcardId(): Promise<number> {
    // Get all flashcard items and find the highest ID
    const flashcards = await this.flashcardsList.locator('[data-test-id^="flashcard-item-"]').all();
    let maxId = 0;

    for (const flashcard of flashcards) {
      const testId = await flashcard.getAttribute("data-test-id");
      if (testId) {
        const id = parseInt(testId.replace("flashcard-item-", ""));
        if (id > maxId) {
          maxId = id;
        }
      }
    }

    return maxId;
  }
}
