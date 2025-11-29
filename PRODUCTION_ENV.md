# Production Environment Variables Guide

This document provides comprehensive information about all environment variables required for production deployment of SoloSuccess Intel Academy.

## Quick Start

1. Copy `backend/.env.production.example` to `backend/.env.production`
2. Copy `frontend/.env.production.example` to `frontend/.env.production`
3. Fill in all required values
4. Run validation: `npm run validate:env --workspace=backend`

## Backend Environment Variables

### Required Variables

#### Server Configuration
- **`NODE_ENV`** (required)
  - Value: `production`
  - Description: Node.js environment mode
  - Example: `production`

- **`PORT`** (optional, default: 5000)
  - Description: Port on which the backend server runs
  - Example: `5000`

#### Database
- **`DATABASE_URL`** (required)
  - Description: PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database?schema=public`
  - For production with connection pooling: Add `&pgbouncer=true&connect_timeout=10`
  - Example: `postgresql://user:pass@host:5432/solosuccess_academy?schema=public&pgbouncer=true`

#### Authentication & Security
- **`JWT_SECRET`** (required)
  - Description: Secret key for signing JWT access tokens
  - Requirements: Minimum 64 characters, cryptographically random
  - Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - ⚠️ **CRITICAL**: Never use default values in production

- **`JWT_REFRESH_SECRET`** (required)
  - Description: Secret key for signing JWT refresh tokens
  - Requirements: Minimum 64 characters, different from JWT_SECRET
  - Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - ⚠️ **CRITICAL**: Never use default values in production

- **`JWT_EXPIRES_IN`** (optional, default: 15m)
  - Description: Access token expiration time
  - Example: `15m`

- **`JWT_REFRESH_EXPIRES_IN`** (optional, default: 7d)
  - Description: Refresh token expiration time
  - Example: `7d`

#### CORS & Frontend
- **`CORS_ORIGIN`** (required)
  - Description: Allowed origin for CORS requests
  - Format: Full URL with protocol
  - Example: `https://yourdomain.com`
  - ⚠️ Must match your frontend URL exactly

- **`FRONTEND_URL`** (required)
  - Description: Frontend application URL (used for email links, certificates)
  - Format: Full URL with protocol
  - Example: `https://yourdomain.com`

- **`COOKIE_DOMAIN`** (recommended for production)
  - Description: Domain for setting cookies
  - Format: `.yourdomain.com` (note the leading dot)
  - Example: `.yourdomain.com`
  - ⚠️ Required for cross-subdomain cookie sharing

#### Redis
- **`REDIS_URL`** (required for production)
  - Description: Redis connection string
  - Format: `redis://:password@host:port` or `redis://host:port`
  - Example: `redis://:mypassword@redis-host:6379`
  - Alternative: Use `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`

#### File Storage (Cloudinary)
- **`CLOUDINARY_CLOUD_NAME`** (required)
  - Description: Your Cloudinary cloud name
  - Get from: Cloudinary Dashboard
  - Example: `your-cloud-name`

- **`CLOUDINARY_API_KEY`** (required)
  - Description: Cloudinary API key
  - Get from: Cloudinary Dashboard > Settings > API Keys

- **`CLOUDINARY_API_SECRET`** (required)
  - Description: Cloudinary API secret
  - Get from: Cloudinary Dashboard > Settings > API Keys
  - ⚠️ Keep this secret secure

#### Email Service (Resend)
- **`RESEND_API_KEY`** (required)
  - Description: Resend API key for sending emails
  - Format: Starts with `re_`
  - Get from: Resend Dashboard > API Keys
  - Example: `re_1234567890abcdef`

- **`EMAIL_FROM`** (required)
  - Description: Default sender email address
  - Format: Must be verified in Resend
  - Example: `noreply@yourdomain.com`

#### YouTube API
- **`YOUTUBE_API_KEY`** (required)
  - Description: YouTube Data API v3 key for video validation
  - Get from: Google Cloud Console > APIs & Services > Credentials
  - Example: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz`

### Optional Variables

#### Error Tracking
- **`SENTRY_DSN`** (recommended)
  - Description: Sentry DSN for error tracking
  - Format: `https://key@sentry.io/project-id`
  - Get from: Sentry Project Settings > Client Keys (DSN)

