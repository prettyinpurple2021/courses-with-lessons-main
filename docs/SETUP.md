# Setup Guide

Complete guide for setting up SoloSuccess Intel Academy for local development.

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14 (or use cloud service)
- **Redis** (optional, for caching and session management)

---

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd courses-with-lessons-main

# Install all dependencies
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 2. Set Up Database

#### Option 1: Local PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install PostgreSQL (remember the password you set!)
3. Create database: `solosuccess_elearning_db`

**macOS:**
```bash
brew install postgresql@18
brew services start postgresql@18
createdb solosuccess_elearning_db
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb solosuccess_elearning_db
```

#### Option 2: Supabase (Free, Recommended for Beginners)

1. Go to https://supabase.com
2. Sign up for free
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)

#### Option 3: Neon (Free, Serverless)

1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string

### 3. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database - REPLACE WITH YOUR ACTUAL DATABASE URL
DATABASE_URL="postgresql://username:password@localhost:5432/solosuccess_elearning_db?schema=public"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# JWT Secrets - CHANGE THESE TO RANDOM STRINGS
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-also-change-this-to-something-different
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend (for emails)
RESEND_API_KEY=re_your-api-key

# YouTube API (for video validation)
YOUTUBE_API_KEY=your-youtube-api-key

# Google AI (Gemini) - for content generation
GOOGLE_AI_API_KEY=your-google-ai-key

# Cron Secret (for scheduled jobs)
CRON_SECRET=your-cron-secret
```

#### Frontend Configuration

```bash
cd frontend
# Create .env file if needed
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Set Up Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate dev

# Seed database (optional - adds sample data)
npm run prisma:seed
```

### 5. Start Development Servers

#### Option 1: Run Both Together (Recommended)

From the root directory:

```bash
npm run dev
```

This starts both frontend and backend concurrently.

#### Option 2: Run Separately

**Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:3000

---

## Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both for production
- `npm run lint` - Lint all workspaces
- `npm run type-check` - Type check all workspaces
- `npm run test` - Run all tests

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:migrate dev` - Create and apply new migration
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main app component
│   └── package.json
│
├── docs/                   # Documentation
└── README.md              # Main project readme
```

---

## Key Features

### Security
- ✅ JWT authentication with refresh tokens
- ✅ HTTP-only cookies for refresh tokens
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input sanitization (XSS protection)
- ✅ Password hashing with bcrypt
- ✅ SQL injection protection (Prisma ORM)

### Functionality
- ✅ User authentication & authorization
- ✅ Course management
- ✅ Lesson progress tracking
- ✅ Activity submissions
- ✅ Forum/community features
- ✅ Certificate generation
- ✅ Final exams and projects
- ✅ User profiles with avatars
- ✅ Achievement system

---

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` in `backend/.env`
- Ensure PostgreSQL is running
- Check database credentials
- Test connection: `psql $DATABASE_URL`

### Build Errors

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Regenerate Prisma client: `npm run prisma:generate`

### Port Already in Use

- Change `PORT` in `backend/.env`
- Kill process using the port:
  - **Windows**: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
  - **Mac/Linux**: `lsof -ti:5000 | xargs kill`

### Prisma Issues

- Regenerate Prisma Client: `npm run prisma:generate`
- Reset database (⚠️ deletes all data): `npm run prisma:migrate reset`
- View database: `npm run prisma:studio`

---

## Next Steps

1. ✅ Complete setup above
2. ✅ Visit http://localhost:3000
3. ✅ Create an admin user (see [Admin Guide](./ADMIN.md))
4. ✅ Start creating content (see [Content Automation Guide](./CONTENT_AUTOMATION.md))
5. ✅ Deploy to production (see [Deployment Guide](./DEPLOYMENT.md))

---

## Support

For issues or questions:
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review error logs in console
- Check [API Documentation](./API.md)

