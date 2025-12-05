import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { sanitizeRequest } from './middleware/sanitization.js';
import { initRedis } from './config/redis.js';
import { validateEnvironment } from './utils/validateEnv.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import coursesRouter from './routes/courses.js';
import lessonsRouter from './routes/lessons.js';
import activitiesRouter from './routes/activities.js';
import achievementsRouter from './routes/achievements.js';
import finalProjectsRouter from './routes/finalProjects.js';
import finalExamsRouter from './routes/finalExams.js';
import certificatesRouter from './routes/certificates.js';
import communityRouter from './routes/community.js';
import usersRouter from './routes/users.js';
import progressRouter from './routes/progress.js';
import analyticsRouter from './routes/analytics.js';
import adminRouter from './routes/admin.js';
import adminCoursesRouter from './routes/adminCourses.js';
import adminUsersRouter from './routes/adminUsers.js';
import adminYouTubeRouter from './routes/adminYouTube.js';
import adminOAuthRouter from './routes/adminOAuth.js';
import adminContentGenerationRouter from './routes/adminContentGeneration.js';
import oauthRouter from './routes/oauth.js';
import externalApiRouter from './routes/externalApi.js';
import ssoRouter from './routes/sso.js';
import subscriptionSyncRouter from './routes/subscriptionSync.js';
import aiRouter from './routes/ai.js';
import cronRouter from './routes/cron.js';
import cookieConsentRouter from './routes/cookieConsent.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
// Configure Helmet with security headers
app.use(helmet({
  // HTTP Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },
  // X-Content-Type-Options
  noSniff: true,
  // X-XSS-Protection
  xssFilter: true,
  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
}));

// CORS configuration - support Vercel deployment URLs dynamically
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Check if origin matches the configured CORS_ORIGIN exactly
    if (origin === corsOrigin) {
      return callback(null, true);
    }
    
    // Support Vercel deployment URLs - allow any *.vercel.app domain
    // This handles Vercel's dynamic deployment URLs (e.g., frontend-*-*.vercel.app)
    // If CORS_ORIGIN is a Vercel domain, allow all Vercel app domains
    if (corsOrigin.includes('.vercel.app') && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Response compression (gzip)
app.use(compression({
  level: 6, // Compression level (1-9, 6 is a good balance)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req: express.Request, res: express.Response) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other requests
    return compression.filter(req, res);
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply input sanitization to all routes
app.use(sanitizeRequest);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
// OAuth routes at root level (standard OAuth 2.0 endpoints)
app.use('/oauth', oauthRouter);

// External API routes (for SoloSuccess AI integration)
app.use('/api/external/v1', externalApiRouter);

// SSO routes (for SoloSuccess AI SSO login)
app.use('/api/sso', ssoRouter);

// Subscription sync routes (for SoloSuccess AI integration)
app.use('/api/integrations/solo-success', subscriptionSyncRouter);

// Cron job routes (for scheduled tasks)
app.use('/api/cron', cronRouter);

// API routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/courses', finalProjectsRouter);
app.use('/api/courses', finalExamsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/community', communityRouter);
app.use('/api/users', usersRouter);
app.use('/api/progress', progressRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/consent', cookieConsentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', adminCoursesRouter);
app.use('/api/admin', adminUsersRouter);
app.use('/api/admin/youtube', adminYouTubeRouter);
app.use('/api/admin', adminContentGenerationRouter);
app.use('/api/admin/oauth', adminOAuthRouter);
app.use('/api/ai', aiRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Global error handlers for unhandled rejections and exceptions
// Critical for serverless environments like Vercel
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection', {
    reason,
    promise,
    stack: reason instanceof Error ? reason.stack : undefined,
  });

  // In production, we might want to exit, but in serverless we should log and continue
  // The error handler middleware will catch it if it's in a request context
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    process.exit(1);
  }
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });

  // Always exit on uncaught exceptions as the process is in an undefined state
  process.exit(1);
});

// Initialize Redis and start server
async function startServer() {
  try {
    // Validate environment variables before starting
    // Skip validation in test environment to allow flexible test setup
    if (process.env.NODE_ENV !== 'test') {
      try {
        validateEnvironment();
        logger.info('Environment variables validated successfully');
      } catch (validationError) {
        logger.error('Environment validation failed', {
          error: validationError instanceof Error ? validationError.message : validationError,
        });
        // Exit with error code 1 to indicate failure
        process.exit(1);
      }
    }

    // Initialize Redis connection (non-blocking in serverless)
    // In serverless environments, connections might fail but we should still start the server
    try {
      await initRedis();
    } catch (redisError) {
      logger.warn('Redis initialization failed, continuing without Redis', {
        error: redisError instanceof Error ? redisError.message : redisError,
      });
      // Don't exit - allow server to start without Redis
      // This is important for serverless environments where Redis might not be available
    }

    // Only start listening if not in serverless environment
    // Vercel serverless functions don't need app.listen()
    if (!process.env.VERCEL) {
      app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server running on port ${PORT}`, {
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
        });
      });
    } else {
      logger.info('Server initialized for serverless environment', {
        environment: process.env.NODE_ENV || 'development',
      });
    }
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();

// Export app for serverless environments (Vercel)
export default app;
