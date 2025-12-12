# Redis Production Setup Guide

## Do You Need Redis in Production?

**Short Answer:** Redis is **optional but highly recommended** for production.

### What Redis Does in Your Application

Redis is used for:
1. **Caching API responses** - Faster page loads and reduced database load
2. **Webhook queuing** - Async processing of webhook events
3. **Session management** - (Optional) Storing session data
4. **Rate limiting** - (Optional enhancement) More efficient rate limiting

### What Happens Without Redis?

Your application **will still work** without Redis, but:
- ⚠️ API responses won't be cached (slower performance)
- ⚠️ Webhooks will be sent synchronously (may slow down requests)
- ✅ All core functionality remains intact

---

## Step-by-Step Redis Setup

### Option 1: Fly.io Redis (BEST for Your Setup - Since You're Using Fly.io)

**Since you're deploying your backend to Fly.io, this is the easiest option!**

#### Step 1: Create Redis Instance

```bash
fly redis create
```

Follow the prompts:
- **App name:** `solosuccess-redis` (or your preferred name)
- **Region:** Choose same region as your backend app
- **Plan:** Choose plan (free tier available for small apps)

#### Step 2: Attach Redis to Your Backend App

```bash
# Replace with your actual backend app name
fly redis attach solosuccess-redis -a your-backend-app-name
```

This automatically:
- ✅ Creates `REDIS_URL` secret in your Fly.io app
- ✅ Configures connection automatically
- ✅ No manual setup needed!

#### Step 3: Verify

```bash
# Check that REDIS_URL was set
fly secrets list -a your-backend-app-name
```

You should see `REDIS_URL` in the list.

#### Step 4: Test Locally (Optional)

If you want to test locally, get the connection string:
```bash
fly redis status solosuccess-redis
```

Then add to your local `backend/.env`:
```env
REDIS_URL=redis://default:password@host.fly.dev:6379
```

**That's it!** Fly.io handles everything automatically.

---

### Option 2: Upstash Redis (Alternative - Free Tier Available)

#### Step 1: Sign Up for Upstash

1. Go to https://upstash.com
2. Sign up for a free account
3. Verify your email

#### Step 2: Create a Redis Database

1. Click **"Create Database"**
2. Choose settings:
   - **Name:** `solosuccess-prod` (or your preferred name)
   - **Type:** Regional (choose region closest to your backend)
   - **Region:** Select closest to your backend server
   - **Tier:** Free (10,000 commands/day)
3. Click **"Create"**

#### Step 3: Get Connection Details

After creating the database, you'll see:

**Option A: REDIS_URL (Recommended)**
```
redis://default:your-password@your-host.upstash.io:6379
```

**Option B: Individual Credentials**
- Host: `your-host.upstash.io`
- Port: `6379`
- Username: `default`
- Password: `your-password`

#### Step 4: Configure in Your Environment

**In `backend/.env`:**
```env
# Option A: Using REDIS_URL (recommended)
REDIS_URL=redis://default:your-password@your-host.upstash.io:6379

# Option B: Using individual credentials
# REDIS_HOST=your-host.upstash.io
# REDIS_PORT=6379
# REDIS_USERNAME=default
# REDIS_PASSWORD=your-password
```

**For Production (Fly.io, etc.):**
```bash
# Set as secret
fly secrets set REDIS_URL="redis://default:your-password@your-host.upstash.io:6379"
```

#### Step 5: Test Redis Connection

```bash
cd backend
npm run test:redis
```

You should see:
```
✅ Redis connection successful!
✅ Redis set/get test passed!
```

---

### Option 3: Redis Cloud (Alternative)

#### Step 1: Sign Up

1. Go to https://redis.com/cloud
2. Sign up for free tier (30MB)
3. Create account

#### Step 2: Create Database

1. Click **"Create Database"**
2. Choose **"Free"** tier
3. Select region
4. Create database

#### Step 3: Get Connection String

Copy the connection string from the dashboard:
```
redis://default:password@host:port
```

#### Step 4: Configure

Same as Upstash - add `REDIS_URL` to your `.env` file.

---

### Option 4: Railway Redis (Alternative)

#### Step 1: Sign Up

1. Go to https://railway.app
2. Sign up (get $5 free credit/month)

#### Step 2: Create Redis Service

1. Click **"New Project"**
2. Click **"New"** → **"Database"** → **"Add Redis"**
3. Railway automatically creates Redis instance

#### Step 3: Get Connection String

1. Click on your Redis service
2. Go to **"Variables"** tab
3. Copy `REDIS_URL`

#### Step 4: Configure

Add `REDIS_URL` to your Fly.io secrets:
```bash
fly secrets set REDIS_URL="redis://default:password@host.upstash.io:6379"
```

---

## Verification Steps

### 1. Test Redis Connection Locally

