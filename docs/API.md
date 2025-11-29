# API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Refresh
Access tokens expire after 15 minutes. Use the refresh token to get a new access token.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```


#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`

#### POST /auth/logout
Logout and invalidate tokens.

**Headers:** Requires authentication

**Response:** `200 OK`

### Courses

#### GET /courses
Get all courses with lock status based on user progression.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "courseNumber": 1,
      "title": "Foundation & Mindset",
      "description": "Course description",
      "thumbnail": "url",
      "isLocked": false,
      "isEnrolled": true,
      "progress": 45
    }
  ]
}
```

#### GET /courses/:id
Get course details including all lessons.

**Headers:** Requires authentication

**Response:** `200 OK`

#### POST /courses/:id/enroll
Enroll in a course.

**Headers:** Requires authentication

**Response:** `201 Created`

#### GET /courses/:id/can-access
Check if user can access a course (progression validation).

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "canAccess": true,
    "reason": "Course unlocked"
  }
}
```
