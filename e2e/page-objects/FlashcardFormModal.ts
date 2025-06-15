import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class FlashcardFormModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly form: Locator;
  readonly frontInput: Locator;
  readonly backInput: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId("flashcard-modal");
    this.form = page.getByTestId("flashcard-form");
    this.frontInput = page.getByTestId("flashcard-front-input");
    this.backInput = page.getByTestId("flashcard-back-input");
    this.cancelButton = page.getByTestId("flashcard-cancel-button");
    this.submitButton = page.getByTestId("flashcard-submit-button");
  }

  async fillFront(text: string) {
    await this.frontInput.fill(text);
    // Wait for React Hook Form to update validation state
    await this.page.waitForTimeout(100);
  }

  async fillBack(text: string) {
    await this.backInput.fill(text);
    // Wait for React Hook Form to update validation state
    await this.page.waitForTimeout(100);
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async fillAndSubmit(frontText: string, backText: string) {
    await this.fillFront(frontText);
    await this.fillBack(backText);
    await this.clickSubmit();
  }

  async waitForModalToOpen() {
    await expect(this.modal).toBeVisible();
  }

  async waitForModalToClose() {
    await expect(this.modal).not.toBeVisible();
  }

  async expectModalVisible() {
    await expect(this.modal).toBeVisible();
  }

  async expectModalNotVisible() {
    await expect(this.modal).not.toBeVisible();
  }

  async expectSubmitButtonEnabled() {
    await expect(this.submitButton).toBeEnabled();
  }

  async expectSubmitButtonDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  async getFrontInputValue() {
    return await this.frontInput.inputValue();
  }

  async getBackInputValue() {
    return await this.backInput.inputValue();
  }

  async clearForm() {
    await this.frontInput.clear();
    await this.backInput.clear();
  }
}
