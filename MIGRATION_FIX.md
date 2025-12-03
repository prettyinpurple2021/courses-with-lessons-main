# Migration Fix - Production Deployment

## Issue
You're trying to run production migrations locally, but there are two problems:
1. The command `prisma migrate dev deploy` doesn't exist (should be `prisma migrate deploy`)
2. Prisma client generation is failing due to corrupted cache

## Solution: Run Migrations on Fly.io

For production, you should run migrations **on Fly.io** after deployment, not locally.

### Option 1: Run Migrations on Fly.io (Recommended)

After deploying to Fly.io, SSH into your app and run migrations:

```bash
# SSH into your Fly.io app
fly ssh console -a intel-academy-api

# Once inside, run migrations
cd /app
npm run prisma:migrate:deploy
```

### Option 2: Run Migrations Locally (Alternative)

If you need to run migrations locally against your production database:

1. **Fix Prisma Client Generation:**
   ```powershell
   cd backend
   
   # Clean Prisma cache
   Remove-Item -Recurse -Force node_modules\.cache\prisma -ErrorAction SilentlyContinue
   
   # Reinstall dependencies
   npm install
   
   # Generate Prisma client
   npx prisma generate
   ```

2. **Run Production Migrations:**
   ```powershell
   # Make sure your .env file has the production DATABASE_URL
   npm run prisma:migrate:deploy
   ```

## Updated Scripts

I've added a new script `prisma:migrate:deploy` to `backend/package.json` for production migrations.

**Use this command:**
```bash
npm run prisma:migrate:deploy --workspace=backend
```

**NOT this (wrong):**
```bash
npm run prisma:migrate deploy --workspace=backend  # ❌ Wrong
```

## Quick Fix Steps

1. **Clean Prisma cache:**
   ```powershell
   cd backend
   Remove-Item -Recurse -Force node_modules\.cache\prisma -ErrorAction SilentlyContinue
   ```

2. **Reinstall dependencies:**
   ```powershell
   npm install
   ```

3. **Generate Prisma client:**
   ```powershell
   npx prisma generate
   ```

4. **Run migrations (if needed locally):**
   ```powershell
   npm run prisma:migrate:deploy
   ```

## Recommended Production Workflow

1. ✅ Deploy backend: `fly deploy` (already done!)
2. ✅ Set environment variables on Fly.io
3. ✅ SSH into Fly.io and run migrations: `fly ssh console -a intel-academy-api`
4. ✅ Run content setup: `npm run content:setup-production` (from local machine, connects to production DB)
5. ✅ Deploy frontend

## Note

Since your deployment already succeeded, you can now:
- SSH into Fly.io to run migrations there, OR
- Fix your local Prisma setup and run migrations locally against production DB

The choice depends on whether you want to run migrations on the server or from your local machine.

