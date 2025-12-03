# Environment Variable Troubleshooting

## 🔴 Current Issue

Frontend is still connecting to `http://localhost:5000/api` instead of `https://intel-academy-api.fly.dev/api`.

## 🔍 Why This Happens

Vite environment variables are **baked into the build** at build time. If you:
1. Set the environment variable AFTER building
2. Set it but don't redeploy
3. Set it for wrong environment (Preview instead of Production)

The variable won't be available in the deployed app.

## ✅ Solution Steps

### Step 1: Verify Variable is Set Correctly

Check in Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Find `VITE_API_BASE_URL`
3. Verify:
   - **Key:** `VITE_API_BASE_URL` (exact match, case-sensitive)
   - **Value:** `https://intel-academy-api.fly.dev/api` (with `/api` at end)
   - **Environments:** Must have **Production** ✅ checked

### Step 2: Redeploy After Setting Variable

**Critical:** After setting/changing environment variables, you MUST redeploy:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Option B: Via CLI**
```powershell
cd frontend
vercel --prod
```

### Step 3: Hard Refresh Browser

After redeployment:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache
3. This ensures you're not seeing cached JavaScript

### Step 4: Verify It's Working

Check browser console (F12):
- ✅ Should see requests to `https://intel-academy-api.fly.dev/api`
- ❌ Should NOT see requests to `http://localhost:5000/api`

## 🧪 Quick Test

After redeploying, check the built JavaScript:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try registering again
4. Look for the registration request
5. Check the **Request URL** - should be `https://intel-academy-api.fly.dev/api/auth/register`

## 📝 Important Notes

- **Vite variables** start with `VITE_` prefix ✅
- **Build-time only** - must be set before building
- **Case-sensitive** - `VITE_API_BASE_URL` not `vite_api_base_url`
- **Redeploy required** - changes don't apply to existing deployments

---

**If still not working after redeploy:** Check Vercel build logs to see if the variable was available during build.

