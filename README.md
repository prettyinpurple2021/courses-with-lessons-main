# SoloSuccess Intel Academy

Premium learning platform for female entrepreneurs featuring bootcamp-style training with a unique "Girl Boss Drill Sergeant" philosophy.

## 🎯 Overview

SoloSuccess Intel Academy is a full-stack web application that delivers intensive bootcamp-style training through 7 sequential courses. Each course contains 12 lessons with YouTube video content, interactive activities, a final project, and a final exam. The platform enforces strict sequential progression - students must complete activities, lessons, and courses in order with no ability to skip ahead.

## 📁 Project Structure

This is a monorepo containing:
- `frontend/` - React + Vite + TypeScript frontend application
- `backend/` - Node.js + Express + TypeScript backend API
- `e2e/` - Playwright end-to-end tests
- `docs/` - Complete documentation (see below)

## ✅ Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14
- **Redis** (optional, for caching and session management)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd solosuccess-intel-academy

# Install all dependencies
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 2. Set Up Environment Variables

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solosuccess_elearning_db"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (for password reset)
RESEND_API_KEY=your-resend-api-key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# YouTube API (for video validation)
YOUTUBE_API_KEY=your-youtube-api-key
```

#### Frontend Configuration
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
VITE_ANALYTICS_PROVIDER=none
```

### 3. Set Up Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate

# Seed the database with 7 courses (12 lessons each)
npm run prisma:seed
```

The seed script will create:
- 7 courses (Foundation & Mindset, Market Intelligence, Strategic Operations, Financial Command, Marketing Warfare, Sales Mastery, Leadership & Scale)
- 12 lessons per course with YouTube video placeholders
- Multiple activities per lesson (quizzes, exercises, reflections, practical tasks)
- Final projects and final exams for each course
- Sample forum categories and content

### 4. Run Development Servers

From the root directory:

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run individually:

```bash
# Frontend only (http://localhost:3000)
npm run dev:frontend

# Backend only (http://localhost:5000)
npm run dev:backend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

### 6. Create Admin User (Optional)

To access the admin panel, create an admin user:

```bash
cd backend
npm run create-admin
```

Or manually update a user in the database:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then access the admin panel at: http://localhost:3000/admin

## 📜 Available Scripts

### Root Level Commands
```bash
npm run dev              # Run both frontend and backend in development mode
npm run build            # Build both applications for production
npm run lint             # Lint all workspaces
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run test             # Run all tests
npm run test:e2e         # Run end-to-end tests with Playwright
```

### Frontend Commands
```bash
npm run dev --workspace=frontend          # Start Vite dev server (port 3000)
npm run build --workspace=frontend        # Build for production
npm run preview --workspace=frontend      # Preview production build
npm run test --workspace=frontend         # Run Vitest unit tests
npm run test:ui --workspace=frontend      # Run tests with UI
npm run lint --workspace=frontend         # Lint frontend code
```

### Backend Commands
```bash
npm run dev --workspace=backend           # Start Express server with hot reload (port 5000)
npm run build --workspace=backend         # Compile TypeScript to JavaScript
npm run start --workspace=backend         # Run compiled production server
npm run test --workspace=backend          # Run Jest tests
npm run lint --workspace=backend          # Lint backend code

# Database Commands
npm run prisma:generate --workspace=backend   # Generate Prisma Client
npm run prisma:migrate --workspace=backend    # Run database migrations
npm run prisma:studio --workspace=backend     # Open Prisma Studio (database GUI)
npm run prisma:seed --workspace=backend       # Seed database with sample data
npm run prisma:reset --workspace=backend      # Reset database (WARNING: deletes all data)
```

