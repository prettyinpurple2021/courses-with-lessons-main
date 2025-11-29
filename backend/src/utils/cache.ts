import { getRedisClient } from '../config/redis.js';
import { logger } from './logger.js';

/**
 * Cache utility functions for Redis operations
 */

/**
 * Get a value from cache
 */
export async function getCache(key: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return null;
    }
    
    const value = await client.get(key);
    return value;
  } catch (error) {
    logger.error('Cache get error', { key, error });
    return null;
  }
}

/**
 * Set a value in cache with optional expiration (in seconds)
 */
export async function setCache(
  key: string,
  value: string,
  expirationSeconds?: number
): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return false;
    }
    
    if (expirationSeconds) {
      await client.setEx(key, expirationSeconds, value);
    } else {
      await client.set(key, value);
    }
    
    return true;
  } catch (error) {
    logger.error('Cache set error', { key, error });
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return false;
    }
    
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error', { key, error });
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return false;
    }
    
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    
    return true;
  } catch (error) {
    logger.error('Cache pattern delete error', { pattern, error });
    return false;
  }
}

/**
 * Check if a key exists in cache
 */
export async function existsCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }
    
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Cache exists error', { key, error });
    return false;
  }
}

/**
 * Get and parse JSON from cache
 */
export async function getCacheJSON<T>(key: string): Promise<T | null> {
  try {
    const value = await getCache(key);
    if (!value) return null;
    
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error('Cache JSON parse error', { key, error });
    return null;
  }
}

/**
 * Set JSON value in cache
 */
export async function setCacheJSON(
  key: string,
  value: any,
  expirationSeconds?: number
): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(value);
    return await setCache(key, jsonString, expirationSeconds);
  } catch (error) {
    logger.error('Cache JSON stringify error', { key, error });
    return false;
  }
}
