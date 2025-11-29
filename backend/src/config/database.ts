import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

/**
 * Prisma Client with connection pooling and logging
 */

// Singleton instance
let prisma: PrismaClient | null = null;

/**
 * Get Prisma client instance with connection pooling
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      // Connection pool configuration
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Log slow queries (> 1 second)
    prisma.$on('query' as never, (e: any) => {
      if (e.duration > 1000) {
        logger.warn('Slow query detected', {
          query: e.query,
          duration: `${e.duration}ms`,
          params: e.params,
        });
      }
    });

    // Log errors
    prisma.$on('error' as never, (e: any) => {
      logger.error('Prisma error', {
        message: e.message,
        target: e.target,
      });
    });

    // Log warnings
    prisma.$on('warn' as never, (e: any) => {
      logger.warn('Prisma warning', {
        message: e.message,
      });
    });

    logger.info('Prisma client initialized with connection pooling');
  }

  return prisma;
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    logger.info('Prisma client disconnected');
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
}

/**
 * Get database connection pool stats
 */
export async function getConnectionPoolStats() {
  try {
    const client = getPrismaClient();
    const result = await client.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    
    return {
      activeConnections: Number(result[0]?.count || 0),
    };
  } catch (error) {
    logger.error('Failed to get connection pool stats', { error });
    return {
      activeConnections: 0,
    };
  }
}
