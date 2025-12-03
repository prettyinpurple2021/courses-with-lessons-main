# Complete Next Steps - Frontend Deployment & Testing

## ✅ What's Done

- ✅ Backend deployed and healthy on Fly.io
- ✅ Database content complete
- ✅ Environment variables configured
- ✅ Backend smoke tests passing
- ✅ Vercel CLI installed

## 🚀 Next Steps

### Step 1: Deploy Frontend to Vercel

**Run this command:**
```powershell
npm run deploy:frontend
```

**OR manually:**
```powershell
cd frontend

# First time: Link to Vercel project
vercel link

# Build and deploy
npm run build
vercel --prod
```

### Step 2: Set Environment Variable

**After deployment, set in Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `VITE_API_BASE_URL=https://intel-academy-api.fly.dev/api`
5. Save and redeploy

### Step 3: Run Smoke Tests

**After frontend is deployed:**
```powershell
# Set your frontend URL
$env:FRONTEND_URL="https://your-project.vercel.app"

# Run smoke tests
npm run test:smoke
```

### Step 4: Run Full E2E Tests (Optional)

```powershell
# Set frontend URL for Playwright
$env:FRONTEND_URL="https://your-project.vercel.app"

# Run E2E tests
npm run test:e2e
```

## 📋 Quick Reference

### Deployment Commands
```powershell
# Deploy frontend
npm run deploy:frontend

# Run smoke tests
npm run test:smoke

# Run full E2E tests
npm run test:e2e
```

### Verification Commands
```powershell
# Check backend health
Invoke-WebRequest -Uri "https://intel-academy-api.fly.dev/api/health"

# Check production readiness
npm run check:production
npm run verify:content
npm run report:production
```

## 🎯 Expected Results

After completing all steps:

- ✅ Frontend deployed to Vercel
- ✅ Frontend accessible at Vercel URL
- ✅ Frontend connects to backend API
- ✅ Smoke tests passing
- ✅ Ready for production use

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md)** - Frontend-specific deployment
- **[SMOKE_TEST_RESULTS.md](./SMOKE_TEST_RESULTS.md)** - Current test results

---

**Ready to deploy?** Run `npm run deploy:frontend` now!

