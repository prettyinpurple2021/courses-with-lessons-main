# E2E Tests for SoloSuccess Intel Academy

This directory contains end-to-end tests for critical user flows in the SoloSuccess Intel Academy platform.

## Test Coverage

### Critical User Flows (`critical-flows.spec.ts`)
- User registration and login flow
- Dashboard access and navigation
- Course and lesson navigation
- Activity completion
- Progress tracking
- Authentication persistence
- Error handling and edge cases

### Sequential Progression (`sequential-progression.spec.ts`)
- Sequential course unlocking (Course One → Course Two → ... → Course Seven)
- Sequential lesson unlocking within courses
- Sequential activity unlocking within lessons
- Final project and exam progression
- Certificate generation
- Progress persistence

### Accessibility (`accessibility.spec.ts`)
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader compatibility

### Authentication (`auth.spec.ts`)
- Login and registration pages
- Protected route access

## Running Tests

### Prerequisites

1. Ensure both frontend and backend are configured:
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Ensure database is set up and seeded:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

### Run All E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/critical-flows.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

### Run Tests in CI/CD

```bash
# CI mode with retries
CI=true npm run test:e2e
```

## Test Structure

### Helper Functions (`helpers/test-helpers.ts`)

Reusable helper functions for common test operations:

- `generateTestUser()` - Create unique test user data
- `registerUser()` - Register a new user
- `loginUser()` - Login with credentials
- `logoutUser()` - Logout current user
- `navigateToCourse()` - Navigate to a specific course
- `navigateToLesson()` - Navigate to a specific lesson
- `submitActivity()` - Submit an activity
- `isCourseLocked()` - Check if a course is locked
- `isLessonLocked()` - Check if a lesson is locked
- `verifySuccessMessage()` - Verify success message appears
- `verifyErrorMessage()` - Verify error message appears

### Test Data

Tests use dynamically generated test data to avoid conflicts:
- Email: `test-{timestamp}@example.com`
- Password: `TestPassword123!`
- Names: Configurable per test

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL**: `http://localhost:5173` (frontend)
- **Backend URL**: `http://localhost:5000` (backend)
- **Timeout**: 60 seconds per test
- **Retries**: 2 in CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On failure
- **Trace**: On first retry

### Web Servers

The configuration automatically starts both frontend and backend servers before running tests:

1. Backend: `npm run dev:backend` on port 5000
2. Frontend: `npm run dev:frontend` on port 5173

## Debugging Tests

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Debug Specific Test

```bash
# Debug mode with browser DevTools
npx playwright test --debug e2e/critical-flows.spec.ts

# Run specific test by name
npx playwright test -g "User Registration Flow"
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots: `test-results/`
- Videos: `test-results/`
- Traces: `test-results/`

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Unique Data**: Use `generateTestUser()` to create unique test data
3. **Wait Strategies**: Use `waitForSelector()` and `waitForURL()` instead of fixed timeouts
4. **Selectors**: Prefer `data-testid` attributes, then semantic selectors, then class names
5. **Assertions**: Use Playwright's built-in assertions with automatic retries
6. **Cleanup**: Tests should clean up after themselves (logout, delete data)

## Troubleshooting

### Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check if backend/frontend servers are running
- Verify database is accessible

### Flaky Tests

- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')` for API calls
- Increase retry count in CI

### Database Issues

- Ensure database is seeded with test data
- Use transactions or cleanup between tests
- Consider using a separate test database

## Requirements Coverage

These E2E tests cover the following requirements:

- **Requirement 1.1**: Landing page and homepage
- **Requirement 3.1**: Course content and sequential access
- **Requirement 11.1**: Interactive activities
- **Requirement 13.1**: Final projects and exams
- **Requirement 5.1**: Certificate generation
- **Requirement 10.1**: Authentication and authorization
- **Requirement 12.1**: Sequential course progression

## Future Enhancements

- [ ] Add visual regression testing
- [ ] Add performance testing with Lighthouse
- [ ] Add mobile device testing
- [ ] Add cross-browser testing (Firefox, Safari)
- [ ] Add API mocking for isolated frontend tests
- [ ] Add database seeding/cleanup utilities
