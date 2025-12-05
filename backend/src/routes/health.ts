import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * Comprehensive health check endpoint
 * Checks database, Redis, and server status
 */
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
    },
    database: 'unknown',
    redis: 'unknown',
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.database = 'connected';
  } catch (error) {
    logger.error('Database health check failed', { error });
    healthStatus.database = 'disconnected';
    healthStatus.status = 'unhealthy';
  }

  // Check Redis connectivity
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      // Add timeout to Redis ping to prevent hanging
      const pingPromise = redisClient.ping();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timeout')), 1000)
      );

      await Promise.race([pingPromise, timeoutPromise]);
      healthStatus.redis = 'connected';
    } else {
      healthStatus.redis = 'not configured';
    }
  } catch (error) {
    logger.error('Redis health check failed', { error });
    healthStatus.redis = 'disconnected';
    // Don't mark as unhealthy if Redis is optional
    if (process.env.NODE_ENV === 'production') {
      healthStatus.status = 'degraded';
    }
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 :
    healthStatus.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(healthStatus);
}));

export default router;
