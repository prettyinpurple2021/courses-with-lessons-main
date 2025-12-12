# Production Environment Configuration Guide

This guide helps you configure all environment variables for production deployment.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cd backend
   cp env.example .env.production
   ```

2. **Update all values** in `.env.production` with your production credentials

3. **Set environment variables** in your hosting platform (Vercel, Fly.io, etc.)

## Required Environment Variables

### Backend Environment Variables

Create a `.env.production` file in the `backend/` directory with the following:

```env
# ============================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# ============================================

# Node Environment (MUST be 'production')
NODE_ENV=production

# Server Port
PORT=5000

# ============================================
# DATABASE CONFIGURATION
# ============================================
# PostgreSQL connection string for production
# Format: postgresql://user:password@host:port/database
# Example: postgresql://postgres:secure_password@db.example.com:5432/solosuccess_prod
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DATABASE

# ============================================
# JWT SECRETS (REQUIRED - Generate strong secrets)
# ============================================
# Generate secure random strings (at least 32 characters each)
# Use: openssl rand -base64 32
# Or: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_MIN_32_CHARS_LONG_AND_SECURE
JWT_REFRESH_SECRET=YOUR_SUPER_SECRET_REFRESH_KEY_MIN_32_CHARS_LONG_AND_SECURE

# ============================================
# CORS AND FRONTEND CONFIGURATION
# ============================================
# MUST use HTTPS in production (not http://localhost)
# Replace with your actual production domain
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Cookie domain for production (optional but recommended)
# Set to your domain without protocol (e.g., yourdomain.com)
COOKIE_DOMAIN=yourdomain.com

# ============================================
# CLOUDINARY CONFIGURATION (Image Uploads)
# ============================================
# Sign up at https://cloudinary.com/
# Get credentials from Cloudinary Dashboard
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# RESEND API KEY (Email Sending)
# ============================================
# Sign up at https://resend.com/
# API key starts with 're_'
RESEND_API_KEY=re_your-api-key-here

# ============================================
# YOUTUBE API KEY
# ============================================
# Get from https://console.cloud.google.com/apis/credentials
# Enable YouTube Data API v3
YOUTUBE_API_KEY=your-youtube-api-key

# ============================================
# GOOGLE GEMINI API KEY (AI Features)
# ============================================
# Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# ============================================
# REDIS (Optional but Recommended)
# ============================================
# For caching and rate limiting
# Format: redis://user:password@host:port
# Example: redis://default:password@redis.example.com:6379
REDIS_URL=redis://YOUR_REDIS_HOST:6379
```

### Frontend Environment Variables

Create a `.env.production` file in the `frontend/` directory with the following:

```env
# ============================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# ============================================

# API Base URL (MUST use HTTPS)
# Replace with your actual backend API URL
VITE_API_BASE_URL=https://api.yourdomain.com/api

# ============================================
# ANALYTICS CONFIGURATION
# ============================================

# Google Analytics 4 (Optional)
# Get from https://analytics.google.com/
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Plausible Analytics (Optional)
# Get from https://plausible.io/
VITE_PLAUSIBLE_DOMAIN=yourdomain.com

# Analytics Provider
# Options: 'ga4', 'plausible', or 'none'
VITE_ANALYTICS_PROVIDER=ga4
```

## Step-by-Step Setup

### 1. Generate JWT Secrets

Generate secure random secrets for JWT tokens:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important:** Generate TWO different secrets - one for `JWT_SECRET` and one for `JWT_REFRESH_SECRET`.

### 2. Set Up Database

1. **Create Production Database:**
   - Use a managed PostgreSQL service (e.g., Neon, Supabase, AWS RDS, Railway)
   - Create a new database for production
   - Note the connection string

2. **Update DATABASE_URL:**
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

### 3. Set Up Cloudinary

1. Sign up at https://cloudinary.com/
2. Go to Dashboard → Settings
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

### 4. Set Up Resend

1. Sign up at https://resend.com/
2. Go to API Keys
3. Create a new API key
4. Copy the key (starts with `re_`)

### 5. Set Up YouTube API

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key

### 6. Set Up Google Gemini API

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

### 7. Set Up Redis (Optional)

1. Use a managed Redis service (e.g., Upstash, Redis Cloud, AWS ElastiCache)
2. Get the connection URL
3. Update `REDIS_URL`

### 8. Configure Domain URLs

Replace all instances of `yourdomain.com` with your actual production domain:

- `CORS_ORIGIN`: `https://yourdomain.com`
- `FRONTEND_URL`: `https://yourdomain.com`
- `COOKIE_DOMAIN`: `yourdomain.com` (without protocol)
- `VITE_API_BASE_URL`: `https://api.yourdomain.com/api` (or your backend URL)

