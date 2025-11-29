# Fly.io Deployment Checklist

## ✅ Already Configured
- ✅ App created: `intel-academy-api`
- ✅ PostgreSQL database: `intel-academy-db` (DATABASE_URL auto-set)
- ✅ Redis: `intel-academy-redis` (REDIS_URL set)
- ✅ Dockerfile configured
- ✅ fly.toml created

## 🔧 Required Environment Variables

Set these using `flyctl secrets set`:

### Critical (Required Before First Deploy)
```powershell
# Authentication secrets (generate new ones!)
flyctl secrets set JWT_SECRET="your-64-char-secret" --app intel-academy-api
flyctl secrets set JWT_REFRESH_SECRET="your-64-char-secret" --app intel-academy-api
flyctl secrets set CRON_SECRET="your-secret" --app intel-academy-api

# CORS & Frontend (set after Vercel deployment)
flyctl secrets set CORS_ORIGIN="https://your-frontend.vercel.app" --app intel-academy-api
flyctl secrets set FRONTEND_URL="https://your-frontend.vercel.app" --app intel-academy-api
```

### File Storage (Cloudinary)
```powershell
flyctl secrets set CLOUDINARY_CLOUD_NAME="your-cloud-name" --app intel-academy-api
flyctl secrets set CLOUDINARY_API_KEY="your-api-key" --app intel-academy-api
flyctl secrets set CLOUDINARY_API_SECRET="your-api-secret" --app intel-academy-api
```

### Email Service (Resend)
```powershell
flyctl secrets set RESEND_API_KEY="re_..." --app intel-academy-api
```

### YouTube API
```powershell
flyctl secrets set YOUTUBE_API_KEY="your-youtube-api-key" --app intel-academy-api
```

### Google AI (Gemini)
```powershell
flyctl secrets set GOOGLE_AI_API_KEY="your-google-ai-key" --app intel-academy-api
```

### Optional (Monitoring)
```powershell
# Sentry (if using)
flyctl secrets set SENTRY_DSN="your-sentry-dsn" --app intel-academy-api
```

## 🚀 Deployment Steps

### 1. Set All Secrets
Run all the `flyctl secrets set` commands above with your actual values.

### 2. Deploy
```powershell
cd backend
flyctl deploy
```

### 3. Run Database Migrations
```powershell
flyctl ssh console -C "npm run prisma:migrate deploy"
```

### 4. Get Your API URL
```powershell
flyctl status
# Your API will be at: https://intel-academy-api.fly.dev
```

## 📝 Notes

- **DATABASE_URL**: Already set automatically when you attached PostgreSQL
- **REDIS_URL**: Already set manually
- **NODE_ENV**: Set to "production" in fly.toml
- **PORT**: Fly.io will set this automatically (defaults to 5000)

## 🔗 Next Steps

1. Deploy frontend to Vercel
2. Update CORS_ORIGIN and FRONTEND_URL with Vercel URL
3. Set up GitHub Actions cron jobs
4. Test everything!

