# 10x-cards

## Table of Contents

- [Project Name](#project-name)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Testing](#testing)
- [CI/CD Setup](#cicd-setup)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [Services](#services)
- [License](#license)

## Project Name

**10x-cards**

## Project Description

10x-cards is a web application designed to streamline the process of creating and managing educational flashcards. The application leverages advanced language models (LLMs) to generate flashcard suggestions from provided text, enabling users to learn efficiently using spaced repetition techniques. Users can both automatically generate flashcards via AI and manually create, edit, or delete flashcards according to their study needs.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase for database and authentication management
- **AI Integration:** Communication with LLM models via Openrouter.ai for generating flashcards
- **Testing:**
  - **Unit Testing:** Vitest + React Testing Library + @testing-library/jest-dom
  - **E2E Testing:** Playwright + @playwright/test
  - **Integration Testing:** MSW (Mock Service Worker) + Supertest + Vitest
  - **Performance Testing:** Lighthouse CI + k6
  - **Accessibility Testing:** @axe-core/playwright + Pa11y
  - **Security Testing:** Snyk + OWASP ZAP
  - **Test Data:** Faker.js + Fishery (factory pattern) + Testcontainers
- **CI/CD & Hosting:** GitHub Actions for pipeline automation and DigitalOcean for hosting

## Getting Started Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/10x-cards.git
   cd 10x-cards
   ```

2. **Ensure you are using the correct Node version:**
   This project uses the Node version specified in the `.nvmrc` file. Currently it's **22.14.0**.

   ```bash
   nvm use
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000` or the URL provided in your terminal.

## Testing

This project uses a comprehensive testing strategy with multiple levels of testing to ensure code quality and reliability.

### Testing Stack

- **Unit Tests**: Vitest + React Testing Library + @testing-library/jest-dom
- **E2E Tests**: Playwright + @playwright/test
- **API Mocking**: MSW (Mock Service Worker)
- **Test Data**: Faker.js + Fishery (factory pattern)

### Running Tests

```bash
# Unit Tests
npm run test                 # Run once
npm run test:watch          # Watch mode
npm run test:ui             # Interactive UI
npm run test:coverage       # With coverage report

# E2E Tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # E2E tests with UI
npm run test:e2e:codegen    # Generate test code
```

### Test Structure

```
├── src/test/               # Unit test setup and mocks
├── e2e/                    # E2E tests and page objects
├── e2e/page-objects/       # Page Object Model classes
└── src/factories/          # Test data factories
```

### Writing Tests

**Unit Tests** - Use Arrange-Act-Assert pattern:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('should handle user interaction', async () => {
  // Arrange
  const user = userEvent.setup();

  // Act
  render(<Component />);
  await user.click(screen.getByTestId('submit-button'));

  // Assert
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

**E2E Tests** - Use Page Object Model:

```typescript
import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";

test("should complete user workflow", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.performAction();
  await expect(page).toHaveURL(/success/);
});
```

### Testing Best Practices

- Use `data-testid` attributes for reliable element selection
- Mock external dependencies with MSW
- Use factories for consistent test data
- Test user interactions, not implementation details
- Maintain 80%+ code coverage
- Use TypeScript for type safety in tests

### Local E2E Setup

For local E2E testing, create `.env.test` file:

```bash
# Test environment
NODE_ENV=test
E2E_USERNAME=your-test-email@example.com
E2E_PASSWORD=your-test-password
E2E_USERNAME_ID=your-test-user-uuid
PUBLIC_SUPABASE_URL=your-test-supabase-url
PUBLIC_SUPABASE_KEY=your-test-supabase-key
```

## CI/CD Setup

This project includes automated testing and deployment via GitHub Actions. The pipeline runs on every push and pull request to ensure code quality.

### Pipeline Overview

The CI/CD pipeline includes:

- **Lint & Test**: ESLint checks and unit tests with Vitest
- **E2E Tests**: End-to-end tests with Playwright against a real test database
- **Build**: Production build verification
- **Reports**: Test coverage and Playwright reports

### Quick Setup

1. **Fork/Clone** the repository
2. **Configure GitHub Secrets** - Follow the [CI/CD Setup Guide](README-CI-SETUP.md)
3. **Push to main** - Pipeline runs automatically

### Required GitHub Secrets

For E2E tests to work in CI, you need these secrets:

- `TEST_SUPABASE_URL` - Test database URL
- `TEST_SUPABASE_KEY` - Test database anon key
- `E2E_USERNAME` - Test user email
- `E2E_PASSWORD` - Test user password
- `E2E_USERNAME_ID` - Test user UUID

📋 **Detailed setup instructions:** [CI/CD Setup Guide](README-CI-SETUP.md)

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the project for production.
- **`npm run preview`**: Previews the production build locally.
- **`npm run astro`**: Executes Astro commands.
- **`npm run lint`**: Lints the project files.
- **`npm run lint:fix`**: Automatically fixes linting issues.
- **`npm run format`**: Formats the codebase using Prettier.
- **`npm run test`**: Runs unit tests with Vitest.
- **`npm run test:watch`**: Runs unit tests in watch mode.
- **`npm run test:coverage`**: Runs unit tests with coverage report.
- **`npm run test:e2e`**: Runs end-to-end tests with Playwright.
- **`npm run test:e2e:ui`**: Runs E2E tests with Playwright UI mode.

## Project Scope

10x-cards focuses on delivering a streamlined flashcard creation experience. Key features include:

- **Automatic Flashcard Generation:**
  Automatically generate flashcards by submitting text to an AI model, which returns flashcard suggestions that users can review and approve.

- **Manual Flashcard Management:**
  Create, edit, and delete flashcards manually to tailor learning experiences.

- **User Authentication:**
  Basic registration and login functionalities ensuring personalized access and data privacy.

- **Spaced Repetition:**
  Integration with spaced repetition algorithms to schedule flashcard reviews effectively.

- **Usage Metrics:**
  Collecting statistics on AI-generated flashcards and user acceptance rates to continuously improve the system.

**Out of Scope (MVP):**

- Advanced flashcard scheduling algorithms (beyond standard spaced repetition)
- Mobile applications
- Importing multiple document formats (e.g., PDF, DOCX)
- Publicly available API and advanced notifications features

## Project Status

The project is currently in its MVP stage, focusing on core functionalities such as flashcard generation, user management, and essential spaced repetition. Future iterations may expand on the features and refine the user experience based on feedback.

## Services

### OpenRouter Service

The OpenRouter Service (`src/lib/openrouter.service.ts`) is responsible for communicating with the OpenRouter API to generate AI-powered responses. It provides a robust interface for sending messages and receiving structured responses.

#### Features

- Structured JSON responses with validation
- Automatic retry mechanism with exponential backoff
- Comprehensive error handling and logging
- Configurable system messages and model parameters
- Type-safe API using TypeScript

#### Usage Example

```typescript
// Initialize the service
const openRouterService = new OpenRouterService({
  supabase, // Supabase client instance
  userId, // Current user ID
});

// Configure the service (optional)
openRouterService.setSystemMessage("You are an expert flashcard creator.");
openRouterService.updateModelConfig({
  name: "openai/gpt-4o-mini",
  temperature: 0.7,
  max_tokens: 150,
  top_p: 0.9,
});

// Send a message and get response
try {
  const response = await openRouterService.sendMessage("Create a flashcard about photosynthesis.");
  console.log(response);
  // {
  //   answer: "Front: What is photosynthesis?\nBack: The process by which plants convert light energy into chemical energy to produce glucose from CO2 and water.",
  //   confidence: 0.95
  // }
} catch (error) {
  console.error("Failed to generate response:", error);
}
```

#### Error Handling

The service includes comprehensive error handling for various scenarios:

- Network errors with automatic retry
- Authentication failures
- Rate limiting
- Invalid responses
- Internal service errors

All errors are automatically logged to the `generation_error_logs` table in Supabase for monitoring and debugging.

## License

This project is licensed under the MIT License.
