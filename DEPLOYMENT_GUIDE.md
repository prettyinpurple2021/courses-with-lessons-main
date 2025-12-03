# Complete Deployment Guide

This guide walks you through deploying both frontend and backend, then running smoke tests.

## 🎯 Current Status

- ✅ **Backend:** Deployed and healthy on Fly.io
- ✅ **Database:** Content complete (videos updated, exams have questions)
- ✅ **Environment Variables:** All configured on Fly.io
- ⚠️ **Frontend:** Ready to deploy

## 📋 Step-by-Step Deployment

### Step 1: Deploy Frontend to Vercel

#### Option A: Using Deployment Script (Recommended)

```powershell
npm run deploy:frontend
```

This script will:
- Check for Vercel CLI
- Build the frontend
- Deploy to Vercel production

#### Option B: Manual Deployment

```powershell
cd frontend

# Install Vercel CLI if needed
npm install -g vercel

# Link to Vercel project (first time only)
vercel link

# Build
npm run build

# Deploy to production
vercel --prod
```

### Step 2: Set Frontend Environment Variables

**Critical:** After deploying, set the API URL in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   VITE_API_BASE_URL=https://intel-academy-api.fly.dev/api
   ```
5. Select **Production** environment
6. Click **Save**
7. **Redeploy** (or wait for next deployment)

### Step 3: Run Smoke Tests

#### Quick Smoke Tests (API Only)

```powershell
npm run test:smoke
```

This tests:
- Backend health
- Database connection
- Environment configuration
- Frontend accessibility
- Courses endpoint

#### Full E2E Tests (Requires Frontend URL)

```powershell
# Set frontend URL
$env:FRONTEND_URL="https://your-frontend.vercel.app"
npm run test:smoke

# Or run full Playwright tests
npm run test:e2e
```

## ✅ Verification Checklist

After deployment, verify:

### Backend ✅
- [x] Deployed to Fly.io
- [x] Health check passing
- [x] Environment variables set
- [x] Database connected

### Frontend ⚠️
- [ ] Deployed to Vercel
- [ ] Environment variable `VITE_API_BASE_URL` set
- [ ] Can access frontend URL
- [ ] Can connect to backend API

### Testing ⚠️
- [ ] Smoke tests passing
- [ ] User registration works
- [ ] User login works
- [ ] Course access works
- [ ] Video playback works

## 🚀 Quick Commands

```powershell
# Deploy frontend
npm run deploy:frontend

# Run smoke tests
npm run test:smoke

# Run full E2E tests
npm run test:e2e

# Check production status
npm run check:production
npm run verify:content
npm run report:production
```

## 🔍 Troubleshooting

### Frontend Can't Connect to Backend

**Symptoms:** CORS errors, API calls failing

**Solution:**
1. Verify `VITE_API_BASE_URL` is set in Vercel
2. Verify `CORS_ORIGIN` in Fly.io matches your frontend URL
3. Redeploy frontend after setting environment variables

### Build Fails

**Solution:**
```powershell
cd frontend
npm install
npm run build
```

### Deployment Fails

**Solution:**
- Check Vercel logs in dashboard
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run type-check`

## 📊 Post-Deployment

After successful deployment:

1. **Monitor logs:**
   ```powershell
   fly logs -a intel-academy-api
   ```

2. **Test critical flows:**
   - User registration
   - User login
   - Course enrollment
   - Video playback
   - Exam taking

3. **Set up monitoring:**
   - Configure Sentry (if available)
   - Set up uptime monitoring
   - Configure error alerts

---

**Ready to deploy?** Run `npm run deploy:frontend` to get started!

