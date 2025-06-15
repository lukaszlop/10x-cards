# Testing Guide

## Overview

This project uses a comprehensive testing strategy with multiple levels of testing:

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **API Mocking**: MSW (Mock Service Worker)
- **Test Data**: Faker.js + Fishery factories

## Installation

First, install all dependencies:

```bash
npm install
```

## Unit Tests

### Running Unit Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Unit Test Structure

- Tests are located alongside components: `src/components/Button.test.tsx`
- Setup files: `src/test/setup.ts`
- Mock handlers: `src/test/mocks/handlers.ts`
- Factories: `src/factories/`

### Writing Unit Tests

Follow the **Arrange-Act-Assert** pattern:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component', () => {
  it('should do something', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockFn = vi.fn();

    // Act
    render(<Component onClick={mockFn} />);
    await user.click(screen.getByRole('button'));

    // Assert
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

## E2E Tests

### Running E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Generate test code
npm run test:e2e:codegen
```

### E2E Test Structure

- Tests: `e2e/`
- Page Objects: `e2e/page-objects/`
- Fixtures: `e2e/fixtures/`

### Writing E2E Tests

Use **Page Object Model** and **data-testid** attributes:

```typescript
import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";

test("should interact with page", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);

  // Act
  await homePage.goto();
  await homePage.clickButton();

  // Assert
  await expect(page).toHaveScreenshot();
});
```

### Page Object Example

```typescript
export class HomePage {
  constructor(private page: Page) {}

  async clickButton() {
    await this.page.getByTestId("submit-button").click();
  }
}
```

## Test Data

### Using Factories

```typescript
import { userFactory } from "../factories/user.factory";

const testUser = userFactory.build();
const multipleUsers = userFactory.buildList(5);
```

### Using Faker

```typescript
import { faker } from "@faker-js/faker";

const testEmail = faker.internet.email();
const testName = faker.person.fullName();
```

## Mock Service Worker (MSW)

API requests are mocked using MSW. Handlers are defined in `src/test/mocks/handlers.ts`:

```typescript
export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([userFactory.build()]);
  }),
];
```

## Coverage

- Minimum coverage threshold: **80%**
- Coverage reports are generated in `coverage/` directory
- View HTML report: `coverage/index.html`

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Follow Arrange-Act-Assert** pattern
3. **Mock external dependencies** with MSW
4. **Use factories** for consistent test data
5. **Test user interactions**, not implementation details
6. **Take screenshots** for visual regression testing
7. **Use TypeScript** for type safety in tests

## Debugging

### Unit Tests

- Use `test.only()` to run single test
- Use `vi.mock()` for mocking modules
- Check `src/test/setup.ts` for global configuration

### E2E Tests

- Use `test.only()` to run single test
- Use `--debug` flag for debugging
- Check `playwright-report/` for detailed reports
- Use `trace: 'on'` in config for full traces

## CI/CD Integration

Tests run automatically on:

- Every commit
- Every pull request
- Before deployment

Quality gates:

- ✅ All tests must pass
- ✅ Coverage above 80%
- ✅ No critical vulnerabilities