### E2E Testing Commands
```bash
npm run test:e2e                          # Run all E2E tests
npm run test:e2e:ui                       # Run E2E tests with Playwright UI
npm run test:e2e:headed                   # Run E2E tests in headed mode
npm run test:e2e:debug                    # Debug E2E tests
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS with custom theme
- **React Router v6** - Client-side routing
- **React Query** - Server state management and caching
- **Zustand** - Client-side state management
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM and migrations
- **PostgreSQL** - Relational database
- **Redis** - Caching and session storage
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Resend** - Email service
- **Cloudinary** - File storage and CDN
- **YouTube API** - Video metadata and validation

### Testing
- **Vitest** - Frontend unit testing
- **Jest** - Backend unit testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🎨 Design System

The platform features a unique "Girl Boss Drill Sergeant" aesthetic:

### Visual Elements
- **Glassmorphism**: Frosted glass effects with transparency, blur, and depth
- **Holographic Effects**: Rainbow prism effects on interactive elements (cyan, magenta, yellow)
- **Girly Camo Patterns**: Pink (#FFC0CB), black (#000000), and steel grey (#708090) camouflage backgrounds

### Color Palette
- **Hot Pink** (#FF1493) - Primary actions and CTAs
- **Glossy Black** (#000000) - Text and borders
- **Steel Grey** (#708090) - Secondary elements
- **Success Teal** (#40E0D0) - Success indicators
- **Girly Pink** (#FFC0CB) - Backgrounds and accents

### Typography
- **Body**: Inter or similar clean sans-serif
- **Headlines**: Bold condensed sans-serif

### Components
All UI components follow the glassmorphic design with:
- Frosted transparency effects
- Subtle shadows for depth
- Holographic borders on hover
- Smooth transitions and animations
- Responsive design for mobile, tablet, and desktop

## 📊 Database Schema

### Core Models

#### User
- Authentication (email, password)
- Profile information (name, avatar, bio)
- Role-based access control (student, admin)
- Progress tracking across courses

#### Course (7 Total)
1. Foundation & Mindset
2. Market Intelligence
3. Strategic Operations
4. Financial Command
5. Marketing Warfare
6. Sales Mastery
7. Leadership & Scale

Each course contains:
- 12 lessons with YouTube videos
- Multiple interactive activities per lesson
- Final project
- Final exam
- Sequential unlock requirements

#### Lesson (12 per Course)
- YouTube video integration
- Video progress tracking
- Note-taking functionality
- Downloadable resources
- Sequential progression within course

#### Activity (Multiple per Lesson)
- Types: Quiz, Exercise, Reflection, Practical Task
- Sequential unlocking (must complete previous activity)
- Submission and feedback system
- Progress tracking

#### Assessment
- **Final Project**: Submitted after completing all 12 lessons
- **Final Exam**: Unlocked after final project submission
- **Passing Score**: Required to unlock next course

#### Progression System
- Activities must be completed sequentially within a lesson
- Lessons must be completed sequentially within a course
- Courses must be completed sequentially (Course 1 → Course 2 → ... → Course 7)
- No skipping ahead allowed

#### Additional Features
- **Certificates**: Generated upon course completion
- **Achievements**: Unlocked for milestones
- **Community**: Forums, threads, and member directory
- **Notes**: Timestamped notes linked to video position

## 📚 Key Features

### For Students
- ✅ Sequential learning path through 7 courses
- 🎥 YouTube video lessons with custom player
- 📝 Interactive activities (quizzes, exercises, reflections)
- 📊 Real-time progress tracking
- 🏆 Achievement badges and certifications
- 💬 Community forums and networking
- 📱 Fully responsive design
- ♿ WCAG 2.1 Level AA accessibility

### For Admins
- 📋 Course and lesson management
- ✏️ Activity creation and editing
- 👥 User management and progress monitoring
- 🎬 YouTube video validation
- 📈 Analytics and reporting
- 🔧 Content management system

## 📖 Documentation

### Getting Started
- **[Quick Start: Production](./QUICK_START_PRODUCTION.md)** - Fast production setup guide ⚡
- **[Production Environment Setup](./PRODUCTION_ENV_SETUP.md)** - Complete environment variable guide
- **[Production Readiness Checklist](./PRODUCTION_READINESS_CHECKLIST.md)** - Full production readiness checklist
- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup instructions

### User & Admin Guides
- **[User Guide](./USER_GUIDE.md)** - Student user guide
- **[Admin Guide](./ADMIN_GUIDE.md)** - Admin panel guide

### Technical Documentation
- **[API Documentation](./backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Analytics Guide](./frontend/ANALYTICS_IMPLEMENTATION.md)** - Analytics setup and tracking
- **[Loading States](./frontend/src/components/common/LOADING_STATES_README.md)** - Loading components guide
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Frontend Unit Tests
```bash
cd frontend
npm run test
npm run test:ui  # With UI
npm run test:coverage  # With coverage report
```

### Backend Unit Tests
```bash
cd backend
npm run test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage report
```

### E2E Tests
```bash
npm run test:e2e
npm run test:e2e:ui  # With Playwright UI
npm run test:e2e:debug  # Debug mode
```

## 🚢 Deployment

### Docker Deployment (Recommended)

The project includes Docker configuration for production deployment:

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# See docs/DEPLOYMENT.md for deployment details
```

