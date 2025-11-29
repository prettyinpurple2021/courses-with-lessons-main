# Authentication System Implementation

## Overview
Complete authentication system with JWT tokens, password hashing, and password reset functionality.

## Backend Components

### Utilities
- **jwt.ts**: JWT token generation and validation (access & refresh tokens)
- **password.ts**: Password hashing with bcrypt and strength validation
- **tokenStore.ts**: In-memory password reset token management

### Services
- **authService.ts**: Core authentication business logic
  - User registration with auto-enrollment in Course One
  - Login with password verification
  - Password reset request and reset
  - User retrieval

### Middleware
- **auth.ts**: JWT authentication middleware for protected routes
- **rateLimiter.ts**: Rate limiting for API and auth endpoints

### Controllers
- **authController.ts**: HTTP request handlers for all auth endpoints

### Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user (protected)

## Frontend Components

### Services
- **api.ts**: Axios instance with token refresh interceptor
- **authService.ts**: API calls for authentication

### Context & State
- **AuthContext.tsx**: React context for authentication state
- **authStore.ts**: Zustand store for auth state management
- **ToastContext.tsx**: Global toast notifications

### Components
- **ProtectedRoute.tsx**: Route wrapper for authenticated pages

### Pages
- **LoginPage.tsx**: Login form with glassmorphic styling
- **RegisterPage.tsx**: Registration form with validation
- **ForgotPasswordPage.tsx**: Password reset request
- **ResetPasswordPage.tsx**: Password reset with token

## Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 day expiry) in httpOnly cookies
- Password strength validation (8+ chars, uppercase, lowercase, number)
- Rate limiting (5 attempts per 15min for auth endpoints)
- Automatic token refresh on 401 responses
- CORS with credentials support

## Usage

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
See `.env.example` files in both backend and frontend directories.
