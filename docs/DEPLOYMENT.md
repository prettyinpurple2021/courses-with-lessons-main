# Deployment Guide

Complete guide for deploying SoloSuccess Intel Academy to production.

## Current Production Architecture

- **Frontend**: Vercel (React/Vite app)
- **Backend API**: Fly.io (Express with Docker)
- **Database**: PostgreSQL (Fly.io add-on)
- **Cache**: Redis (Fly.io add-on)
- **Cron Jobs**: GitHub Actions (free, unlimited)

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ database
- Redis 7+ instance
- Cloudinary account for file uploads
- GitHub account for CI/CD
- Fly.io account (free tier available)
- Vercel account (free tier available)

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

Replace `your-backend-api-url.com` with your actual Fly.io backend URL (e.g., `https://intel-academy-api.fly.dev`).

### Deploy

- Push to `main` branch → auto-deploys
- Or manually trigger from Vercel dashboard

---

## Step 2: Deploy Backend to Fly.io

### 1. Install Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
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
- App name: `your-app-name-api` (e.g., `intel-academy-api`)
- Region: Choose closest to you
- PostgreSQL: Yes (creates free database)
- Redis: Yes (creates free Redis)

### 4. Set Environment Variables

Set these using `flyctl secrets set`:

#### Critical (Required Before First Deploy)

```powershell
# Authentication secrets (generate secure random strings!)
flyctl secrets set JWT_SECRET="your-64-char-secret" --app intel-academy-api
flyctl secrets set JWT_REFRESH_SECRET="your-64-char-secret" --app intel-academy-api
flyctl secrets set CRON_SECRET="your-secret" --app intel-academy-api

# CORS & Frontend (set after Vercel deployment)
flyctl secrets set CORS_ORIGIN="https://your-frontend.vercel.app" --app intel-academy-api
flyctl secrets set FRONTEND_URL="https://your-frontend.vercel.app" --app intel-academy-api
```

#### File Storage (Cloudinary)

```powershell
flyctl secrets set CLOUDINARY_CLOUD_NAME="your-cloud-name" --app intel-academy-api
flyctl secrets set CLOUDINARY_API_KEY="your-api-key" --app intel-academy-api
flyctl secrets set CLOUDINARY_API_SECRET="your-api-secret" --app intel-academy-api
```

#### Email Service (Resend)

```powershell
flyctl secrets set RESEND_API_KEY="re_..." --app intel-academy-api
```

#### YouTube API

```powershell
flyctl secrets set YOUTUBE_API_KEY="your-youtube-api-key" --app intel-academy-api
```

#### Google AI (Gemini)

```powershell
flyctl secrets set GOOGLE_AI_API_KEY="your-google-ai-key" --app intel-academy-api
```

#### Optional (Monitoring)

```powershell
# Add your preferred monitoring solution here
```

**Note:** `DATABASE_URL` and `REDIS_URL` are automatically set when you attach PostgreSQL and Redis add-ons.

### 5. Deploy

```powershell
cd backend
flyctl deploy
```

### 6. Run Database Migrations

```powershell
flyctl ssh console -C "npm run prisma:migrate deploy"
```

### 7. Get Your API URL

```powershell
flyctl status
# Your API will be at: https://your-app-name-api.fly.dev
```

---

## Step 3: Set Up GitHub Actions for Cron Jobs

### Add Secrets to GitHub

Go to your repo → Settings → Secrets and variables → Actions

Add:
- `API_URL`: Your backend API URL (e.g., `https://intel-academy-api.fly.dev`)
- `CRON_SECRET`: Your `CRON_SECRET` from backend (same value used in Fly.io)

### Cron Job Workflows

Three separate workflow files are already created:
- `.github/workflows/cron-process-webhooks.yml` - Runs every minute
- `.github/workflows/cron-sync-intel-academy.yml` - Runs daily at 2 AM UTC
- `.github/workflows/cron-cleanup-webhooks.yml` - Runs daily at 3 AM UTC

These will automatically run once you:
1. Push them to GitHub
2. Add the secrets above
3. You can manually trigger any job from the Actions tab

---

## Step 4: Environment Variables Checklist

### Backend (Fly.io)

All set via `flyctl secrets set`:

```
NODE_ENV=production (set in fly.toml)
PORT=5000 (auto-set by Fly.io)
DATABASE_URL=postgresql://... (auto-set by Fly.io)
REDIS_URL=redis://... (auto-set by Fly.io)
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
CRON_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
YOUTUBE_API_KEY=...
GOOGLE_AI_API_KEY=...
```

### Frontend (Vercel)

```
VITE_API_BASE_URL=https://your-backend-api-url.com/api
```

---

## Testing Your Deployment

### Frontend

1. Visit your Vercel URL
2. Check browser console for API calls
3. Test login/registration
4. Verify no CORS errors

### Backend

```bash
curl https://your-api-url.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Cron Jobs

1. Go to GitHub → Actions tab
2. You should see the three cron job workflows
3. Click "Run workflow" to test manually
4. Check backend logs for successful execution

---

## Cost Breakdown

### Free Tier (Current Setup)

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

- Check `VITE_API_BASE_URL` in Vercel matches your Fly.io URL
- Check `CORS_ORIGIN` in Fly.io secrets matches your Vercel URL
- Ensure backend is running: `flyctl status`
- Check backend logs: `flyctl logs`

### Cron jobs not running

- Check GitHub Actions tab for workflow runs
- Verify `API_URL` and `CRON_SECRET` secrets are set correctly
- Check backend logs for cron endpoint calls: `flyctl logs | grep cron`
- Test manually: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-api.fly.dev/api/cron/process-webhooks`

### Database connection issues

- Verify `DATABASE_URL` is set: `flyctl secrets list`
- Run migrations: `flyctl ssh console -C "npm run prisma:migrate deploy"`
- Check database status: `flyctl postgres status`

### Backend machine stopped

Fly.io free tier machines stop after inactivity. They auto-start on first request (may take 10-30 seconds).

To keep machine running:
```powershell
flyctl scale count 1 --app intel-academy-api
```

---

## Monitoring

### Health Checks

**Backend:**
```bash
curl https://your-api.fly.dev/api/health
```

**Frontend:**
- Visit your Vercel URL
- Check browser console for errors

### Logs

**Backend logs:**
```powershell
flyctl logs --app intel-academy-api
```

**Frontend logs:**
- Check Vercel dashboard → Deployments → View Function Logs

---

## Backup Strategy

### Database Backups

Fly.io PostgreSQL includes automatic daily backups. To restore:

```powershell
flyctl postgres backup list --app intel-academy-db
flyctl postgres backup restore <backup-id>
```

### Manual Backup

```bash
flyctl ssh console -C "pg_dump $DATABASE_URL > backup.sql"
```

---

## Support

- [Vercel Docs](https://vercel.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

