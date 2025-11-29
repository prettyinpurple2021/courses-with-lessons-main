# Deployment Guide

This guide covers deployment options for the SoloSuccess Intel Academy platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [CI/CD Pipeline](#cicd-pipeline)

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ database
- Redis 7+ instance
- Cloudinary account for file uploads
- GitHub account for CI/CD

## Environment Variables

### Required Environment Variables

Copy `.env.example` to `.env` and configure the following:

**Database:**
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name

**Redis:**
- `REDIS_URL` - Redis connection string
- `REDIS_PASSWORD` - Redis password

**JWT:**
- `JWT_SECRET` - Secret for access tokens (min 32 characters)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 characters)

**Cloudinary:**
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

**Application:**
- `FRONTEND_URL` - Frontend application URL
- `VITE_API_URL` - Backend API URL (for frontend)
- `NODE_ENV` - Environment (development/staging/production)

## Frontend Deployment

### Option 1: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd frontend
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` - Your backend API URL

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Set environment variables in Netlify dashboard:
   - `VITE_API_URL` - Your backend API URL

### Manual Deployment

1. Build the frontend:
   ```bash
   npm run build:frontend
   ```

2. Deploy the `frontend/dist` directory to your hosting provider

## Backend Deployment

### Option 1: Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   railway init
   ```

4. Deploy:
   ```bash
   railway up
   ```

5. Set environment variables in Railway dashboard

### Option 2: Render

1. Connect your GitHub repository to Render

2. Create a new Web Service:
   - Build Command: `npm ci && npm run build:backend`
   - Start Command: `cd backend && node dist/server.js`

3. Set environment variables in Render dashboard

4. Deploy using the `render.yaml` blueprint

### Manual Deployment

1. Build the backend:
   ```bash
   npm run build:backend
   ```

2. Deploy the `backend/dist` directory and `node_modules` to your server

3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the server:
   ```bash
   node dist/server.js
   ```

## Database Setup

### Managed PostgreSQL Services

**Option 1: Railway**
- Create a PostgreSQL database in Railway dashboard
- Copy the connection string to `DATABASE_URL`

**Option 2: Render**
- Create a PostgreSQL database in Render dashboard
- Copy the internal connection string to `DATABASE_URL`

**Option 3: Supabase**
- Create a project at supabase.com
- Get the connection string from Settings > Database
- Use the "Connection pooling" URL for better performance

### Running Migrations

After setting up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (optional)
npm run prisma:seed --workspace=backend
```

## Redis Setup

### Managed Redis Services

**Option 1: Railway**
- Add Redis plugin in Railway dashboard
- Copy the connection string to `REDIS_URL`

**Option 2: Render**
- Create a Redis instance in Render dashboard
- Copy the connection string to `REDIS_URL`

**Option 3: Upstash**
- Create a Redis database at upstash.com
- Copy the connection string to `REDIS_URL`

### Self-Hosted Redis

If running your own Redis instance:

```bash
# Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server

# Set password (recommended)
redis-cli CONFIG SET requirepass "your_password"
```

## CI/CD Pipeline

### GitHub Actions Setup

1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN` or `NETLIFY_TOKEN` - For frontend deployment
   - `RAILWAY_TOKEN` or `RENDER_API_KEY` - For backend deployment
   - `STAGING_DATABASE_URL` - Staging database connection
   - `PRODUCTION_DATABASE_URL` - Production database connection
   - `STAGING_API_URL` - Staging API URL
   - `PRODUCTION_API_URL` - Production API URL
   - `CODECOV_TOKEN` - For code coverage reports (optional)

2. Configure environments in GitHub:
   - `staging` - For staging deployments
   - `production-approval` - For manual approval
   - `production` - For production deployments

3. Push to branches:
   - Push to `develop` → Deploys to staging
   - Push to `main` → Requires approval → Deploys to production

### Workflow Files

The following workflows are configured:

- `.github/workflows/ci.yml` - Linting and type checking
- `.github/workflows/test.yml` - Unit and integration tests
- `.github/workflows/e2e-tests.yml` - End-to-end tests
- `.github/workflows/deploy-staging.yml` - Staging deployment
- `.github/workflows/deploy-production.yml` - Production deployment

## Docker Deployment

### Local Development

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f backend
```

## Health Checks

### Backend Health Check

```bash
curl https://api.solosuccess-academy.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend Health Check

```bash
curl https://solosuccess-academy.com/health
```

Expected response:
```
healthy
```

## Monitoring

### Error Tracking

Configure Sentry for error tracking:

1. Create a Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Errors will be automatically tracked

### Uptime Monitoring

Set up uptime monitoring with:
- UptimeRobot
- Pingdom
- Better Uptime

Monitor these endpoints:
- `https://api.solosuccess-academy.com/api/health`
- `https://solosuccess-academy.com/health`

## Backup Strategy

### Database Backups

**Automated Backups:**
- Railway: Automatic daily backups
- Render: Automatic daily backups
- Supabase: Automatic daily backups

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Redis Backups

Redis data is cached and can be regenerated, but for persistence:

```bash
# Save Redis snapshot
redis-cli SAVE

# Backup dump.rdb file
cp /var/lib/redis/dump.rdb /backup/redis-backup.rdb
```

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Ensure migrations have been run

**Redis Connection Errors:**
- Verify `REDIS_URL` is correct
- Check Redis is running and accessible
- Verify password if required

**Build Failures:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm ci`
- Check Node.js version matches requirements (18+)
- Verify all environment variables are set

**Deployment Failures:**
- Check deployment logs for specific errors
- Verify all secrets are configured in hosting platform
- Ensure build commands are correct

## Support

For deployment issues:
1. Check the logs: `docker-compose logs` or platform-specific logs
2. Review environment variables
3. Verify database and Redis connectivity
4. Check GitHub Actions workflow runs
