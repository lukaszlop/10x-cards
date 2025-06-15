# 🧪 Running Tests

## Unit Tests for useFlashcards Hook

### Quick Start

```bash
# Run all tests
npm run test

# Run specific test file
npm run test useFlashcards.test.ts

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI mode
npm run test -- --ui

# Run tests with coverage
npm run test -- --coverage
```

### Test Categories

#### 🔧 **Initial State Tests**

- Default values initialization
- Custom options handling

#### 📥 **Fetching Tests**

- Successful data loading
- API error handling
- Network error scenarios

#### 📄 **Pagination Tests**

- Page navigation
- Limit changes with page reset
- Edge cases with empty pages

#### ➕ **Add Flashcard Tests**

- Successful creation
- Data refresh after adding
- Error handling

#### ✏️ **Update Flashcard Tests**

- In-place updates
- Error scenarios
- Type safety

#### 🗑️ **Remove Flashcard Tests**

- Successful deletion
- Auto-navigation to previous page
- Error handling

#### ⚠️ **Edge Cases**

- Empty data sets
- Malformed API responses
- Credential handling

#### 📋 **Business Rules**

- Default page size (9)
- Sorting by created_at desc
- Proper API parameter construction

### Test Utilities

The test file uses several utilities:

- **`createMockFlashcard()`** - Factory for creating test flashcards
- **`createMockResponse()`** - Factory for API response mocking
- **`vi.mock()`** - Mocking fetch API calls
- **`renderHook()`** - Testing React hooks
- **`waitFor()`** - Async assertions

### Coverage Goals

Current test coverage focuses on:

- ✅ All CRUD operations
- ✅ Pagination logic
- ✅ Error handling
- ✅ Business rules validation
- ✅ Type safety

### Running Specific Test Groups

```bash
# Run only pagination tests
npm run test -- -t "Pagination"

# Run only error scenarios
npm run test -- -t "error"

# Run business rules tests
npm run test -- -t "Business Rules"
```

### Debugging Failed Tests

1. Use `--reporter=verbose` for detailed output
2. Add `console.log` in tests for debugging
3. Use `vi.mock()` spy methods to inspect call history
4. Run single test with `-t "test name"`

### Adding New Tests

Follow the project patterns:

1. Use **Arrange-Act-Assert** structure
2. Mock external dependencies with `vi.mock()`
3. Use descriptive test names
4. Group related tests in `describe` blocks
5. Test both success and error scenarios
