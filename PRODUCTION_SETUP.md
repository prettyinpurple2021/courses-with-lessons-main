# Production Setup Guide

Step-by-step guide for setting up SoloSuccess Intel Academy in production.

## Prerequisites

- Domain name purchased
- Hosting accounts created
- Database service account
- Email service account
- Payment processor account (if applicable)

## 1. Database Setup

### Option A: Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Note the connection string
4. Enable connection pooling
5. Configure backup schedule

### Option B: Railway

1. Create account at https://railway.app
2. Create new PostgreSQL service
3. Note the connection string
4. Configure backup schedule

### Option C: Render

1. Create account at https://render.com
2. Create new PostgreSQL database
3. Note the connection string
4. Configure backup schedule

### Database Configuration

```bash
# Connect to database
psql <connection-string>

# Verify connection
\conninfo

# Run migrations
npm run prisma:migrate deploy

# Seed database
npm run prisma:seed
```

## 2. Redis Setup

### Option A: Upstash (Recommended for Serverless)

1. Create account at https://upstash.com
2. Create new Redis database
3. Note the connection string
4. Configure eviction policy: `allkeys-lru`

### Option B: Redis Cloud

1. Create account at https://redis.com
2. Create new database
3. Note the connection string
4. Configure persistence

## 3. Backend Deployment

### Option A: Railway (Recommended)

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select backend directory

3. **Configure Build**
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<your-database-url>
   JWT_SECRET=<generate-strong-secret>
   JWT_REFRESH_SECRET=<generate-strong-secret>
   CORS_ORIGIN=https://yourdomain.com
   REDIS_URL=<your-redis-url>
   RESEND_API_KEY=<your-resend-key>
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   YOUTUBE_API_KEY=<your-youtube-key>
   ```

5. **Configure Domain**
   - Add custom domain: `api.yourdomain.com`
   - Update DNS records as instructed

6. **Deploy**
   - Push to main branch
   - Railway auto-deploys

### Option B: Render (Docker - Recommended)

1. **Create Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Deploy via Blueprint**
   - Click "New +" > "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Review service configuration

3. **Configure Environment Variables**
   - Set all required variables in Render Dashboard
   - See [PRODUCTION_ENV.md](./PRODUCTION_ENV.md) for complete list
   - Use Render's secret management for sensitive values

4. **Deploy**
   - Click "Apply" to create all services
   - Render builds Docker images automatically
   - Services deploy with health checks
   - See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed guide

**Note**: The project uses Docker for deployment. The `render.yaml` file configures:
- Backend service (Docker)
- Frontend service (Docker)
- PostgreSQL database
- Redis cache

## 4. Frontend Deployment

### Option A: Vercel (Recommended)

1. **Create Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your repository
   - Select frontend directory

3. **Configure Build**
   - Framework Preset: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Add Environment Variables**
   ```
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_PLAUSIBLE_DOMAIN=yourdomain.com
   VITE_ANALYTICS_PROVIDER=ga4
   ```

5. **Configure Domain**
   - Add custom domain: `yourdomain.com`
   - Add www redirect
   - SSL auto-configured

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment

### Option B: Netlify

1. **Create Account**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add new site"
   - Import from Git
   - Select repository

3. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Add Environment Variables**
   (Same as Vercel)

5. **Configure Domain**
   - Add custom domain
   - Configure DNS
   - SSL auto-configured

6. **Deploy**
   - Click "Deploy site"

## 5. Domain Configuration

### DNS Records

Add these records to your domain registrar:

```
Type    Name    Value                           TTL
A       @       <frontend-ip>                   3600
CNAME   www     <frontend-domain>               3600
CNAME   api     <backend-domain>                3600
TXT     @       "v=spf1 include:resend.com ~all" 3600
```

### SSL Certificates

- Vercel/Netlify: Auto-configured
- Railway/Render: Auto-configured
- Custom: Use Let's Encrypt

## 6. Email Service Setup (Resend)

1. **Create Account**
   - Go to https://resend.com
   - Sign up

2. **Verify Domain**
   - Add your domain
   - Add DNS records:
     ```
     Type    Name                Value
     TXT     @                   v=spf1 include:resend.com ~all
     CNAME   resend._domainkey   <provided-value>
     ```

3. **Create API Key**
   - Go to API Keys
   - Create new key
   - Copy and save securely

4. **Test Email**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer <api-key>" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@yourdomain.com",
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Test</p>"
     }'
   ```

