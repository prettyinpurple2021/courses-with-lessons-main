# Frontend Deployment Guide

## Quick Start

### Step 1: Install Vercel CLI (if not installed)

```powershell
npm install -g vercel
```

### Step 2: Deploy Frontend

**Option A: Use the deployment script**
```powershell
npm run deploy:frontend
```

**Option B: Manual deployment**
```powershell
cd frontend

# Link to Vercel (first time only)
vercel link

# Build
npm run build

# Deploy
vercel --prod
```

### Step 3: Set Environment Variable in Vercel

**Critical:** After deployment, you MUST set the API URL:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://intel-academy-api.fly.dev/api`
   - **Environment:** Production (and Preview if you want)
6. Click **Save**
7. **Redeploy** your project (or wait for next deployment)

### Step 4: Verify Deployment

After deployment, test your frontend:

```powershell
# Run smoke tests with your frontend URL
$env:FRONTEND_URL="https://your-project.vercel.app"
npm run test:smoke
```

## 📋 Deployment Checklist

- [ ] Vercel CLI installed
- [ ] Frontend built successfully (`npm run build`)
- [ ] Deployed to Vercel (`vercel --prod`)
- [ ] `VITE_API_BASE_URL` set in Vercel environment variables
- [ ] Frontend accessible at Vercel URL
- [ ] Can connect to backend API
- [ ] Smoke tests passing

## 🔍 Troubleshooting

### "vercel: command not found"
**Solution:** Install Vercel CLI: `npm install -g vercel`

### Build fails
**Solution:** 
```powershell
cd frontend
npm install
npm run build
```

### Frontend can't connect to backend
**Solution:**
1. Verify `VITE_API_BASE_URL` is set in Vercel
2. Verify `CORS_ORIGIN` in Fly.io matches your Vercel URL
3. Redeploy frontend after setting environment variables

### CORS errors
**Solution:** Make sure `CORS_ORIGIN` in Fly.io includes your Vercel domain

---

**Ready?** Run `npm run deploy:frontend` to get started!

