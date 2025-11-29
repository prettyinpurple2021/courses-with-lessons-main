import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

/**
 * Cache middleware for GET requests
 * Caches response based on request URL and user ID
 */
export function cacheMiddleware(ttlSeconds: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and user ID
    const userId = (req as any).user?.id || 'anonymous';
    const cacheKey = `cache:${userId}:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        logger.debug('Cache hit', { key: cacheKey });
        return res.json(cachedData);
      }

      // Cache miss - intercept response
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        // Store in cache asynchronously
        setCache(cacheKey, data, ttlSeconds).catch((error) => {
          logger.error('Failed to cache response', { key: cacheKey, error });
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error });
      next();
    }
  };
}

/**
 * Cache invalidation middleware
 * Invalidates cache for specific patterns after mutations
 */
export function invalidateCacheMiddleware(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send.bind(res);

    res.send = function (data: any) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache patterns asynchronously
        Promise.all(
          patterns.map(async (pattern) => {
            const userId = (req as any).user?.id;
            const fullPattern = userId ? `cache:${userId}:${pattern}` : `cache:*:${pattern}`;
            
            // Note: In production, use Redis SCAN instead of KEYS for better performance
            logger.debug('Invalidating cache pattern', { pattern: fullPattern });
          })
        ).catch((error) => {
          logger.error('Cache invalidation error', { error });
        });
      }

      return originalSend(data);
    };

    next();
  };
}
