# Quick Start: Production Setup

This guide helps you quickly set up your SoloSuccess Intel Academy for production deployment.

## 🚀 Quick Setup (5 Steps)

### Step 1: Configure Environment Variables

Set up your production environment variables in your hosting platform (Fly.io, Vercel, etc.):

**Backend (Fly.io):**
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
```

**Frontend (Vercel):**
```bash
# Set in Vercel dashboard: Settings > Environment Variables
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

See [PRODUCTION_ENV_SETUP.md](./PRODUCTION_ENV_SETUP.md) for complete details.

### Step 2: Deploy Backend

```bash
cd backend
fly deploy
```

### Step 3: Run Database Migrations

```bash
npm run prisma:migrate:deploy --workspace=backend
```

**Note:** If you get a Prisma client generation error, try:
```bash
cd backend
rm -rf node_modules/.cache/prisma
npm run prisma:generate
npm run prisma:migrate:deploy
```

### Step 4: Set Up Production Content ⚠️ CRITICAL

**This is the most important step!** Without this, your site will have placeholder videos and empty exams.

```bash
# One command to set up everything:
npm run content:setup-production
```

This will:
- ✅ Seed database with courses and lesson structures
- ✅ Replace placeholder videos with real YouTube educational videos
- ✅ Add comprehensive exam questions (20 per course) to all 7 final exams

**Alternative (manual):**
```bash
npm run prisma:seed --workspace=backend
npm run content:update-videos
npm run content:add-exam-questions
```

### Step 5: Deploy Frontend

```bash
cd frontend
vercel --prod
```

## ✅ Verification

After deployment, verify everything is working:

```bash
# Check environment variables
npm run check:production

# Verify content completeness
npm run verify:content

# Generate production report
npm run report:production
```

## 🛑 Common Issues

### Issue: Placeholder Videos Showing
**Solution:** Run `npm run content:update-videos`

### Issue: Empty Exams
**Solution:** Run `npm run content:add-exam-questions`

### Issue: CORS Errors
**Solution:** Ensure `CORS_ORIGIN` and `FRONTEND_URL` use HTTPS (not localhost)

### Issue: Database Connection Failed
**Solution:** Verify `DATABASE_URL` is correct and database is accessible from Fly.io

## 📚 Additional Resources

- **[PRODUCTION_ENV_SETUP.md](./PRODUCTION_ENV_SETUP.md)** - Complete environment variable guide
- **[PRODUCTION_READINESS_CHECKLIST.md](./PRODUCTION_READINESS_CHECKLIST.md)** - Full production readiness checklist
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Detailed deployment guide

## 🎯 What Gets Set Up?

After running `npm run content:setup-production`, your database will contain:

- ✅ **7 Courses** - Complete course structures
- ✅ **84 Lessons** - 12 lessons per course with real YouTube videos
- ✅ **Activities** - Quizzes, exercises, reflections, and practical tasks
- ✅ **Resources** - Downloadable materials for each lesson
- ✅ **Final Projects** - Project requirements for each course
- ✅ **Final Exams** - 7 exams with 20 comprehensive questions each (140 total questions)

## ⚠️ Important Notes

1. **Never skip Step 4** - Your site will be broken without real content
2. **Environment variables must use HTTPS** - No localhost URLs in production
3. **Run content scripts after every database reset** - They populate the content
4. **Test before going live** - Verify videos play and exams have questions

---

**Need help?** Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) or review the production readiness checklist.
