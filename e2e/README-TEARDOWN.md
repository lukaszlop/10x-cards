# E2E Database Teardown

## Overview

This project implements automatic database cleanup after E2E tests using Playwright's teardown mechanism. The teardown removes test data from the Supabase database to ensure clean state between test runs.

## How It Works

1. **Teardown Project**: `global.teardown.ts` is configured as a separate Playwright project named "cleanup db"
2. **Dependency**: The main "chromium" project has a teardown dependency on "cleanup db"
3. **Execution**: After all tests complete, the teardown automatically runs to clean up test data

## Environment Variables Required

The teardown requires these environment variables in your `.env.test` file (based on `.env.example` structure):

```env
PUBLIC_SUPABASE_URL=your_supabase_url_here
PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
E2E_USERNAME_ID=your_test_user_id_here

E2E_USERNAME=test@example.com

E2E_PASSWORD=your_test_password_here
```

**Note**: The teardown will sign in as the test user using `E2E_USERNAME` and `E2E_PASSWORD` to respect RLS policies, then clean up all data belonging to that user.

## What Gets Cleaned

The teardown removes all data associated with the test user from these tables:

1. **flashcards** - All flashcards created by the test user
2. **generations** - All AI generation records by the test user
3. **generation_error_logs** - All error logs by the test user

## Configuration

The teardown is configured in `playwright.config.ts`:

```typescript
projects: [
  {
    name: "cleanup db",
    testMatch: /global\.teardown\.ts/,
  },
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
    teardown: "cleanup db",
  },
];
```

## Running Tests with Teardown

Normal test execution automatically includes teardown:

```bash
# Run all tests (teardown runs automatically after)
npm run test:e2e

# Run specific test (teardown still runs after)
npx playwright test home.spec.ts
```

## Skipping Teardown

To run tests without teardown (for debugging):

```bash
# Skip dependencies and teardown
npx playwright test --no-deps
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   - Ensure all required variables are set in `.env.test`
   - Check that `.env.test` is loaded by dotenv
   - Most importantly: `E2E_USERNAME` and `E2E_PASSWORD` must be valid test user credentials

2. **Authentication Errors**

   - Verify test user exists in Supabase Dashboard > Authentication > Users
   - Ensure `E2E_USERNAME` and `E2E_PASSWORD` are correct
   - Check that the test user account is confirmed (not pending email verification)

3. **Permission Errors**
   - RLS policies are respected because teardown signs in as the actual user
   - Ensure your anon key allows authentication operations
   - Check that the test user has permission to delete their own data

### Debug Logs

The teardown provides detailed console logs:

- 🧹 Starting database cleanup
- 🔍 Using test user ID
- ✅ Successful deletion counts
- ❌ Error details if failures occur

### Manual Cleanup

If automatic teardown fails, you can manually clean up:

```sql
-- Replace 'test-user-id' with your actual test user ID
DELETE FROM flashcards WHERE user_id = 'test-user-id';
DELETE FROM generations WHERE user_id = 'test-user-id';
DELETE FROM generation_error_logs WHERE user_id = 'test-user-id';
```
