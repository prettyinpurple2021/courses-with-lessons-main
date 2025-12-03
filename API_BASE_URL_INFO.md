# API Base URL Information

## 🔗 Your API Base URL

**Your backend API is deployed at:**
```
https://intel-academy-api.fly.dev/api
```

## 📍 Where to Find It

### Option 1: From Your Backend Deployment
Your backend is deployed on Fly.io at:
- **Base URL:** `https://intel-academy-api.fly.dev`
- **API Endpoint:** `https://intel-academy-api.fly.dev/api`

### Option 2: Check Fly.io Dashboard
1. Go to https://fly.io/dashboard
2. Select your app: **intel-academy-api**
3. The URL is shown in the app overview

### Option 3: Test It
You can verify it's working:
```powershell
Invoke-WebRequest -Uri "https://intel-academy-api.fly.dev/api/health"
```

## ⚙️ How to Use It

### For Vercel Environment Variable

Set this in Vercel:
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://intel-academy-api.fly.dev/api`

### Why `/api` at the end?

Your backend routes are prefixed with `/api`, so:
- ✅ Correct: `https://intel-academy-api.fly.dev/api`
- ❌ Wrong: `https://intel-academy-api.fly.dev` (missing `/api`)

## 🔍 Verify It's Working

After setting in Vercel, test:

```powershell
# Test backend health
Invoke-WebRequest -Uri "https://intel-academy-api.fly.dev/api/health"

# Or run smoke tests
npm run test:smoke
```

## 📝 Quick Reference

| Environment | API Base URL |
|-------------|--------------|
| **Production** | `https://intel-academy-api.fly.dev/api` |
| **Local Development** | `http://localhost:5000/api` |

---

**Your API Base URL:** `https://intel-academy-api.fly.dev/api`

