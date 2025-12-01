# Production Readiness Guide

This guide helps you verify that your SoloSuccess Intel Academy platform is ready for production deployment.

## Quick Start

Run the production readiness check:

```bash
npm run check:production
```

This will verify:
- ✅ Environment variables
- ✅ Database connection and migrations
- ✅ YouTube video IDs
- ✅ External services (Cloudinary, Resend)
- ✅ Security configuration
- ✅ Content completeness

## Pre-Deployment Checklist

### 1. Environment Variables

Verify all required environment variables are set:

```bash
cd backend
npm run validate:env
```

**Required Variables:**
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Strong secret (min 32 chars)
- `CORS_ORIGIN` - Frontend URL (must use HTTPS)
- `FRONTEND_URL` - Frontend URL (must use HTTPS)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `RESEND_API_KEY` - Resend API key (starts with `re_`)
- `YOUTUBE_API_KEY` - YouTube Data API key
- `GEMINI_API_KEY` - Google Gemini API key

**Optional (Recommended):**
- `SENTRY_DSN` - Error tracking (highly recommended)
- `REDIS_URL` - Redis connection string
- `COOKIE_DOMAIN` - Cookie domain for production

### 2. Database Setup

1. **Run Migrations:**
   ```bash
   cd backend
   npm run prisma:migrate deploy
   ```

2. **Seed Database:**
   ```bash
   npm run prisma:seed
   ```

3. **Verify Data:**
   ```bash
   npm run check-setup
   ```

### 3. YouTube Video Verification

Verify all YouTube video IDs are valid:

```bash
npm run verify:videos
```

This will:
- Check all video IDs in the database
- Validate they're accessible and embeddable
- Report any invalid videos

**Important:** Replace any placeholder video IDs with real YouTube video IDs before production.

### 4. Content Review

Verify all content is complete:

- [ ] All 7 courses have 12 lessons each
- [ ] Each lesson has activities
- [ ] All courses have final projects
- [ ] All courses have final exams
- [ ] All YouTube video IDs are valid
- [ ] All activities have content (not just placeholders)

### 5. Security Audit

Run security checks:

```bash
cd backend
npm run validate:env
```

Verify:
- [ ] JWT secrets are strong (not default values)
- [ ] CORS origin uses HTTPS
- [ ] All API keys are production keys (not development)
- [ ] No secrets in code or version control
- [ ] Rate limiting is enabled
- [ ] Security headers are configured (Helmet)

### 6. Testing

Run all tests:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

### 7. Performance

Check bundle sizes:

```bash
cd frontend
npm run build
npm run build:analyze
```

Verify:
- [ ] Main bundle < 500KB (gzipped)
- [ ] Vendor bundle < 300KB (gzipped)
- [ ] CSS bundle < 50KB (gzipped)

Run Lighthouse audit:
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

### 8. Legal & Compliance

- [ ] Privacy Policy is complete and reviewed
- [ ] Terms of Service is complete and reviewed
- [ ] Cookie consent banner is implemented (✅ Done)
- [ ] GDPR compliance verified (if applicable)
- [ ] CCPA compliance verified (if applicable)

### 9. Monitoring & Error Tracking

Set up monitoring:

- [ ] Sentry DSN configured
- [ ] Error tracking tested
- [ ] Uptime monitoring configured
- [ ] Analytics configured (GA4 or Plausible)
- [ ] Log aggregation set up

### 10. Deployment

Follow the deployment guide:

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Deploy frontend to Vercel
2. Deploy backend to Fly.io
3. Run database migrations
4. Configure environment variables
5. Test health endpoints
6. Verify cron jobs are running

## Production Readiness Scripts

### Check Production Readiness

```bash
npm run check:production
```

Comprehensive check of all production requirements.

### Verify YouTube Videos

```bash
npm run verify:videos
```

Validates all YouTube video IDs in the database.

### Validate Environment

```bash
cd backend
npm run validate:env
```

Validates all environment variables.

### Check Setup

```bash
cd backend
npm run check-setup
```

Checks database connection and basic setup.

## Common Issues

### Invalid YouTube Video IDs

If `verify:videos` reports invalid videos:

1. Check the video IDs in the database
2. Replace placeholder IDs with real YouTube video IDs
3. Use the admin panel to validate videos before saving

### Missing Environment Variables

If environment validation fails:

1. Check `.env` file exists
2. Copy from `.env.example` if needed
3. Fill in all required values
4. Ensure no default/placeholder values remain

### Database Connection Issues

If database checks fail:

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` is correct
3. Ensure database exists
4. Run migrations: `npm run prisma:migrate deploy`

### Security Warnings

If security checks fail:

1. Generate strong JWT secrets (use `node scripts/generate-secrets.js`)
2. Ensure CORS origin uses HTTPS
3. Verify all API keys are production keys
4. Check no secrets are in code

## Post-Deployment Verification

After deploying, verify:

1. **Health Check:**
   ```bash
   curl https://your-api-url.com/api/health
   ```

2. **Frontend Loads:**
   - Visit frontend URL
   - Check browser console for errors
   - Verify API calls succeed

3. **Authentication:**
   - Test registration
   - Test login
   - Test password reset

4. **Core Features:**
   - Course enrollment
   - Lesson viewing
   - Activity submission
   - Progress tracking

5. **Admin Panel:**
   - Admin login
   - Course management
   - User management

6. **Monitoring:**
   - Check Sentry for errors
   - Verify analytics tracking
   - Check uptime monitoring

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Review [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
3. Check error logs
4. Verify environment variables

## Next Steps

Once all checks pass:

1. ✅ Complete testing checklist
2. ✅ Review content quality
3. ✅ Set up monitoring
4. ✅ Configure backups
5. ✅ Plan launch strategy
6. ✅ Prepare support team

---

**Ready for Production?** Run `npm run check:production` to verify!