## 7. File Storage Setup (Cloudinary)

1. **Create Account**
   - Go to https://cloudinary.com
   - Sign up

2. **Get Credentials**
   - Dashboard shows:
     - Cloud name
     - API key
     - API secret

3. **Configure Upload Presets**
   - Go to Settings > Upload
   - Create preset for avatars
   - Create preset for resources

4. **Test Upload**
   ```bash
   curl -X POST https://api.cloudinary.com/v1_1/<cloud-name>/image/upload \
     -F "file=@test.jpg" \
     -F "upload_preset=<preset>"
   ```

## 8. YouTube API Setup

1. **Create Project**
   - Go to https://console.cloud.google.com
   - Create new project

2. **Enable API**
   - Go to APIs & Services
   - Enable YouTube Data API v3

3. **Create Credentials**
   - Create API key
   - Restrict to YouTube Data API v3
   - Add HTTP referrer restrictions

4. **Test API**
   ```bash
   curl "https://www.googleapis.com/youtube/v3/videos?id=dQw4w9WgXcQ&key=<api-key>&part=snippet,contentDetails"
   ```

## 9. Analytics Setup

### Google Analytics 4

1. **Create Account**
   - Go to https://analytics.google.com
   - Create account and property

2. **Get Measurement ID**
   - Go to Admin > Data Streams
   - Create web stream
   - Copy Measurement ID (G-XXXXXXXXXX)

3. **Add to Frontend**
   - Add to environment variables
   - Verify tracking in GA4 dashboard

### Plausible Analytics (Optional)

1. **Create Account**
   - Go to https://plausible.io
   - Sign up

2. **Add Domain**
   - Add your domain
   - Copy script snippet

3. **Verify Tracking**
   - Visit your site
   - Check Plausible dashboard

## 10. Monitoring Setup

### Sentry (Error Tracking)

1. **Create Account**
   - Go to https://sentry.io
   - Sign up

2. **Create Projects**
   - Create project for frontend (React)
   - Create project for backend (Node.js)

3. **Get DSN**
   - Copy DSN from project settings

4. **Add to Environment**
   ```
   VITE_SENTRY_DSN=<frontend-dsn>
   SENTRY_DSN=<backend-dsn>
   ```

### Uptime Monitoring

1. **Create Account**
   - UptimeRobot: https://uptimerobot.com
   - Or Pingdom: https://pingdom.com

2. **Add Monitors**
   - Monitor: `https://yourdomain.com`
   - Monitor: `https://api.yourdomain.com/api/health`
   - Check interval: 5 minutes

3. **Configure Alerts**
   - Email alerts
   - SMS alerts (optional)
   - Slack integration (optional)

## 11. Security Configuration

### Environment Variables

Generate strong secrets:
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Security Headers

Add to backend (already configured in code):
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### Rate Limiting

Already configured in backend:
- API: 100 requests per 15 minutes
- Auth: 5 attempts per 15 minutes

## 12. Backup Strategy

### Database Backups

**Automated (Recommended):**
- Supabase: Auto-backups enabled
- Railway: Configure in dashboard
- Render: Configure in dashboard

**Manual:**
```bash
# Backup
pg_dump <database-url> > backup.sql

# Restore
psql <database-url> < backup.sql
```

### File Backups

Cloudinary handles file storage and backups automatically.

## 13. Testing Production

### Smoke Tests

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Frontend
curl https://yourdomain.com

# Test registration
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Load Testing

```bash
# Install k6
brew install k6  # Mac
# or download from https://k6.io

# Run load test
k6 run load-test.js
```

## 14. Launch Checklist

- [ ] Database deployed and seeded
- [ ] Redis deployed
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Domain configured
- [ ] SSL active
- [ ] Email service working
- [ ] File storage working
- [ ] YouTube API working
- [ ] Analytics tracking
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Security headers set
- [ ] Rate limiting active
- [ ] Smoke tests passing

## 15. Post-Launch

### Monitor

- Check error rates in Sentry
- Monitor uptime
- Watch server resources
- Review analytics

### Optimize

- Enable CDN caching
- Optimize images
- Minimize bundle sizes
- Database query optimization

### Scale

- Increase server resources as needed
- Add database read replicas
- Implement caching strategies
- Consider load balancing

## Support

For deployment issues:
- Check hosting provider documentation
- Review application logs
- Contact hosting support
- Consult TROUBLESHOOTING.md

---

**Congratulations!** Your production environment is ready! 🚀
