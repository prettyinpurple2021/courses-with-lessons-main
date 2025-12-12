# Troubleshooting Guide

Common issues and solutions for production deployment.

## Deployment Issues

### Frontend Can't Connect to Backend

**Symptoms:** CORS errors, API calls failing

**Solution:**
1. Verify `VITE_API_BASE_URL` is set in Vercel
2. Verify `CORS_ORIGIN` in Fly.io matches your frontend URL
3. Redeploy frontend after setting environment variables

### Build Fails

**Solution:**
```bash
cd frontend
npm install
npm run build
```

### Database Connection Failed

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database firewall rules
- Ensure database is accessible from Fly.io
- Test connection: `psql $DATABASE_URL`

### CORS Errors

**Solution:** 
- Make sure `CORS_ORIGIN` in Fly.io includes your Vercel domain
- Ensure URLs use HTTPS (not HTTP)
- Check that CORS_ORIGIN matches your frontend URL exactly

## Content Issues

### Placeholder Videos Showing

**Solution:** 
```bash
npm run content:update-videos
```

### Empty Exams

**Solution:** 
```bash
npm run content:add-exam-questions
```

### Content Verification Fails

**Solution:**
```bash
# Verify content
npm run verify:content

# Check specific issues
npm run verify:videos
```

## Environment Variable Issues

### "Invalid value" errors

- **NODE_ENV**: Must be exactly `production` (lowercase)
- **CORS_ORIGIN/FRONTEND_URL**: Must start with `https://` and not contain `localhost`
- **JWT_SECRET**: Must be at least 32 characters and not contain "change-this"

### Missing Environment Variables

**Solution:**
1. Check `.env` file exists
2. Copy from `.env.example` if needed
3. Fill in all required values
4. Ensure no default/placeholder values remain
5. Verify in hosting platform (Vercel/Fly.io)

## Database Issues

### Prisma Client Errors

**Solution:**
```bash
cd backend
rm -rf node_modules/.cache/prisma
npm run prisma:generate
npm run prisma:migrate:deploy
```

### Migration Fails

**Solution:**
```bash
# Check migration status
npm run prisma:migrate status --workspace=backend

# Reset if needed (WARNING: deletes data)
npm run prisma:migrate reset --workspace=backend
```

### Connection Timeout

**Solution:**
- Check database is running
- Verify firewall rules allow connections
- Check connection string format
- Ensure database is accessible from Fly.io

## API Key Issues

### API Key Invalid

**Solution:**
- Verify API keys are active
- Check API quotas/limits
- Ensure correct API is enabled (e.g., YouTube Data API v3)
- Regenerate keys if needed

## Performance Issues

### Slow Page Loads

**Solution:**
- Check bundle sizes
- Enable compression
- Optimize images
- Check CDN configuration
- Review database queries

### High Database Load

**Solution:**
- Enable Redis caching
- Optimize queries
- Add database indexes
- Review query patterns

## Security Issues

### Security Warnings

**Solution:**
1. Generate strong JWT secrets: `openssl rand -base64 32`
2. Ensure CORS origin uses HTTPS
3. Verify all API keys are production keys
4. Check no secrets are in code
5. Review security headers

## Monitoring Issues

### Health Check Fails

**Solution:**
```bash
# Check health endpoint
curl https://intel-academy-api.fly.dev/api/health

# View logs
fly logs -a intel-academy-api

# Check status
fly status -a intel-academy-api
```

### Logs Not Showing

**Solution:**
- Check Fly.io dashboard
- Verify logging is enabled
- Check log retention settings
- Review application logs

## Getting Help

If you encounter issues not covered here:

1. Check [Readiness Guide](Readiness-Guide.md)
2. Review [Deployment Guide](Deployment.md)
3. Check error logs in Sentry (if configured)
4. Verify environment variables: `npm run check:production`
5. Review production readiness report: `npm run report:production`

---

**← [Back to Wiki Home](Home.md)** | **[Deployment Guide](Deployment.md)** | **[Status](Status.md)**

