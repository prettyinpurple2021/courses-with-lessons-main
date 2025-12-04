# Deployment Guide

Complete guide for deploying SoloSuccess Intel Academy to production.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Vercel CLI (for frontend): `npm install -g vercel`
- Fly.io CLI (for backend): `flyctl auth login`

### Quick Deploy (5 Steps)

1. **Configure Environment Variables** (see [Environment Setup](#environment-setup))
2. **Deploy Backend** to Fly.io
3. **Run Database Migrations**
4. **Set Up Production Content** (CRITICAL - see [Content Setup](#content-setup))
5. **Deploy Frontend** to Vercel

## Environment Setup

### Backend Environment Variables (Fly.io)

Set these using `fly secrets set`:

```bash
fly secrets set NODE_ENV=production
fly secrets set DATABASE_URL=postgresql://...
fly secrets set JWT_SECRET=your-secure-secret-min-32-chars
fly secrets set JWT_REFRESH_SECRET=your-secure-refresh-secret-min-32-chars
fly secrets set CORS_ORIGIN=https://yourdomain.com
fly secrets set FRONTEND_URL=https://yourdomain.com
fly secrets set CLOUDINARY_CLOUD_NAME=your-cloud-name
fly secrets set CLOUDINARY_API_KEY=your-api-key
fly secrets set CLOUDINARY_API_SECRET=your-api-secret
fly secrets set RESEND_API_KEY=re_your-api-key
fly secrets set YOUTUBE_API_KEY=your-youtube-api-key
fly secrets set GEMINI_API_KEY=your-gemini-api-key
fly secrets set REDIS_URL=redis://...  # Optional
fly secrets set CRON_SECRET=your-cron-secret  # Optional
```

**Important:**
- All URLs must use HTTPS (no localhost)
- JWT secrets must be at least 32 characters
- Generate secure secrets: `openssl rand -base64 32`

### Frontend Environment Variables (Vercel)

Set in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://intel-academy-api.fly.dev/api
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional
VITE_PLAUSIBLE_DOMAIN=yourdomain.com  # Optional
VITE_ANALYTICS_PROVIDER=ga4  # Optional: 'ga4', 'plausible', or 'none'
```

See [PRODUCTION_ENV_SETUP.md](./PRODUCTION_ENV_SETUP.md) for complete details.

## Backend Deployment (Fly.io)

### Step 1: Deploy Backend

```bash
cd backend
fly deploy
```

### Step 2: Run Database Migrations

```bash
npm run prisma:migrate:deploy --workspace=backend
```

If you get Prisma client errors:
```bash
cd backend
rm -rf node_modules/.cache/prisma
npm run prisma:generate
npm run prisma:migrate:deploy
```

### Step 3: Verify Backend Health

```bash
# Check health endpoint
curl https://intel-academy-api.fly.dev/api/health

# Or view logs
fly logs -a intel-academy-api
```

## Content Setup

**⚠️ CRITICAL:** This step is mandatory! Without it, your site will have placeholder videos and empty exams.

### Quick Setup (Recommended)

Run the all-in-one script:

```bash
npm run content:setup-production
```

This will:
- ✅ Seed database with courses and lesson structures
- ✅ Replace placeholder videos with real YouTube educational videos
- ✅ Add comprehensive exam questions (20 per course) to all 7 final exams

### Manual Setup (Alternative)

```bash
# Step 1: Seed database structure
npm run prisma:seed --workspace=backend

# Step 2: Update lesson videos (replaces placeholder videos)
npm run content:update-videos

# Step 3: Add exam questions to all final exams
npm run content:add-exam-questions
```

### Verify Content

```bash
npm run verify:content
```

## Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI (if needed)

```bash
npm install -g vercel
```

### Step 2: Deploy Frontend

**Option A: Use deployment script**
```bash
npm run deploy:frontend
```

**Option B: Manual deployment**
```bash
cd frontend

# Link to Vercel (first time only)
vercel link

# Build and deploy
npm run build
vercel --prod
```

### Step 3: Set Environment Variable

**CRITICAL:** After deployment, set in Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. **Settings** → **Environment Variables**
4. Add: `VITE_API_BASE_URL=https://intel-academy-api.fly.dev/api`
5. Select **Production** environment
6. Click **Save**
7. **Redeploy** (or wait for next deployment)

### Step 4: Verify Deployment

```bash
# Run smoke tests
$env:FRONTEND_URL="https://your-project.vercel.app"
npm run test:smoke
```

## Verification & Testing

### Production Readiness Check

```bash
# Check environment variables
npm run check:production

# Verify content completeness
npm run verify:content

# Generate production report
npm run report:production
```

### Smoke Tests

```bash
# Set frontend URL
$env:FRONTEND_URL="https://your-project.vercel.app"

# Run smoke tests
npm run test:smoke
```

### Full E2E Tests

```bash
npm run test:e2e
```

## Troubleshooting

### Frontend Can't Connect to Backend

**Symptoms:** CORS errors, API calls failing

**Solution:**
1. Verify `VITE_API_BASE_URL` is set in Vercel
2. Verify `CORS_ORIGIN` in Fly.io matches your frontend URL
3. Redeploy frontend after setting environment variables

### Build Fails

**Solution:**
```bash
cd frontend
npm install
npm run build
```

### Placeholder Videos Showing

**Solution:** Run `npm run content:update-videos`

### Empty Exams

**Solution:** Run `npm run content:add-exam-questions`

### Database Connection Failed

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database firewall rules
- Ensure database is accessible from Fly.io

### CORS Errors

**Solution:** Make sure `CORS_ORIGIN` in Fly.io includes your Vercel domain and uses HTTPS

## Post-Deployment Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Database content complete (videos updated, exams have questions)
- [ ] Smoke tests passing
- [ ] Frontend can connect to backend
- [ ] User registration works
- [ ] User login works
- [ ] Course access works
- [ ] Video playback works

## Monitoring

### View Logs

```bash
# Backend logs
fly logs -a intel-academy-api

# Check status
fly status -a intel-academy-api
```

### Health Checks

- Backend: `https://intel-academy-api.fly.dev/api/health`
- Frontend: Your Vercel URL

## Additional Resources

- **[PRODUCTION_ENV_SETUP.md](./PRODUCTION_ENV_SETUP.md)** - Complete environment variable guide
- **[PRODUCTION_READINESS_CHECKLIST.md](./PRODUCTION_READINESS_CHECKLIST.md)** - Full production readiness checklist
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Detailed deployment guide
- **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Troubleshooting guide

---

**Ready to deploy?** Start with environment setup, then follow the steps above!

