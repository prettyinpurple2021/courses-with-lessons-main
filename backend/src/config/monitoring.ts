import logger from './logger.js';

/**
 * Performance monitoring metrics
 */
interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowRequests: number;
}

const metrics: PerformanceMetrics = {
  requestCount: 0,
  errorCount: 0,
  averageResponseTime: 0,
  slowRequests: 0,
};

const responseTimes: number[] = [];
const SLOW_REQUEST_THRESHOLD = 1000; // 1 second
const MAX_RESPONSE_TIMES = 1000; // Keep last 1000 response times

/**
 * Track request metrics
 */
export function trackRequest(duration: number, statusCode: number) {
  metrics.requestCount++;
  
  if (statusCode >= 400) {
    metrics.errorCount++;
  }
  
  if (duration > SLOW_REQUEST_THRESHOLD) {
    metrics.slowRequests++;
    logger.warn('Slow request detected', { duration, statusCode });
  }
  
  // Track response times
  responseTimes.push(duration);
  if (responseTimes.length > MAX_RESPONSE_TIMES) {
    responseTimes.shift();
  }
  
  // Calculate average response time
  const sum = responseTimes.reduce((a, b) => a + b, 0);
  metrics.averageResponseTime = Math.round(sum / responseTimes.length);
}

/**
 * Get current metrics
 */
export function getMetrics(): PerformanceMetrics {
  return { ...metrics };
}

/**
 * Reset metrics
 */
export function resetMetrics() {
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.averageResponseTime = 0;
  metrics.slowRequests = 0;
  responseTimes.length = 0;
}

/**
 * Log metrics periodically
 */
export function startMetricsLogging(intervalMs: number = 60000) {
  setInterval(() => {
    logger.info('Performance Metrics', getMetrics());
  }, intervalMs);
}

/**
 * Monitor memory usage
 */
export function monitorMemory() {
  const used = process.memoryUsage();
  const memoryData = {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
  };
  
  logger.info('Memory Usage', memoryData);
  
  // Warn if heap usage is high
  const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;
  if (heapUsedPercent > 90) {
    logger.warn('High memory usage detected', {
      heapUsedPercent: `${heapUsedPercent.toFixed(2)}%`,
    });
  }
}

/**
 * Start memory monitoring
 */
export function startMemoryMonitoring(intervalMs: number = 300000) {
  setInterval(monitorMemory, intervalMs);
}

/**
 * Express middleware for performance monitoring
 */
export function performanceMonitoring(_req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    trackRequest(duration, res.statusCode);
  });
  
  next();
}

/**
 * Health check data
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  metrics: PerformanceMetrics;
  memory: {
    rss: string;
    heapUsed: string;
    heapTotal: string;
  };
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
}

/**
 * Perform health check
 */
export async function performHealthCheck(
  checkDatabase: () => Promise<boolean>,
  checkRedis: () => Promise<boolean>
): Promise<HealthCheckResult> {
  const used = process.memoryUsage();
  
  const [dbConnected, redisConnected] = await Promise.all([
    checkDatabase().catch(() => false),
    checkRedis().catch(() => false),
  ]);
  
  const isHealthy = dbConnected && redisConnected;
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    metrics: getMetrics(),
    memory: {
      rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    },
    database: dbConnected ? 'connected' : 'disconnected',
    redis: redisConnected ? 'connected' : 'disconnected',
  };
}
