import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class DeleteConfirmationDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly cancelButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("delete-confirmation-dialog");
    this.cancelButton = page.getByTestId("delete-cancel-button");
    this.confirmButton = page.getByTestId("delete-confirm-button");
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async clickConfirm() {
    await this.confirmButton.click();
  }

  async waitForDialogToOpen() {
    await expect(this.dialog).toBeVisible();
  }

  async waitForDialogToClose() {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectDialogVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async expectDialogNotVisible() {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectConfirmButtonVisible() {
    await expect(this.confirmButton).toBeVisible();
  }

  async expectCancelButtonVisible() {
    await expect(this.cancelButton).toBeVisible();
  }
}
