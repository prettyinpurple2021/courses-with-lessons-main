# Render Deployment Guide

Complete guide for deploying SoloSuccess Intel Academy to Render using Docker.

## Prerequisites

- GitHub account with repository access
- Render account (sign up at https://render.com)
- Domain name (optional, for custom domains)
- All required API keys and credentials (see [PRODUCTION_ENV.md](./PRODUCTION_ENV.md))

## Quick Start

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Deploy via Render Blueprint**
   - Go to Render Dashboard > New > Blueprint
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Review and confirm service configuration

3. **Set Environment Variables**
   - Configure all required variables in Render Dashboard
   - See [PRODUCTION_ENV.md](./PRODUCTION_ENV.md) for complete list

4. **Deploy**
   - Render will automatically build and deploy using Docker
   - Monitor deployment logs in Render dashboard

## Detailed Setup

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy repository access)
3. Verify your email address

### Step 2: Connect Repository

1. In Render Dashboard, click "New +"
2. Select "Blueprint"
3. Connect your GitHub account if not already connected
4. Select your repository
5. Render will detect `render.yaml` automatically

### Step 3: Review Blueprint Configuration

The `render.yaml` file defines:

- **Backend Service**: Docker-based Node.js API
- **Frontend Service**: Docker-based Nginx static site
- **PostgreSQL Database**: Managed PostgreSQL 15
- **Redis Cache**: Managed Redis instance

Review the configuration and adjust if needed:
- Region (default: oregon)
- Plan sizes (default: starter)
- Resource limits

### Step 4: Configure Environment Variables

#### Backend Environment Variables

Go to Backend Service > Environment and add:

**Required:**
- `NODE_ENV=production`
- `PORT=3000` (Render sets this automatically)
- `DATABASE_URL` (auto-populated from PostgreSQL service)
- `REDIS_URL` (auto-populated from Redis service)
- `JWT_SECRET` (generate strong secret)
- `JWT_REFRESH_SECRET` (generate strong secret)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `YOUTUBE_API_KEY`
- `CORS_ORIGIN` (your frontend URL)
- `FRONTEND_URL` (your frontend URL)

**Optional:**
- `COOKIE_DOMAIN` (e.g., `.yourdomain.com`)
- `SENTRY_DSN`
- `EMAIL_FROM`

#### Frontend Environment Variables

Go to Frontend Service > Environment and add:

**Required:**
- `VITE_API_BASE_URL` (your backend API URL)

**Optional:**
- `VITE_GA_MEASUREMENT_ID`
- `VITE_PLAUSIBLE_DOMAIN`
- `VITE_ANALYTICS_PROVIDER`
- `VITE_SENTRY_DSN`

### Step 5: Deploy Services

1. **Review Blueprint**
   - Click "Apply" to create all services
   - Render will create:
     - PostgreSQL database
     - Redis instance
     - Backend web service
     - Frontend web service

2. **Monitor Deployment**
   - Watch build logs in real-time
   - Backend will build Docker image and start container
   - Frontend will build Docker image and start Nginx

3. **Wait for Health Checks**
   - Services must pass health checks to be marked "Live"
   - Backend: `/api/health`
   - Frontend: `/health`

### Step 6: Run Database Migrations

After backend is deployed:

1. Go to Backend Service > Shell
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. (Optional) Seed database:
   ```bash
   npm run prisma:seed
   ```

### Step 7: Configure Custom Domains

1. **Backend Domain**
   - Go to Backend Service > Settings > Custom Domain
   - Add domain: `api.yourdomain.com`
   - Update DNS records as instructed
   - SSL certificate auto-provisioned

2. **Frontend Domain**
   - Go to Frontend Service > Settings > Custom Domain
   - Add domain: `yourdomain.com`
   - Add www subdomain if needed
   - Update DNS records
   - SSL certificate auto-provisioned

3. **Update Environment Variables**
   - Update `CORS_ORIGIN` with new frontend domain
   - Update `FRONTEND_URL` with new frontend domain
   - Update `VITE_API_BASE_URL` with new backend domain

### Step 8: Verify Deployment

Run health checks:

```bash
# Backend health
curl https://api.yourdomain.com/api/health

# Frontend health
curl https://yourdomain.com/health
```

Or use the provided script:

```bash
BACKEND_URL=https://api.yourdomain.com \
FRONTEND_URL=https://yourdomain.com \
bash scripts/health-check.sh
```

## Render-Specific Configuration

### Service Configuration

#### Backend Service
- **Type**: Web Service
- **Environment**: Docker
- **Dockerfile**: `./backend/Dockerfile`
- **Docker Context**: `./backend`
- **Health Check**: `/api/health`
- **Auto-Deploy**: Enabled (deploys on git push to main)

#### Frontend Service
- **Type**: Web Service
- **Environment**: Docker
- **Dockerfile**: `./frontend/Dockerfile`
- **Docker Context**: `./frontend`
- **Health Check**: `/health`
- **Auto-Deploy**: Enabled

