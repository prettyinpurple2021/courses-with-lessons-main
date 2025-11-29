# Vercel Deployment Guide

## Recommended Production Setup

### Architecture
- **Frontend**: Vercel (React/Vite app)
- **Backend API**: Deploy Express backend with Docker (see options below)
- **Cron Jobs**: GitHub Actions (free, unlimited)

---

## Step 1: Deploy Frontend to Vercel

### Quick Setup
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_API_BASE_URL=https://your-backend-api-url.com/api
```

### Deploy
- Push to `main` branch → auto-deploys
- Or manually trigger from Vercel dashboard

---

## Step 2: Deploy Backend API

You have **3 options** for deploying your Express backend:

### Option A: Fly.io (Recommended - Free Tier, Docker Support)
**Best for**: Full Express apps with Prisma, Redis, etc.

1. Install Fly CLI: `npm i -g @fly/cli`
2. Login: `fly auth login`
3. Initialize: `cd backend && fly launch`
4. Deploy: `fly deploy`

**Pros**: 
- Free tier (3 shared VMs)
- Full Docker support
- Easy PostgreSQL/Redis add-ons
- Global edge network

**Cons**: 
- Need to set up Fly.io account

### Option B: Render (Free Tier, Docker Support)
**Best for**: Simple Docker deployments

1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Environment**: Docker

**Pros**: 
- Free tier available
- Docker support
- Auto-deploys from Git

**Cons**: 
- Free tier spins down after inactivity

### Option C: Railway (Easiest, Paid)
**Best for**: Zero-config deployments

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `backend` directory
4. Railway auto-detects Dockerfile

**Pros**: 
- Easiest setup
- Auto-detects everything

**Cons**: 
- $5/month minimum (no free tier)

---

## Step 3: Set Up GitHub Actions for Cron Jobs

### Add Secrets to GitHub
Go to your repo → Settings → Secrets and variables → Actions

Add:
- `API_URL`: Your backend API URL (e.g., `https://your-api.fly.dev`)
- `CRON_SECRET`: Your `CRON_SECRET` from backend `.env`

### The workflows are already created
Three separate workflow files are ready:
- `.github/workflows/cron-process-webhooks.yml` - Runs every minute
- `.github/workflows/cron-sync-intel-academy.yml` - Runs daily at 2 AM UTC
- `.github/workflows/cron-cleanup-webhooks.yml` - Runs daily at 3 AM UTC

Just:
1. Push them to GitHub
2. GitHub Actions will automatically run all 3 cron jobs
3. You can manually trigger any job from the Actions tab

---

## Step 4: Environment Variables Checklist

### Backend (wherever you deploy it)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
CRON_SECRET=your-secret-here
# ... all other backend env vars
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://your-backend-api-url.com/api
```

---

## Recommended: Fly.io Setup (Step-by-Step)

### 1. Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Login
```bash
fly auth login
```

### 3. Initialize Backend
```bash
cd backend
fly launch
```

When prompted:
- App name: `your-app-name-api`
- Region: Choose closest to you
- PostgreSQL: Yes (creates free database)
- Redis: Yes (creates free Redis)

### 4. Add Environment Variables
```bash
fly secrets set NODE_ENV=production
fly secrets set JWT_SECRET=your-secret
fly secrets set JWT_REFRESH_SECRET=your-secret
# ... add all your env vars
```

Or use the dashboard: https://fly.io/dashboard

### 5. Deploy
```bash
fly deploy
```

### 6. Get Your API URL
```bash
fly status
# Your app will be at: https://your-app-name-api.fly.dev
```

---

## Testing Your Deployment

### Frontend
1. Visit your Vercel URL
2. Check browser console for API calls
3. Test login/registration

### Backend
```bash
curl https://your-api-url.com/api/health
```

### Cron Jobs
1. Go to GitHub → Actions tab
2. You should see "Cron Jobs" workflow
3. Click "Run workflow" to test manually

---

## Cost Breakdown

### Free Tier (Recommended)
- **Vercel**: Free (generous limits)
- **Fly.io**: Free (3 shared VMs, 3GB storage)
- **GitHub Actions**: Free (2000 minutes/month)
- **Total**: $0/month

### Paid Tier (If Needed)
- **Vercel Pro**: $20/month (if you exceed free limits)
- **Fly.io**: ~$5-10/month (if you need more resources)
- **Total**: ~$25-30/month

---

## Troubleshooting

### Frontend can't reach backend
- Check `VITE_API_BASE_URL` in Vercel
- Check `CORS_ORIGIN` in backend env vars
- Ensure backend is running and accessible

### Cron jobs not running
- Check GitHub Actions tab
- Verify `API_URL` and `CRON_SECRET` secrets are set
- Check backend logs for cron endpoint calls

### Database connection issues
- Verify `DATABASE_URL` is correct
- Run migrations: `fly ssh console -C "npm run prisma:migrate deploy"`

---

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Fly.io (or Render/Railway)
3. ✅ Set up GitHub Actions cron jobs
4. ✅ Test everything
5. ✅ Monitor logs and errors

---

## Support

- [Vercel Docs](https://vercel.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