## Hosting Platform Configuration

### Vercel (Frontend)

1. Go to your project settings
2. Navigate to Environment Variables
3. Add all `VITE_*` variables
4. Set environment to "Production"

### Fly.io (Backend)

1. Use Fly.io secrets:
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set DATABASE_URL=postgresql://...
   fly secrets set JWT_SECRET=...
   # ... etc
   ```

2. Or use `fly.toml` with environment variables

### Other Platforms

Most platforms have an "Environment Variables" or "Config" section where you can add these variables.

## Verification

After setting up, verify your configuration:

```bash
# Run production readiness check
npm run check:production

# This will verify:
# - All required environment variables are set
# - Values are valid (HTTPS URLs, strong secrets, etc.)
# - Database connection works
# - External services are accessible
```

## Security Checklist

- [ ] All secrets are at least 32 characters long
- [ ] No development/test keys in production
- [ ] JWT secrets are unique and randomly generated
- [ ] All URLs use HTTPS (not HTTP)
- [ ] Database credentials are secure
- [ ] API keys are restricted (where possible)
- [ ] Environment variables are not committed to git
- [ ] `.env.production` is in `.gitignore`

## Troubleshooting

### "Invalid value" errors

- **NODE_ENV**: Must be exactly `production` (lowercase)
- **CORS_ORIGIN/FRONTEND_URL**: Must start with `https://` and not contain `localhost`
- **JWT_SECRET**: Must be at least 32 characters and not contain "change-this"

### Database connection issues

- Verify the connection string format
- Check database firewall rules
- Ensure database is accessible from your hosting platform
- Test connection with: `psql $DATABASE_URL`

### API key issues

- Verify API keys are active
- Check API quotas/limits
- Ensure correct API is enabled (e.g., YouTube Data API v3)

## Content Setup (CRITICAL)

After setting up environment variables and deploying, you **MUST** populate your database with real content:

### Quick Setup (Recommended)

Run the all-in-one production content setup script:

```bash
npm run content:setup-production
```

This will:
1. Seed the database with courses, lessons, activities, and exam structures
2. Update all 84 lesson videos with real YouTube educational video IDs
3. Add comprehensive exam questions (20 per course) to all 7 final exams

### Manual Setup (Alternative)

If you prefer to run steps individually:

```bash
# Step 1: Seed database structure
npm run prisma:seed --workspace=backend

# Step 2: Update lesson videos (replaces placeholder videos)
npm run content:update-videos

# Step 3: Add exam questions to all final exams
npm run content:add-exam-questions
```

### Why This Matters

**⚠️ CRITICAL:** Without running these scripts, your production site will have:
- ❌ Placeholder "Rick Roll" videos instead of educational content
- ❌ Empty final exams with zero questions (students cannot complete courses)

**Do NOT deploy to production without running these content scripts!**

## Next Steps

After configuring environment variables and setting up content:

1. ✅ Run `npm run check:production` to verify environment variables
2. ✅ Run `npm run content:setup-production` to populate content
3. ✅ Run `npm run verify:content` to verify all content is complete
4. ✅ Deploy backend to Fly.io
5. ✅ Deploy frontend to Vercel
6. ✅ Run database migrations: `npm run prisma:migrate:deploy --workspace=backend`
7. ✅ Test production deployment
8. ✅ Monitor with Sentry (if configured)

---

**← [Back to Wiki Home](Home.md)** | **[Deployment Guide](Deployment.md)**

**Important:** Never commit `.env.production` files to git. Always use your hosting platform's environment variable configuration.