```bash
cd backend
npm run test:redis
```

Expected output:
```
✅ Redis connection successful!
✅ Redis set/get test passed!
```

### 2. Check Redis in Application Logs

Start your backend:
```bash
npm run dev
```

Look for:
```
✅ Redis client connected
✅ Redis client ready
```

If Redis is unavailable, you'll see:
```
⚠️ Redis not configured, skipping initialization
```

The app will still work, just without caching.

### 3. Verify Redis is Working

Check your Redis provider's dashboard:
- **Upstash:** Go to dashboard → See command count
- **Redis Cloud:** Check database metrics
- **Railway:** Check service logs
- **Fly.io:** `fly redis status`

---

## Production Environment Variables

### Complete Backend `.env` Example

```env
# ============================================
# DATABASE (Neon)
# ============================================
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# ============================================
# REDIS (Fly.io Redis, Upstash, or other)
# ============================================
# If using Fly.io Redis, this is set automatically via 'fly redis attach'
# If using external Redis, set manually:
REDIS_URL=redis://default:password@host.upstash.io:6379

# OR use individual credentials:
# REDIS_HOST=host.upstash.io
# REDIS_PORT=6379
# REDIS_USERNAME=default
# REDIS_PASSWORD=password

# ============================================
# OTHER VARIABLES...
# ============================================
NODE_ENV=production
# ... rest of your variables
```

---

## Redis Usage in Your Application

### How Redis is Used

1. **Caching (via `utils/cache.ts`)**
   ```typescript
   // Cache API responses
   const cached = await getCacheJSON('courses:all');
   if (cached) return cached;
   
   // Store in cache
   await setCacheJSON('courses:all', courses, 3600); // 1 hour
   ```

2. **Webhook Queuing (via `services/webhookService.ts`)**
   ```typescript
   // Queue webhook for async processing
   await queueWebhook(userId, 'course_completed', data);
   ```

3. **Session Storage** (if implemented)
   - Stores user session data
   - Faster than database lookups

### Performance Benefits

- **Faster API responses** - Cached data returns instantly
- **Reduced database load** - Fewer queries to PostgreSQL
- **Better scalability** - Handle more concurrent users
- **Async processing** - Webhooks don't block requests

---

## Troubleshooting

### Redis Connection Fails

**Error:** `Redis Client Error` or `Connection refused`

**Solutions:**
1. Check `REDIS_URL` format is correct
2. Verify Redis instance is running (check provider dashboard)
3. Check firewall/network access
4. Ensure credentials are correct

### Redis Not Found in Logs

**If you see:** `Redis not configured, skipping initialization`

**Check:**
1. Is `REDIS_URL` set in `.env`?
2. Is the connection string valid?
3. Run `npm run test:redis` to diagnose

### Redis Commands Exceeded (Upstash Free Tier)

**Error:** Rate limit exceeded

**Solutions:**
1. Upgrade to paid tier
2. Reduce cache TTL (time-to-live)
3. Implement cache invalidation
4. Use Redis more selectively

---

## Cost Comparison

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Fly.io Redis** | 256MB RAM | Starts at ~$2/month | ✅ **Your setup** (Fly.io backend) |
| **Upstash** | 10,000 commands/day | $0.20 per 100K commands | External Redis, free tier |
| **Redis Cloud** | 30MB, 30 connections | Starts at $0/month (limited) | External Redis |
| **Railway** | $5 credit/month | Pay-as-you-go | Alternative hosting |

**Recommendation for Your Setup:** 
- **Use Fly.io Redis** - It's integrated with your backend, easiest to manage, and works seamlessly
- **Or Upstash** - If you want a free tier and don't mind external service

---

## Quick Start Checklist

- [ ] Choose Redis provider (Fly.io Redis recommended)
- [ ] Create Redis database/instance
- [ ] Copy connection string (`REDIS_URL`)
- [ ] Add `REDIS_URL` to `backend/.env`
- [ ] Test connection: `npm run test:redis`
- [ ] Verify in app logs (should see "Redis client connected")
- [ ] Set `REDIS_URL` in production environment (Fly.io, etc.)
- [ ] Monitor Redis usage in provider dashboard

---

## Next Steps After Redis Setup

1. **Monitor Performance:**
   - Check Redis dashboard for command usage
   - Monitor cache hit rates
   - Watch for connection issues

2. **Optimize Cache:**
   - Set appropriate TTLs for cached data
   - Implement cache invalidation strategies
   - Monitor memory usage

3. **Scale as Needed:**
   - Upgrade plan when approaching limits
   - Consider Redis clustering for high traffic
   - Implement Redis persistence if needed

---

**← [Back to Wiki Home](Home.md)** | **[Environment Setup](Environment-Setup.md)** | **[Architecture](Architecture.md)**

**Redis is now configured and ready for production!** 🚀

