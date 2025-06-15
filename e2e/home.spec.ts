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
    expect(title).toContain("10x Cards");
  });

  test("should navigate when button is clicked", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.goto();

    // Act
    await homePage.clickNavigateButton();
    await homePage.waitForLoad();

    // Assert
    expect(page.url()).toContain("/dashboard");
  });

  test("should take screenshot for visual comparison", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();
    await homePage.waitForLoad();

    // Assert
    await expect(page).toHaveScreenshot("home-page.png");
  });

  test("should search functionality work correctly", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    const searchQuery = "test query";
    await homePage.goto();

    // Act
    await homePage.search(searchQuery);
    await homePage.waitForLoad();

    // Assert
    expect(page.url()).toContain(`search=${encodeURIComponent(searchQuery)}`);
  });
});
