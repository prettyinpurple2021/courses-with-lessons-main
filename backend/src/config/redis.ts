import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

// Redis client instance
export let redisClient = (() => {
  // Support both URL-based and credential-based configuration
  if (process.env.REDIS_URL) {
    return createClient({
      url: process.env.REDIS_URL,
    });
  }

  // Warning: In development with no config, this might fail or try localhost default
  return createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          logger.error('Redis reconnection failed after 10 attempts');
          return new Error('Redis reconnection failed');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });
})();

// Error handling at top level to prevent crashes on startup if lazy
redisClient.on('error', (err) => {
  // If we are in dev and no redis configured, we might get errors here if we try to use it
  // But initRedis handles the "skip" logic.
  // Actually, if we create the client, it might try to connect or just sit there?
  // v4 createClient doesn't connect automatically.
  logger.error('Redis Client Error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting');
});

/**
 * Initialize Redis connection
 */
export async function initRedis() {
  // Skip Redis in development if not configured
  if (!process.env.REDIS_HOST && !process.env.REDIS_URL && process.env.NODE_ENV === 'development') {
    logger.info('Redis not configured, skipping initialization');
    return null;
  }

  try {
    // Connect with timeout
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis', { error });
    // In dev, we might want to fail soft?
    // But if we return null, using the client elsewhere might crash if they assume it's connected.
    // Ideally code using it handles errors or checks readiness.
    return null;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null as any; // Cast to any to avoid type complaints if type inference doesn't match
    logger.info('Redis connection closed');
  }
}
