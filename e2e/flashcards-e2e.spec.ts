import { expect, test } from "@playwright/test";
import {
  DeleteConfirmationDialog,
  FlashcardFormModal,
  FlashcardsPage,
  LoginPage,
  NavigationPage,
} from "./page-objects";

// Test credentials from environment variables
const TEST_EMAIL = process.env.E2E_USERNAME || "";
const TEST_PASSWORD = process.env.E2E_PASSWORD || "";

test.describe("Flashcards E2E Flow", () => {
  test.beforeEach(() => {
    // Ensure test credentials are available
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test file");
    }
  });

  test("complete flashcard lifecycle: login -> create -> delete -> logout", async ({ page }) => {
    // Arrange - Initialize page objects
    const loginPage = new LoginPage(page);
    const navigation = new NavigationPage(page);
    const flashcardsPage = new FlashcardsPage(page);
    const flashcardModal = new FlashcardFormModal(page);
    const deleteDialog = new DeleteConfirmationDialog(page);

    // Step 1: Navigate to login page and login
    await loginPage.goto();
    await loginPage.expectFormVisible();

    console.log(`Attempting login with email: ${TEST_EMAIL}`);
    // Use simpler login method for better reliability
    await loginPage.loginSimple(TEST_EMAIL, TEST_PASSWORD);

    // Step 2: Verify redirect to home page and navigate to flashcards
    await expect(page).toHaveURL("/", { timeout: 15000 });
    await navigation.expectFlashcardsLinkVisible();
    await navigation.clickFlashcardsLink();

    // Step 3: Wait for flashcards page to load
    await expect(page).toHaveURL("/flashcards", { timeout: 10000 });
    await flashcardsPage.expectPageVisible();
    await flashcardsPage.expectAddButtonVisible();

    // Wait for page to fully load and stabilize
    await page.waitForTimeout(5000);

    // Step 4: Click "Add new flashcard" button
    await flashcardsPage.clickAddFlashcard();

    // Step 5: Wait for modal to open and verify it's visible
    await flashcardModal.waitForModalToOpen();
    await flashcardModal.expectModalVisible();

    // Step 6: Fill in flashcard form
    const frontText = "What is the capital of Poland?";
    const backText = "Warsaw";

    await flashcardModal.fillFront(frontText);
    await flashcardModal.fillBack(backText);

    // Step 7: Submit the form to add flashcard
    await flashcardModal.expectSubmitButtonEnabled();
    await flashcardModal.clickSubmit();

    // Step 8: Wait for modal to close and verify new flashcard appears
    await flashcardModal.waitForModalToClose();
    await flashcardsPage.waitForFlashcardToAppear();

    // Step 9: Get the latest flashcard ID and verify it's visible
    const latestFlashcardId = await flashcardsPage.getLatestFlashcardId();
    expect(latestFlashcardId).toBeGreaterThan(0);
    await flashcardsPage.expectFlashcardVisible(latestFlashcardId);

    // Step 10: Click delete button on the newly created flashcard
    await flashcardsPage.clickDeleteFlashcard(latestFlashcardId);

    // Step 11: Verify delete confirmation dialog appears and confirm deletion
    await deleteDialog.waitForDialogToOpen();
    await deleteDialog.expectDialogVisible();
    await deleteDialog.expectConfirmButtonVisible();
    await deleteDialog.clickConfirm();

    // Step 12: Wait for dialog to close and verify flashcard is removed
    await deleteDialog.waitForDialogToClose();
    await flashcardsPage.expectFlashcardNotVisible(latestFlashcardId);

    // Step 13: Logout using navigation
    await navigation.expectLogoutButtonVisible();
    await navigation.clickLogout();

    // Step 14: Verify redirect to login page
    await expect(page).toHaveURL("/auth/login", { timeout: 10000 });
    await loginPage.expectFormVisible();
  });

  test("add flashcard with validation", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const navigation = new NavigationPage(page);
    const flashcardsPage = new FlashcardsPage(page);
    const flashcardModal = new FlashcardFormModal(page);

    // Act & Assert - Login and navigate to flashcards
    await loginPage.goto();
    await loginPage.loginSimple(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL("/", { timeout: 15000 });

    await navigation.clickFlashcardsLink();
    await flashcardsPage.expectPageVisible();

    // Wait for page to fully load and stabilize
    await page.waitForTimeout(5000);

    // Test empty form validation
    await flashcardsPage.clickAddFlashcard();
    await flashcardModal.waitForModalToOpen();

    // Submit button should be disabled with empty form
    await flashcardModal.expectSubmitButtonDisabled();

    // Fill only front, back should still be required
    await flashcardModal.fillFront("Test question");
    await flashcardModal.expectSubmitButtonDisabled();

    // Fill both fields, submit should be enabled
    await flashcardModal.fillBack("Test answer");
    await flashcardModal.expectSubmitButtonEnabled();

    // Cancel the form
    await flashcardModal.clickCancel();
    await flashcardModal.waitForModalToClose();
  });

  test("edit existing flashcard", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const navigation = new NavigationPage(page);
    const flashcardsPage = new FlashcardsPage(page);
    const flashcardModal = new FlashcardFormModal(page);

    // Act & Assert - Setup: Login and navigate to flashcards
    await loginPage.goto();
    await loginPage.loginSimple(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL("/", { timeout: 15000 });

    await navigation.clickFlashcardsLink();
    await flashcardsPage.expectPageVisible();

    // Wait for page to fully load and stabilize
    await page.waitForTimeout(5000);

    // First create a flashcard to edit
    await flashcardsPage.clickAddFlashcard();
    await flashcardModal.waitForModalToOpen();
    await flashcardModal.fillAndSubmit("Original Question", "Original Answer");
    await flashcardModal.waitForModalToClose();

    // Get the latest flashcard and edit it
    const flashcardId = await flashcardsPage.getLatestFlashcardId();
    await flashcardsPage.clickEditFlashcard(flashcardId);

    // Verify modal opens with existing content
    await flashcardModal.waitForModalToOpen();
    expect(await flashcardModal.getFrontInputValue()).toBe("Original Question");
    expect(await flashcardModal.getBackInputValue()).toBe("Original Answer");

    // Edit the content
    await flashcardModal.clearForm();
    await flashcardModal.fillAndSubmit("Updated Question", "Updated Answer");
    await flashcardModal.waitForModalToClose();

    // Verify flashcard still exists (content verification would require additional selectors)
    await flashcardsPage.expectFlashcardVisible(flashcardId);
  });
});
