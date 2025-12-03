# Deploy Frontend Now - Quick Guide

## ⚠️ First Time Setup

If you haven't logged into Vercel yet:

```powershell
vercel login
```

This will open your browser to authenticate with Vercel.

## 🚀 Deploy

After logging in, run:

```powershell
npm run deploy:frontend
```

## 📋 What Happens

1. ✅ Checks Vercel CLI is installed
2. ✅ Checks if logged in (prompts login if needed)
3. ✅ Links to Vercel project (first time only)
4. ✅ Builds frontend
5. ✅ Deploys to production

## ⚠️ CRITICAL: After Deployment

**Set environment variable in Vercel:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add: `VITE_API_BASE_URL=https://intel-academy-api.fly.dev/api`
5. Save and redeploy

## ✅ Verify

After deployment, test:

```powershell
# Get your Vercel URL from deployment output, then:
$env:FRONTEND_URL="https://your-project.vercel.app"
npm run test:smoke
```

---

**Ready?** Run `vercel login` first (if needed), then `npm run deploy:frontend`!

