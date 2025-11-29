import dotenv from 'dotenv';
import { initRedis, getRedisClient, closeRedis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

dotenv.config();

/**
 * Test Redis connection and basic operations
 */
async function testRedis() {
  try {
    logger.info('Testing Redis connection...');
    
    // Initialize Redis
    await initRedis();
    const client = getRedisClient();
    
    if (!client) {
      logger.error('Redis client not initialized');
      process.exit(1);
    }
    
    logger.info('Redis connected successfully!');
    
    // Test basic operations
    logger.info('Testing basic operations...');
    
    // Set a value
    await client.set('test:foo', 'bar');
    logger.info('Set test:foo = bar');
    
    // Get the value
    const result = await client.get('test:foo');
    logger.info(`Get test:foo = ${result}`);
    
    if (result !== 'bar') {
      throw new Error('Value mismatch!');
    }
    
    // Set with expiration
    await client.setEx('test:temp', 10, 'temporary');
    logger.info('Set test:temp with 10s expiration');
    
    // Check if key exists
    const exists = await client.exists('test:temp');
    logger.info(`test:temp exists: ${exists === 1}`);
    
    // Delete the test keys
    await client.del('test:foo');
    await client.del('test:temp');
    logger.info('Cleaned up test keys');
    
    logger.info('✅ All Redis tests passed!');
    
    // Close connection
    await closeRedis();
    logger.info('Redis connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Redis test failed', { error });
    process.exit(1);
  }
}

testRedis();
