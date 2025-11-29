# SoloSuccess Intel Academy - Complete Setup Guide

## 🗄️ Database Setup (PostgreSQL)

You need a PostgreSQL database. Here are your options:

### Option 1: Local PostgreSQL (Free)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install it (remember the password you set!)
3. Your DATABASE_URL will be: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/solosuccess_academy`

### Option 2: Supabase (Free, Recommended for Beginners)
1. Go to https://supabase.com
2. Sign up for free
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. Your DATABASE_URL will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option 3: Neon (Free, Serverless)
1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string
5. Your DATABASE_URL will look like: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

## 📝 Environment Variables Setup

### Backend (.env file)

Create a file called `.env` in the `backend` folder with this content:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database - REPLACE WITH YOUR ACTUAL DATABASE URL
DATABASE_URL="postgresql://username:password@localhost:5432/solosuccess_academy?schema=public"

# JWT Secrets - CHANGE THESE TO RANDOM STRINGS
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-also-change-this-to-something-different
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Cloudinary (Optional - for avatar uploads)
# Sign up at https://cloudinary.com (free tier available)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (.env file)

Create a file called `.env` in the `frontend` folder with this content:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🚀 After Setting Up Environment Variables

Run these commands in the `backend` folder:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed the database with course data (optional but recommended)
npm run prisma:seed
```

## 🔑 What You Need to Create

### Required (App won't work without these):
1. **PostgreSQL Database** - Choose one of the options above
2. **JWT Secrets** - Just random long strings (can be anything, like: `my-super-secret-key-12345-abcdef`)

### Optional (App will work, but features will be limited):
1. **Cloudinary Account** - Only needed if you want users to upload avatars
   - Sign up at https://cloudinary.com
   - Free tier: 25 GB storage, 25 GB bandwidth/month
   - Get your credentials from the Dashboard

## 🎨 What We're Fixing Next

1. ✅ Database setup guide (this file)
2. 🎨 Redesign landing page to be more visually appealing
3. 💰 Fix pricing to be more reasonable
4. 🔓 Show all courses unlocked on landing page
5. ❌ Remove fake testimonials section
6. 🔗 Fix footer links (Privacy Policy, Terms, Contact)

## 📞 Need Help?

If you get stuck, the most common issues are:
- **Database connection errors**: Double-check your DATABASE_URL
- **Prisma errors**: Make sure you ran `npx prisma generate`
- **Port already in use**: Change PORT in backend/.env to something else (like 5001)
