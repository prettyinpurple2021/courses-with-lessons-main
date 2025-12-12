# Quick Commands Reference

Quick reference for common production commands.

## Status & Verification

### Check Production Status
```bash
# Production readiness check
npm run check:production

# Verify content completeness
npm run verify:content

# Generate production report
npm run report:production

# Run smoke tests
npm run test:smoke
```

### Monitor Production
```bash
# View backend logs
fly logs -a intel-academy-api

# Check backend status
fly status -a intel-academy-api

# Health check
curl https://intel-academy-api.fly.dev/api/health
```

## Deployment

### Backend Deployment
```bash
# Deploy to Fly.io
cd backend
fly deploy

# Run migrations
npm run prisma:migrate:deploy --workspace=backend

# Check deployment status
fly status -a intel-academy-api
```

### Frontend Deployment
```bash
# Deploy to Vercel
npm run deploy:frontend

# Or manually
cd frontend
vercel --prod
```

## Content Management

### Setup Production Content
```bash
# All-in-one setup (recommended)
npm run content:setup-production

# Individual steps
npm run prisma:seed --workspace=backend
npm run content:update-videos
npm run content:add-exam-questions
```

### Verify Content
```bash
# Verify all content
npm run verify:content

# Verify YouTube videos
npm run verify:videos
```

## Database

### Database Commands
```bash
# Generate Prisma Client
npm run prisma:generate --workspace=backend

# Run migrations
npm run prisma:migrate --workspace=backend

# Deploy migrations (production)
npm run prisma:migrate:deploy --workspace=backend

# Seed database
npm run prisma:seed --workspace=backend

# Open Prisma Studio
npm run prisma:studio --workspace=backend
```

## Testing

### Run Tests
```bash
# All tests
npm run test

# E2E tests
npm run test:e2e

# Smoke tests
npm run test:smoke

# Frontend tests
npm run test --workspace=frontend

# Backend tests
npm run test --workspace=backend
```

## Environment Variables

### Validate Environment
```bash
# Validate backend environment
cd backend
npm run validate:env

# Check production readiness
npm run check:production
```

### Set Fly.io Secrets
```bash
fly secrets set NODE_ENV=production
fly secrets set DATABASE_URL=postgresql://...
fly secrets set JWT_SECRET=...
# ... etc
```

## Troubleshooting

### Common Issues
```bash
# Clear Prisma cache
cd backend
rm -rf node_modules/.cache/prisma
npm run prisma:generate

# Rebuild frontend
cd frontend
npm install
npm run build

# Check logs
fly logs -a intel-academy-api
```

---

**← [Back to Wiki Home](Home.md)** | **[Deployment Guide](Deployment.md)** | **[Troubleshooting](Troubleshooting.md)**

