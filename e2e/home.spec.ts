import { expect, test } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";

test.describe("Home Page", () => {
  test("should display page title correctly", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();
    const title = await homePage.getTitle();

    // Assert
    expect(title).toContain("Witaj w 10xCards");
  });

  test("should display main heading correctly", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.goto();

    // Act
    const headingText = await homePage.getMainHeadingText();

    // Assert
    expect(headingText).toContain("Witaj w 10xCards");
  });

  test("should display navigation cards", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.goto();

    // Act & Assert
    await homePage.expectPageLoaded();
    await homePage.expectCardsVisible();

    // Verify cards have correct hrefs without clicking
    const generationsHref = await homePage.generationsCard.getAttribute("href");
    const flashcardsHref = await homePage.flashcardsCard.getAttribute("href");

    expect(generationsHref).toBe("/generations");
    expect(flashcardsHref).toBe("/flashcards");
  });

  test("should display correct content on cards", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.goto();

    // Act
    const generationsText = await homePage.generationsCard.textContent();
    const flashcardsText = await homePage.flashcardsCard.textContent();

    // Assert
    expect(generationsText).toContain("Generowanie fiszek");
    expect(flashcardsText).toContain("Moje fiszki");
  });

  test("should have proper page structure", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.goto();

    // Act & Assert - Verify key elements are present
    await homePage.expectPageLoaded();

    // Check main heading
    await expect(homePage.mainHeading).toBeVisible();

    // Check both cards are visible
    await expect(homePage.generationsCard).toBeVisible();
    await expect(homePage.flashcardsCard).toBeVisible();

    // Check page has proper grid layout
    const gridContainer = page.locator(".grid.grid-cols-1.md\\:grid-cols-2");
    await expect(gridContainer).toBeVisible();

    // Check description text is present
    const description = page.locator('text="Twoje centrum do inteligentnego tworzenia i zarządzania fiszkami."');
    await expect(description).toBeVisible();
  });
});
