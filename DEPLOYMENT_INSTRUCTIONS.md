# Deployment Instructions

## ✅ Setup Complete

- ✅ Vercel CLI installed (v48.12.1)
- ✅ Frontend builds successfully
- ✅ Backend deployed and healthy

## 🚀 Deploy Frontend Now

### Quick Deploy (Recommended)

Run this command from the **root directory**:

```powershell
npm run deploy:frontend
```

This will:
1. Navigate to frontend directory
2. Check if linked to Vercel (link if needed)
3. Build the frontend
4. Deploy to Vercel production

### Manual Deploy

If you prefer manual steps:

```powershell
cd frontend

# Step 1: Link to Vercel (first time only)
vercel link
# Follow prompts to select/create project

# Step 2: Build
npm run build

# Step 3: Deploy
vercel --prod
```

## ⚠️ CRITICAL: Set Environment Variable

**After deployment, you MUST set this in Vercel:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://intel-academy-api.fly.dev/api`
   - **Environments:** Production ✅
6. Click **Save**
7. **Redeploy** (or wait for auto-deploy)

## ✅ Verify Deployment

After deployment:

1. **Get your Vercel URL** (shown after deployment)
2. **Test smoke tests:**
   ```powershell
   $env:FRONTEND_URL="https://your-project.vercel.app"
   npm run test:smoke
   ```

## 📊 Current Status

| Component | Status |
|-----------|--------|
| Backend | ✅ Deployed & Healthy |
| Database | ✅ Content Complete |
| Environment | ✅ Configured |
| Frontend Build | ✅ Ready |
| Frontend Deploy | ⚠️ **NEXT STEP** |
| Smoke Tests | ⚠️ After deployment |

---

**Ready?** Run `npm run deploy:frontend` to deploy your frontend!

