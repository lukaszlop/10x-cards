# CI/CD Setup Guide

This document explains how to configure GitHub Actions for automated testing with E2E tests.

## Required GitHub Secrets

For the CI/CD pipeline to work properly, you need to set up the following GitHub secrets in your repository:

### 1. Navigate to GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2. Add Required Secrets

Add the following secrets one by one:

#### Test Database Credentials

| Secret Name         | Description                           | Example Value                           |
| ------------------- | ------------------------------------- | --------------------------------------- |
| `TEST_SUPABASE_URL` | URL of your test Supabase project     | `https://your-test-project.supabase.co` |
| `TEST_SUPABASE_KEY` | Anon/public key for your test project | `eyJhbGciOiJIUzI1NiIsInR...`            |

#### Test User Credentials

| Secret Name       | Description                   | Example Value                          |
| ----------------- | ----------------------------- | -------------------------------------- |
| `E2E_USERNAME`    | Email of test user account    | `test@example.com`                     |
| `E2E_PASSWORD`    | Password of test user account | `TestPassword123!`                     |
| `E2E_USERNAME_ID` | UUID of test user account     | `62b6b16e-5398-4898-a42a-b26558b55ef6` |

### 3. Test Database Setup

You need a dedicated Supabase project for testing:

#### Option A: Create New Test Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (e.g., "YourApp-Test")
3. Copy the **Project URL** and **anon/public key**
4. Set up the same database schema as your main project
5. Create a test user account with the credentials you'll use in secrets

#### Option B: Use Existing Project

You can use your existing Supabase project, but:

- Make sure you have a dedicated test user
- Be aware that tests will create/delete data in this database
- Consider using RLS (Row Level Security) to isolate test data

### 4. Database Schema

Ensure your test database has the required tables:

```sql
-- Users table (handled by Supabase Auth)

-- Flashcards table
CREATE TABLE flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own flashcards
CREATE POLICY "Users can manage their own flashcards" ON flashcards
  USING (auth.uid() = user_id);
```

### 5. Test User Account

Create a test user in your Supabase project:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add user**
3. Use the email/password you configured in GitHub secrets
4. Confirm the user's email if required
5. **Copy the user UUID** - you'll need this for the `E2E_USERNAME_ID` secret
   - Click on the test user in the Users list
   - Copy the **ID** field (this is the UUID)

### 6. Verify Setup

After adding all secrets, trigger a workflow run:

1. Make a small commit to your `main` branch
2. Go to **Actions** tab in GitHub
3. Watch the workflow run
4. Check if the E2E tests pass

## Troubleshooting

### Common Issues

1. **Missing Secrets**: The workflow will fail with clear error messages if secrets are missing
2. **Invalid Credentials**: Check that your test user can log in manually
3. **Database Schema**: Ensure your test database has all required tables
4. **RLS Policies**: Make sure Row Level Security policies allow the test user to access data

### Debug Steps

1. **Check secret names**: Ensure they match exactly (case-sensitive)
2. **Test credentials manually**: Try logging into your test Supabase project with the test user
3. **Check database logs**: Look at Supabase logs for authentication errors
4. **Review workflow logs**: GitHub Actions logs will show detailed error messages

### Local vs CI Environment

| Environment           | Configuration                      |
| --------------------- | ---------------------------------- |
| **Local Development** | Uses `.env.test` file (gitignored) |
| **CI/CD**             | Uses GitHub secrets                |

Make sure your local `.env.test` file has the same values as your GitHub secrets.

## Security Best Practices

1. **Dedicated Test Database**: Never use production database for testing
2. **Test User Isolation**: Use a dedicated test user account
3. **Secret Rotation**: Regularly rotate test database credentials
4. **RLS Policies**: Use Row Level Security to prevent data leaks
5. **Environment Separation**: Keep test and production environments completely separate

## Example Workflow

Here's what happens when you push code:

1. **Lint & Test**: Code quality checks and unit tests
2. **Build**: Creates production build with placeholder values
3. **E2E Tests**:
   - Downloads build artifacts
   - Creates `.env.test` with GitHub secrets
   - Runs Playwright tests against real test database
   - Cleans up test data automatically
4. **Summary**: Reports overall pipeline status

## Next Steps

After setting up secrets:

1. Test the pipeline by making a commit
2. Monitor the first few runs to ensure everything works
3. Add more E2E tests as needed
4. Consider setting up test data fixtures for more complex scenarios

## Support

If you encounter issues:

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are set correctly
3. Test your Supabase credentials manually
4. Ensure your test database schema matches the application requirements

## Alternative Solution: Temporarily Disable E2E Tests

If you need to get CI working quickly while setting up the test database, you can temporarily modify the workflow to skip E2E tests:

### Option 1: Skip E2E Job Entirely

Add this condition to the E2E job in `.github/workflows/main.yml`:

```yaml
e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  needs: build
  if: false # Temporarily disable E2E tests
  # ... rest of the job
```

### Option 2: Allow E2E Job to Fail

Modify the summary job to not fail if E2E tests fail:

```yaml
summary:
  name: Pipeline Summary
  runs-on: ubuntu-latest
  needs: [test, build, e2e]
  if: always()
  timeout-minutes: 5

  steps:
    - name: Check pipeline status
      run: |
        echo "=== Pipeline Summary ==="
        echo "Test job: ${{ needs.test.result }}"
        echo "Build job: ${{ needs.build.result }}"
        echo "E2E job: ${{ needs.e2e.result }}"

        if [[ "${{ needs.build.result }}" == "success" ]]; then
          echo "✅ Core pipeline stages completed successfully!"
          echo "📋 E2E job: ${{ needs.e2e.result }} (optional for now)"
        else
          echo "❌ Build failed - check job results"
          exit 1
        fi
```

### Option 3: Use Mock E2E Tests

Create a simple mock test that always passes while you set up the real infrastructure:

```typescript
// e2e/mock.spec.ts
import { test, expect } from "@playwright/test";

test("mock test - remove when real database is ready", async () => {
  // This test always passes - used temporarily while setting up CI
  expect(true).toBe(true);
});
```

Then temporarily modify `playwright.config.ts` to only run mock tests:

```typescript
export default defineConfig({
  testDir: "./e2e",
  testMatch: /mock\.spec\.ts/, // Only run mock tests
  // ... rest of config
});
```

**Remember to revert these changes once you have properly configured the test database!**