#### PostgreSQL Database
- **Version**: PostgreSQL 15
- **Plan**: Starter (upgrade as needed)
- **Backups**: Automatic daily backups
- **Connection**: Internal connection string provided automatically

#### Redis Cache
- **Plan**: Starter
- **Persistence**: AOF (Append-Only File)
- **Memory Policy**: allkeys-lru
- **Connection**: Internal connection string provided automatically

### Scaling

#### Horizontal Scaling
- Render supports multiple instances
- Go to Service > Settings > Scaling
- Set instance count (1-10 for starter plan)

#### Vertical Scaling
- Upgrade plan for more resources
- Go to Service > Settings > Plan
- Choose appropriate plan based on usage

### Monitoring

#### Logs
- View real-time logs in Render Dashboard
- Logs are retained for 7 days (free tier)
- Export logs for longer retention

#### Metrics
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

#### Alerts
- Set up email alerts for:
  - Service downtime
  - High error rates
  - Resource limits

### Backup & Recovery

#### Database Backups
- Automatic daily backups
- 7-day retention (starter plan)
- Point-in-time recovery available
- Manual backups via Render Dashboard

#### Restore Database
1. Go to PostgreSQL Service > Backups
2. Select backup to restore
3. Click "Restore"
4. Confirm restore operation

## Troubleshooting

### Build Failures

**Issue**: Docker build fails
- **Solution**: Check build logs for errors
- Verify Dockerfile syntax
- Ensure all dependencies are in package.json
- Check .dockerignore excludes necessary files

**Issue**: Build timeout
- **Solution**: Optimize Dockerfile (multi-stage builds)
- Reduce build context size
- Use build cache

### Deployment Failures

**Issue**: Service fails health check
- **Solution**: Check service logs
- Verify health check endpoint is accessible
- Ensure database/Redis connections work
- Check environment variables are set

**Issue**: Service crashes on startup
- **Solution**: Check application logs
- Verify all required environment variables
- Check database migrations are applied
- Ensure Redis is accessible

### Runtime Issues

**Issue**: Database connection errors
- **Solution**: Verify DATABASE_URL is correct
- Check database is running
- Verify network connectivity
- Check connection pool settings

**Issue**: Redis connection errors
- **Solution**: Verify REDIS_URL is correct
- Check Redis service is running
- Verify network connectivity
- Check Redis memory limits

**Issue**: CORS errors
- **Solution**: Verify CORS_ORIGIN matches frontend URL exactly
- Check frontend VITE_API_BASE_URL
- Ensure credentials are enabled

### Performance Issues

**Issue**: Slow response times
- **Solution**: Enable Redis caching
- Optimize database queries
- Add database indexes
- Upgrade service plan
- Enable CDN for frontend

**Issue**: High memory usage
- **Solution**: Review memory leaks
- Optimize application code
- Upgrade service plan
- Enable horizontal scaling

## Best Practices

1. **Environment Variables**
   - Use Render's secret management
   - Never commit secrets to repository
   - Use different values for staging/production

2. **Database**
   - Run migrations before deploying code
   - Test migrations in staging first
   - Keep backups enabled
   - Monitor connection pool usage

3. **Deployment**
   - Test Docker builds locally first
   - Use staging environment for testing
   - Deploy during low-traffic periods
   - Monitor deployment logs

4. **Monitoring**
   - Set up alerts for critical metrics
   - Review logs regularly
   - Monitor error rates
   - Track performance metrics

5. **Security**
   - Use strong secrets
   - Enable HTTPS (automatic on Render)
   - Keep dependencies updated
   - Review security audit reports

## Cost Optimization

1. **Use Starter Plans Initially**
   - Upgrade as needed based on usage
   - Monitor resource usage

2. **Enable Auto-Sleep** (for non-critical services)
   - Services sleep after inactivity
   - Wake on first request (may take 30-60s)

3. **Optimize Resource Usage**
   - Use caching to reduce database load
   - Optimize Docker images
   - Minimize dependencies

4. **Monitor Costs**
   - Review Render dashboard regularly
   - Set up billing alerts
   - Optimize based on usage patterns

## Support

- **Render Documentation**: https://render.com/docs
- **Render Support**: support@render.com
- **Community Forum**: https://community.render.com
- **Status Page**: https://status.render.com

## Next Steps

After successful deployment:

1. ✅ Set up monitoring and alerts
2. ✅ Configure custom domains
3. ✅ Set up CI/CD for automated deployments
4. ✅ Review and optimize performance
5. ✅ Set up backup verification
6. ✅ Document deployment procedures
7. ✅ Train team on deployment process

## Additional Resources

- [Docker Production Guide](./DOCKER_PRODUCTION.md)
- [Production Environment Variables](./PRODUCTION_ENV.md)
- [Production Testing Guide](./PRODUCTION_TESTING.md)
- [Render Pricing](https://render.com/pricing)
- [Render Status](https://status.render.com)