### Quick Deploy

#### Current Production Setup
- **Frontend**: Vercel
- **Backend**: Fly.io
- See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete guide

#### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

#### Backend (Fly.io)
```bash
cd backend
npm run build
# Deploy with start command: npm start
```

#### Database
- Use managed PostgreSQL (Fly.io, Supabase, or Railway)
- Run migrations: `npm run prisma:migrate:deploy --workspace=backend`
- **CRITICAL:** Set up production content:
  ```bash
  # Quick setup (recommended)
  npm run content:setup-production
  
  # Or manual setup:
  npm run prisma:seed --workspace=backend
  npm run content:update-videos
  npm run content:add-exam-questions
  ```
  
  **⚠️ IMPORTANT:** Without running content scripts, your production site will have placeholder videos and empty exams!

## 📚 Documentation

All documentation is organized in the `docs/` folder:

### Getting Started
- **[SETUP.md](./docs/SETUP.md)** - Complete setup guide for local development
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment guide (Vercel + Fly.io)

### Content Management
- **[CONTENT_AUTOMATION.md](./docs/CONTENT_AUTOMATION.md)** - AI-powered content generation guide
- **[CONTENT_CREATION.md](./docs/CONTENT_CREATION.md)** - Quick start for creating content
- **[CONTENT_GENERATION.md](./docs/CONTENT_GENERATION.md)** - Complete content generation guide
- **[INTERACTIVE_CONTENT.md](./docs/INTERACTIVE_CONTENT.md)** - Interactive content examples

### Admin & User Guides
- **[ADMIN.md](./docs/ADMIN.md)** - Admin panel guide
- **[USER_GUIDE.md](./docs/USER_GUIDE.md)** - User guide for students

### Technical Documentation
- **[API.md](./docs/API.md)** - API documentation
- **[SECURITY.md](./docs/SECURITY.md)** - Security implementation guide
- **[AUTH.md](./docs/AUTH.md)** - Authentication guide
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Troubleshooting guide

### Service Setup
- **[SERVICES_CLOUDINARY.md](./docs/SERVICES_CLOUDINARY.md)** - Cloudinary setup
- **[SERVICES_RESEND.md](./docs/SERVICES_RESEND.md)** - Resend email setup
- **[SERVICES_REDIS.md](./docs/SERVICES_REDIS.md)** - Redis usage guide

## 🔒 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (Prisma parameterized queries)
- XSS protection
- HTTPS enforcement in production
- Secure cookie flags (httpOnly, secure, sameSite)

## 🤝 Contributing

This is a private project. For internal contributors:

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Format code: `npm run format`
6. Submit a pull request

## 📝 License

Private - All rights reserved

## 🆘 Support

For issues or questions:
- Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Review documentation in [docs/](./docs/)
- Contact the development team

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Live webinars and workshops
- [ ] AI-powered learning recommendations
- [ ] Gamification enhancements
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with external tools (Slack, Notion, etc.)
