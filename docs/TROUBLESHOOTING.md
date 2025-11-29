# Troubleshooting Guide

Common issues and solutions for SoloSuccess Intel Academy.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Issues](#database-issues)
3. [Authentication Issues](#authentication-issues)
4. [Video Playback Issues](#video-playback-issues)
5. [Progress Tracking Issues](#progress-tracking-issues)
6. [Performance Issues](#performance-issues)
7. [Deployment Issues](#deployment-issues)

## Installation Issues

### npm install fails

**Problem**: Dependencies fail to install

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Reinstall
npm install
```

### Node version mismatch

**Problem**: "Unsupported engine" error

**Solution**:
```bash
# Check Node version
node --version

# Should be >= 18.0.0
# Install correct version using nvm
nvm install 18
nvm use 18
```

### Port already in use

**Problem**: "Port 3000/5000 already in use"

**Solutions**:
```bash
# Find process using port (Mac/Linux)
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
# Frontend: VITE_PORT=3001
# Backend: PORT=5001
```

## Database Issues

### Connection refused

**Problem**: "Connection refused" or "ECONNREFUSED"

**Solutions**:

1. Check PostgreSQL is running:
```bash
# Mac
brew services list

# Linux
sudo systemctl status postgresql

# Start if not running
brew services start postgresql  # Mac
sudo systemctl start postgresql # Linux
```

2. Verify DATABASE_URL in backend/.env:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Test connection:
```bash
psql -U user -d dbname
```

### Migration fails

**Problem**: Prisma migration errors

**Solutions**:

1. Reset database (WARNING: deletes all data):
```bash
cd backend
npm run prisma:reset
```

2. Generate Prisma Client:
```bash
npm run prisma:generate
```

3. Run migrations manually:
```bash
npm run prisma:migrate
```

### Seed fails

**Problem**: Database seeding errors

**Solutions**:

1. Check database is empty:
```bash
npm run prisma:studio
```

2. Reset and reseed:
```bash
npm run prisma:reset
npm run prisma:seed
```

3. Check seed script logs for specific errors

## Authentication Issues

### JWT token invalid

**Problem**: "Invalid token" or "Token expired"

**Solutions**:

1. Clear browser cookies and localStorage
2. Logout and login again
3. Check JWT_SECRET in backend/.env matches
4. Verify token expiration times are reasonable

### Cannot login

**Problem**: Login fails with correct credentials

**Solutions**:

1. Check user exists in database:
```sql
SELECT * FROM "User" WHERE email = 'user@example.com';
```

2. Reset password:
```bash
# Use forgot password flow
# Or update directly in database (hash password first)
```

3. Check backend logs for errors:
```bash
cd backend
npm run dev
# Watch console for errors
```

### CORS errors

**Problem**: "CORS policy" errors in browser console

**Solutions**:

1. Check CORS_ORIGIN in backend/.env:
```env
CORS_ORIGIN=http://localhost:3000
```

2. For multiple origins:
```env
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

3. Restart backend server after changes

## Video Playback Issues

### YouTube video not loading

**Problem**: Video player shows error or blank screen

**Solutions**:

1. Check video ID is correct (not full URL)
2. Verify video is public or unlisted (not private)
3. Test video directly on YouTube
4. Check browser console for errors
5. Try different browser
6. Disable ad blockers

### Video progress not saving

**Problem**: Resume position not working

**Solutions**:

1. Check authentication token is valid
2. Verify API endpoint is responding:
```bash
curl -X PUT http://localhost:5000/api/lessons/:id/progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"position": 120}'
```

3. Check backend logs for errors
4. Verify database connection

### YouTube API quota exceeded

**Problem**: "Quota exceeded" error

**Solutions**:

1. Check quota usage in Google Cloud Console
2. Request quota increase
3. Implement caching for video metadata
4. Use alternative validation method temporarily

## Progress Tracking Issues

### Course not unlocking

**Problem**: Next course remains locked after completion

**Solutions**:

1. Verify all requirements met:
   - All 12 lessons completed
   - Final project submitted
   - Final exam passed

2. Check database:
```sql
SELECT * FROM "Enrollment" WHERE "userId" = '<user_id>';
SELECT * FROM "FinalExamResult" WHERE "userId" = '<user_id>';
```

3. Manually unlock if needed (admin only):
```sql
UPDATE "Enrollment" 
SET "unlockedCourses" = 2 
WHERE "userId" = '<user_id>';
```

### Activity not unlocking

**Problem**: Next activity stays locked

**Solutions**:

1. Verify previous activity is completed:
```sql
SELECT * FROM "ActivitySubmission" 
WHERE "userId" = '<user_id>' 
AND "activityId" = '<activity_id>';
```

2. Check activity sequence numbers are correct
3. Refresh page
4. Clear browser cache

### Progress not syncing

**Problem**: Progress different on different devices

**Solutions**:

1. Ensure logged in with same account
2. Check internet connection
3. Wait for sync (may take a few seconds)
4. Force refresh (Ctrl+Shift+R)
5. Check backend logs for sync errors

## Performance Issues

### Slow page load

**Problem**: Pages take long to load

**Solutions**:

1. Check network tab in browser DevTools
2. Optimize images (use WebP format)
3. Enable caching:
```bash
# Check Redis is running
redis-cli ping
```

4. Check database query performance:
```bash
cd backend
npm run prisma:studio
# Review slow queries
```

5. Build for production:
```bash
npm run build
```

### High memory usage

**Problem**: Application uses too much memory

**Solutions**:

1. Check for memory leaks in browser DevTools
2. Limit concurrent API requests
3. Implement pagination for large lists
4. Optimize database queries
5. Increase server resources

### Slow video loading

**Problem**: Videos buffer frequently

**Solutions**:

1. Check internet connection speed
2. Lower video quality in YouTube player
3. Use CDN for static assets
4. Check server bandwidth
5. Consider video compression

## Deployment Issues

### Build fails

**Problem**: Production build errors

**Solutions**:

1. Check all environment variables are set
2. Run build locally first:
```bash
npm run build
```

3. Check for TypeScript errors:
```bash
npm run lint
```

4. Verify all dependencies are installed:
```bash
npm ci
```

### Database migration fails in production

**Problem**: Migrations don't run on deployed database

**Solutions**:

1. Run migrations manually:
```bash
npm run prisma:migrate deploy
```

2. Check database connection string
3. Verify database user has correct permissions
4. Check migration history:
```bash
npm run prisma:migrate status
```

### Environment variables not loading

**Problem**: App can't find environment variables

**Solutions**:

1. Verify .env files exist and are not in .gitignore
2. Check hosting platform environment variables
3. Restart application after changes
4. Use platform-specific env var syntax

### SSL/HTTPS issues

**Problem**: Mixed content or SSL errors

**Solutions**:

1. Ensure all API calls use HTTPS in production
2. Update VITE_API_BASE_URL to use https://
3. Check SSL certificate is valid
4. Enable HSTS headers
5. Update CORS settings for HTTPS

## Getting Help

If you can't resolve an issue:

1. **Check Logs**:
   - Browser console (F12)
   - Backend logs (terminal)
   - Database logs

2. **Search Documentation**:
   - README.md
   - API_DOCUMENTATION.md
   - USER_GUIDE.md
   - ADMIN_GUIDE.md

3. **Contact Support**:
   - Email: support@solosuccess.com
   - Include error messages and logs
   - Describe steps to reproduce

4. **Community**:
   - Check discussion forums
   - Ask other developers
   - Search for similar issues

## Useful Commands

### Check System Status
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check PostgreSQL
psql --version

# Check Redis
redis-cli ping

# Check ports in use
lsof -i :3000
lsof -i :5000
```

### Reset Everything
```bash
# WARNING: This deletes all data!

# Stop all processes
# Kill frontend and backend

# Reset database
cd backend
npm run prisma:reset

# Clear caches
npm cache clean --force
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules

# Reinstall
npm install

# Restart
npm run dev
```

### View Logs
```bash
# Backend logs
cd backend
npm run dev
# Watch terminal output

# Database logs (PostgreSQL)
tail -f /usr/local/var/log/postgres.log  # Mac
tail -f /var/log/postgresql/postgresql-14-main.log  # Linux

# Redis logs
redis-cli monitor
```

---

**Still having issues?** Contact technical support with:
- Error messages
- Steps to reproduce
- System information (OS, Node version, etc.)
- Screenshots if applicable
