# E2E Testing Setup Guide

This guide explains how to set up and run E2E tests using Playwright with the Page Object Model pattern.

## Prerequisites

1. **Test Environment File**: Create a `.env.test` file in the project root with test credentials
2. **Test User Account**: Ensure you have a valid test user account in your Supabase database

## Configuration

### 1. Environment Variables

Create a `.env.test` file with the following structure:

```bash
# Test user credentials
E2E_USERNAME=your-test-email@example.com
E2E_PASSWORD=your_test_password

# Supabase configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# Environment
NODE_ENV=test
```

### 2. Port Configuration

The application runs on **port 4321** during tests (not port 3000):

- Development server: `http://localhost:4321`
- Playwright base URL: `http://localhost:4321`

### 3. Test ID Attributes

Components use `data-test-id` attributes (not `data-testid`):

- Playwright config: `testIdAttribute: "data-test-id"`
- Page objects use: `page.getByTestId("component-name")`

### 4. Timeout Configuration

Updated timeout settings for better reliability:

- Global test timeout: 60 seconds
- Expect timeout: 15 seconds
- Action timeout: 15 seconds
- Navigation timeout: 30 seconds

## Running Tests

### Development Mode for Testing

```bash
npm run dev:e2e
```

This starts Astro in test mode on port 4321.

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Tests with UI

```bash
npm run test:e2e:ui
```

### Generate Test Code

```bash
npm run test:e2e:codegen
```

### Debug Specific Test

```bash
npx playwright test login-debug.spec.ts --debug
```

## Test Structure

### Page Objects

Located in `e2e/page-objects/`:

- `LoginPage.ts` - Login form interactions
  - `loginSimple()` - Simplified login method for reliability
  - `login()` - Full login method with toast detection
- `NavigationPage.ts` - Main navigation (desktop/mobile)
- `FlashcardsPage.ts` - Flashcards listing and management
- `FlashcardFormModal.ts` - Create/edit flashcard modal
- `DeleteConfirmationDialog.ts` - Delete confirmation dialog

### Test Files

Located in `e2e/`:

- `flashcards-e2e.spec.ts` - Main flashcard lifecycle tests
- `login-debug.spec.ts` - Debug tests for login issues

## Test Scenarios

### Complete Flashcard Lifecycle

1. Login with test credentials
2. Navigate to flashcards page
3. Add new flashcard
4. Verify flashcard appears
5. Delete flashcard
6. Verify flashcard is removed
7. Logout

### Form Validation

- Test empty form submission
- Test partial form completion
- Test successful form submission

### Edit Functionality

- Create flashcard
- Edit existing flashcard
- Verify changes are saved

## Troubleshooting

### Common Issues

1. **Login Timeout**:

   - The app has a 2-second delay after successful login before redirect
   - Use `loginSimple()` method for better reliability
   - Check if test credentials are correct

2. **Port Conflicts**: Ensure port 4321 is available
3. **Environment Variables**: Verify `.env.test` file exists and contains valid credentials
4. **Test User**: Make sure test user account exists in Supabase
5. **Test IDs**: Components must have `data-test-id` attributes (not `data-testid`)

### Login Issues

If you see URLs like `http://localhost:4321/auth/login?email=test%40test.com&password=Testy123`:

1. **Check credentials**: Verify `E2E_USERNAME` and `E2E_PASSWORD` in `.env.test`
2. **Check user exists**: Ensure the test user is registered in your Supabase
3. **Use debug test**: Run `npx playwright test login-debug.spec.ts` for detailed logging
4. **Check API**: The debug test includes direct API testing

### Debug Commands

```bash
# Check if configuration is valid
npx playwright test --dry-run

# Run with debug mode
npx playwright test --debug

# Run specific debug test
npx playwright test login-debug.spec.ts

# Generate trace files
npx playwright test --trace on

# Run with detailed logging
npx playwright test --headed
```

### Environment Validation

The tests include validation to ensure required environment variables are present:

- `E2E_USERNAME` - Test user email
- `E2E_PASSWORD` - Test user password

If these are missing, tests will fail with a descriptive error message.

### Login Method Comparison

Two login methods available:

1. **`loginSimple()`** - Recommended for reliability:

   - Fills form and waits 5 seconds for redirect
   - Better for CI/CD environments
   - Less prone to timing issues

2. **`login()`** - Full featured:
   - Waits for success toast message
   - Handles the 2-second app delay
   - More comprehensive error handling

## Performance Tips

1. Use `loginSimple()` for faster, more reliable tests
2. Increase timeouts if tests run on slower machines
3. Use `page.waitForLoadState("networkidle")` for dynamic content
4. Consider running tests in headed mode for debugging: `--headed`

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Page Object Model**: Use page objects for maintainable tests
3. **Wait Strategies**: Use explicit waits, avoid fixed delays
4. **Test Isolation**: Each test should be independent
5. **Error Handling**: Include proper error messages and validation
6. **Clean Data**: Consider test data cleanup strategies

## Security

- `.env.test` file is gitignored for security
- Never commit real credentials to version control
- Use dedicated test accounts, not production data
