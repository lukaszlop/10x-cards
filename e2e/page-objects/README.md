# Page Objects Documentation

This directory contains Page Object Model (POM) classes for E2E testing with Playwright. Each page object encapsulates the selectors and actions for specific UI components.

## Page Objects Overview

### 1. LoginPage (`LoginPage.ts`)

Handles the login form functionality.

**Key Methods:**

- `goto()` - Navigate to login page
- `login(email, password)` - Complete login flow
- `fillEmail(email)` - Fill email input
- `fillPassword(password)` - Fill password input
- `clickSubmit()` - Click login button
- `expectFormVisible()` - Verify login form is visible

**Test IDs Used:**

- `login-form`
- `login-email-input`
- `login-password-input`
- `login-submit-button`

### 2. NavigationPage (`NavigationPage.ts`)

Handles navigation elements (both desktop and mobile).

**Key Methods:**

- `clickFlashcardsLink()` - Navigate to flashcards page
- `clickLogout()` - Logout user
- `expectFlashcardsLinkVisible()` - Verify flashcards link is visible
- `expectLogoutButtonVisible()` - Verify logout button is visible

**Test IDs Used:**

- `nav-flashcards-desktop` / `nav-flashcards-mobile`
- `nav-logout-desktop` / `nav-logout-mobile`

### 3. FlashcardsPage (`FlashcardsPage.ts`)

Handles the main flashcards page functionality.

**Key Methods:**

- `goto()` - Navigate to flashcards page
- `clickAddFlashcard()` - Open new flashcard modal
- `clickDeleteFlashcard(id)` - Delete specific flashcard
- `getLatestFlashcardId()` - Get ID of newest flashcard
- `expectFlashcardVisible(id)` - Verify flashcard is visible
- `expectFlashcardNotVisible(id)` - Verify flashcard is not visible

**Test IDs Used:**

- `flashcards-page`
- `add-flashcard-button`
- `flashcards-list`
- `flashcard-item-{id}`
- `delete-flashcard-{id}`
- `edit-flashcard-{id}`

### 4. FlashcardFormModal (`FlashcardFormModal.ts`)

Handles the flashcard creation/editing modal.

**Key Methods:**

- `fillAndSubmit(frontText, backText)` - Complete form submission
- `fillFront(text)` - Fill front of flashcard
- `fillBack(text)` - Fill back of flashcard
- `clickSubmit()` - Submit form
- `waitForModalToOpen()` - Wait for modal to appear
- `expectSubmitButtonEnabled()` - Verify submit button is enabled

**Test IDs Used:**

- `flashcard-modal`
- `flashcard-form`
- `flashcard-front-input`
- `flashcard-back-input`
- `flashcard-submit-button`
- `flashcard-cancel-button`

### 5. DeleteConfirmationDialog (`DeleteConfirmationDialog.ts`)

Handles the delete confirmation dialog.

**Key Methods:**

- `clickConfirm()` - Confirm deletion
- `clickCancel()` - Cancel deletion
- `waitForDialogToOpen()` - Wait for dialog to appear
- `expectDialogVisible()` - Verify dialog is visible

**Test IDs Used:**

- `delete-confirmation-dialog`
- `delete-confirm-button`
- `delete-cancel-button`

## Usage Example

```typescript
import { test, expect } from "@playwright/test";
import {
  LoginPage,
  NavigationPage,
  FlashcardsPage,
  FlashcardFormModal,
  DeleteConfirmationDialog,
} from "./page-objects";

test("complete flashcard flow", async ({ page }) => {
  // Arrange - Initialize page objects
  const loginPage = new LoginPage(page);
  const navigation = new NavigationPage(page);
  const flashcardsPage = new FlashcardsPage(page);
  const flashcardModal = new FlashcardFormModal(page);
  const deleteDialog = new DeleteConfirmationDialog(page);

  // Act & Assert - Follow the test scenario
  await loginPage.goto();
  await loginPage.login("user@example.com", "password");

  await navigation.clickFlashcardsLink();
  await flashcardsPage.expectPageVisible();

  await flashcardsPage.clickAddFlashcard();
  await flashcardModal.fillAndSubmit("Question", "Answer");

  const flashcardId = await flashcardsPage.getLatestFlashcardId();
  await flashcardsPage.clickDeleteFlashcard(flashcardId);
  await deleteDialog.clickConfirm();

  await navigation.clickLogout();
});
```

## Best Practices

1. **Arrange-Act-Assert Pattern**: Structure tests clearly with setup, actions, and assertions.

2. **Wait Strategies**: Use explicit waits (`waitForModalToOpen()`) rather than fixed delays.

3. **Responsive Design**: Navigation page handles both desktop and mobile variants automatically.

4. **Error Handling**: Each page object includes expectation methods for validation.

5. **Modular Design**: Each page object focuses on a single UI component or page.

6. **Type Safety**: All methods are properly typed with TypeScript.

## Test ID Convention

All test IDs follow kebab-case naming:

- Form elements: `{component}-{field}-{type}` (e.g., `login-email-input`)
- Buttons: `{action}-{target}-button` (e.g., `add-flashcard-button`)
- Containers: `{component}-{type}` (e.g., `flashcards-page`)
- Dynamic elements: `{action}-{target}-{id}` (e.g., `delete-flashcard-123`)
