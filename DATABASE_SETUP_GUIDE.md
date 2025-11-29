# Database Setup Guide for Windows

## Step 1: Install PostgreSQL

### Option A: Download from Official Website (Recommended)

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Or go directly to: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Download **PostgreSQL 18** (or latest version) for Windows x86-64

2. **Run the Installer:**
   - Double-click the downloaded `.exe` file
   - Click "Next" through the setup wizard
   - **Important:** When prompted, set a password for the `postgres` superuser
     - **Remember this password!** You'll need it for the DATABASE_URL
   - Keep the default port: **5432**
   - Keep the default locale: **Default locale**
   - Click "Next" and "Finish"

3. **Verify Installation:**
   - Open **pgAdmin 4** (installed with PostgreSQL)
   - Or open Command Prompt and run: `psql --version`

### Option B: Use Docker (Alternative)

If you prefer Docker:

```bash
docker run --name postgres-solosuccess -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=solosuccess_elearning_db -p 5432:5432 -d postgres:18
```

Then use: `postgresql://postgres:yourpassword@localhost:5432/solosuccess_elearning_db`

## Step 2: Create the Database

### Using pgAdmin (GUI):

1. Open **pgAdmin 4**
2. Connect to your PostgreSQL server (use the password you set during installation)
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `solosuccess_elearning_db`
5. Click "Save"

### Using Command Line (psql):

1. Open **Command Prompt** or **PowerShell**
2. Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\18\bin`)
3. Or add PostgreSQL to your PATH
4. Run:

```bash
psql -U postgres
```

5. Enter your password when prompted
6. Create the database:

```sql
CREATE DATABASE solosuccess_elearning_db;
\q
```

## Step 3: Create .env File

After creating the database, you'll need to create a `.env` file in the `backend` directory.

The `.env` file should contain:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/solosuccess_elearning_db"

# Node Environment
NODE_ENV="development"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production-min-32-chars"

# URLs
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (for emails)
RESEND_API_KEY="re_your-api-key"

# YouTube API
YOUTUBE_API_KEY="your-youtube-api-key"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Redis (optional for development)
REDIS_URL="redis://localhost:6379"

# Server Port (optional)
PORT=5000
```

**Important:** Replace:
- `YOUR_PASSWORD` with the password you set for the `postgres` user
- All the API keys with your actual keys (or placeholder values for now)

## Step 4: Generate Secure JWT Secrets

You can generate secure random strings for JWT secrets using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## Step 5: Run Database Migrations

After creating the `.env` file:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

This will:
1. Generate the Prisma client
2. Run all database migrations
3. Create all the tables

## Step 6: Verify Setup

Run the validation script:

```bash
cd backend
npm run validate:env
```

This will check if all required environment variables are set correctly.

## Troubleshooting

### "Connection refused" error:
- Make sure PostgreSQL service is running
- Check Windows Services: `services.msc` → Look for "postgresql-x64-18"
- Start the service if it's stopped

### "Authentication failed" error:
- Double-check your password in DATABASE_URL
- Try connecting with pgAdmin first to verify credentials

### "Database does not exist" error:
- Make sure you created the database (Step 2)
- Check the database name in DATABASE_URL matches

### Port already in use:
- Change the port in PostgreSQL config or use a different port in DATABASE_URL

## Quick Start (After Setup)

Once everything is set up:

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

Then create your admin account:

```bash
cd backend
npm run create-admin
```

