# Running E2E Tests

## Quick Start

### 1. Start the servers

In separate terminal windows, start both the backend and frontend:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

Wait for both servers to be ready:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### 2. Run the tests

In a third terminal:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/critical-flows.spec.ts

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see the browser)
npx playwright test --headed

# Run specific test by name
npx playwright test -g "User Registration Flow"
```

## Test Files

- `auth.spec.ts` - Basic authentication tests
- `accessibility.spec.ts` - Accessibility compliance tests
- `critical-flows.spec.ts` - Complete user journey tests
- `sequential-progression.spec.ts` - Sequential course progression tests

## Troubleshooting

### Servers not running
Make sure both backend and frontend are running before starting tests:
```bash
# Check backend
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost:5173
```

### Database not seeded
Ensure the database has test data:
```bash
cd backend
npx prisma db seed
```

### Port conflicts
If ports 5000 or 5173 are in use, update the `.env` files and `playwright.config.ts`

## CI/CD

For automated testing in CI/CD pipelines, you can configure Playwright to automatically start the servers by uncommenting the `webServer` section in `playwright.config.ts`.