- **`SENTRY_ENVIRONMENT`** (optional)
  - Description: Environment name for Sentry
  - Example: `production`

#### Logging
- **`LOG_LEVEL`** (optional, default: info)
  - Values: `error`, `warn`, `info`, `debug`
  - Example: `info`

#### Rate Limiting
- **`RATE_LIMIT_WINDOW_MS`** (optional, default: 900000)
  - Description: Rate limit window in milliseconds (15 minutes)
  - Example: `900000`

- **`RATE_LIMIT_MAX_REQUESTS`** (optional, default: 100)
  - Description: Maximum requests per window
  - Example: `100`

#### Database Connection Pool
- **`DATABASE_POOL_MIN`** (optional, default: 2)
  - Description: Minimum database connections in pool
  - Example: `2`

- **`DATABASE_POOL_MAX`** (optional, default: 10)
  - Description: Maximum database connections in pool
  - Example: `10`

## Frontend Environment Variables

### Required Variables

#### API Configuration
- **`VITE_API_BASE_URL`** (required)
  - Description: Backend API base URL
  - Format: Full URL with protocol and `/api` path
  - Example: `https://api.yourdomain.com/api`
  - ⚠️ Must match your backend CORS_ORIGIN configuration

### Optional Variables

#### Analytics
- **`VITE_GA_MEASUREMENT_ID`** (optional)
  - Description: Google Analytics 4 Measurement ID
  - Format: `G-XXXXXXXXXX`
  - Get from: Google Analytics > Admin > Data Streams

- **`VITE_PLAUSIBLE_DOMAIN`** (optional)
  - Description: Plausible Analytics domain
  - Example: `yourdomain.com`

- **`VITE_ANALYTICS_PROVIDER`** (optional, default: none)
  - Values: `ga4`, `plausible`, `none`
  - Example: `ga4`

#### Error Tracking
- **`VITE_SENTRY_DSN`** (optional)
  - Description: Sentry DSN for frontend error tracking
  - Format: `https://key@sentry.io/project-id`

- **`VITE_SENTRY_ENVIRONMENT`** (optional)
  - Description: Environment name for Sentry
  - Example: `production`

## Environment Variable Validation

Run the validation script before deploying:

```bash
# Backend validation
npm run validate:env --workspace=backend

# Or directly
cd backend
tsx src/scripts/validate-env.ts
```

The script will:
- ✅ Check all required variables are set
- ✅ Validate variable formats
- ✅ Warn about missing optional but recommended variables
- ✅ Check for production-specific issues (e.g., localhost URLs)

## Security Best Practices

1. **Never commit `.env.production` files** to version control
2. **Use strong, random secrets** for JWT keys (minimum 64 characters)
3. **Rotate secrets regularly** (especially JWT secrets)
4. **Use different secrets** for each environment (dev, staging, production)
5. **Restrict API keys** to specific IPs/domains when possible
6. **Use connection pooling** for database connections in production
7. **Enable Redis persistence** for production
8. **Set up monitoring** for environment variable changes

## Render-Specific Configuration

When deploying to Render:

1. Set environment variables in Render Dashboard > Environment
2. Use Render's built-in secret management
3. Reference database/Redis services using Render's service references:
   - `DATABASE_URL`: Use "Internal Database URL" from Render PostgreSQL service
   - `REDIS_URL`: Use "Internal Redis URL" from Render Redis service

## Troubleshooting

### Common Issues

**Issue**: `JWT_SECRET` validation fails
- **Solution**: Generate a new secret using the command above

**Issue**: CORS errors in production
- **Solution**: Ensure `CORS_ORIGIN` exactly matches your frontend URL (including protocol)

**Issue**: Cookies not working
- **Solution**: Set `COOKIE_DOMAIN` to `.yourdomain.com` (with leading dot)

**Issue**: Database connection fails
- **Solution**: Check `DATABASE_URL` format and ensure database is accessible

**Issue**: Redis connection fails
- **Solution**: Verify `REDIS_URL` format and Redis service is running

## Additional Resources

- [Backend Environment Example](../backend/.env.production.example)
- [Frontend Environment Example](../frontend/.env.production.example)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Redis Connection Strings](https://redis.io/docs/management/connection-strings/)

