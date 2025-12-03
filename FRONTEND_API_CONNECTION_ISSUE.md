# Frontend API Connection Issue

## 🔴 Issue Identified

The frontend is trying to connect to `http://localhost:5000/api` instead of the production API `https://intel-academy-api.fly.dev/api`.

**Error Messages:**
```
ERR_CONNECTION_REFUSED @ http://localhost:5000/api/auth/register
ERR_CONNECTION_REFUSED @ http://localhost:5000/api/analytics/performance
```

## 🔍 Root Cause

The `VITE_API_BASE_URL` environment variable is either:
1. Not set correctly in Vercel
2. Set but frontend wasn't redeployed after setting it
3. Set for wrong environment (Preview instead of Production)

## ✅ Solution

### Step 1: Verify Environment Variable in Vercel

1. Go to https://vercel.com/dashboard
2. Select project: **solosupport-ai/frontend**
3. Go to **Settings** → **Environment Variables**
4. Verify `VITE_API_BASE_URL` is set to: `https://intel-academy-api.fly.dev/api`
5. Make sure it's enabled for **Production** environment ✅

### Step 2: Redeploy Frontend

**Option A: Redeploy via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Option B: Redeploy via CLI**
```powershell
cd frontend
vercel --prod
```

### Step 3: Verify After Redeployment

After redeployment, check browser console:
- ✅ Should see requests to `https://intel-academy-api.fly.dev/api`
- ❌ Should NOT see requests to `http://localhost:5000/api`

## 🧪 Test Again

After redeploying, try registration again:
1. Navigate to registration page
2. Fill in the form
3. Submit registration
4. Should successfully create account and redirect to dashboard

---

**Status:** Frontend needs to be redeployed after setting environment variable.

