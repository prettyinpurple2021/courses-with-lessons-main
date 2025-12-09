import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';

// Helper to Create Store
const createStore = () => {
  // If Redis is not configured or fails to connect in dev, redisClient might be available but not connected?
  // RedisStore will try to use it.
  // If we are in dev and want to skip redis if not present:
  if (process.env.NODE_ENV === 'test') {
    return undefined;
  }

  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_HOST && !process.env.REDIS_URL) {
    return undefined; // Memory store
  }

  // In production, we assume Redis is available.
  // Pass the client directly.
  console.log('DEBUG: redisClient keys:', Object.keys(redisClient));
  if (typeof redisClient.sendCommand !== 'function') {
    console.log('DEBUG: redisClient.sendCommand IS NOT A FUNCTION');
  }
  return new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });
};

const store = createStore();

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  store: store,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (_req: any) => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 attempts per 15 minutes
  store: store,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiter for OAuth token endpoint (prevent brute force)
export const oauthTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 token requests per 15 minutes
  store: store,
  message: {
    success: false,
    error: {
      message: 'Too many token requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Rate limiter for OAuth authorize endpoint
export const oauthAuthorizeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // 50 authorization requests per 15 minutes
  store: store,
  message: {
    success: false,
    error: {
      message: 'Too many authorization requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});