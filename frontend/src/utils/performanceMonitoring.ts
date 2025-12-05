/**
 * Performance monitoring utilities using Web Vitals
 * Tracks Core Web Vitals and custom performance metrics
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

/**
 * Performance metric types
 */
export type PerformanceMetricName = 'CLS' | 'INP' | 'FCP' | 'LCP' | 'TTFB' | 'CUSTOM';

export interface PerformanceMetric {
  name: PerformanceMetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
}

// Track which metrics have been logged to avoid spam
const loggedMetrics = new Set<string>();

/**
 * Send metric to analytics service
 */
function sendToAnalytics(metric: PerformanceMetric) {
  // In production, send to your analytics service
  // Examples: Google Analytics, Sentry, DataDog, New Relic
  
  // Only log each metric type once in development to avoid console spam
  if (process.env.NODE_ENV === 'development') {
    const metricKey = `${metric.name}-${metric.rating}`;
    if (!loggedMetrics.has(metricKey)) {
      console.log('[Performance]', metric);
      loggedMetrics.add(metricKey);
    }
  }

  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: Math.round(metric.delta),
      metric_id: metric.id,
    });
  }

  // Example: Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch(`${API_BASE_URL}/analytics/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
      keepalive: true, // Ensure request completes even if page is closing
    }).catch((error) => {
      if (import.meta.env.DEV) {
        console.error('Failed to send performance metric:', error);
      }
    });
  }
}

/**
 * Get rating for metric value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  // Thresholds based on Web Vitals recommendations
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25], // Cumulative Layout Shift
    INP: [200, 500], // Interaction to Next Paint (ms) - replaces FID
    FCP: [1800, 3000], // First Contentful Paint (ms)
    LCP: [2500, 4000], // Largest Contentful Paint (ms)
    TTFB: [800, 1800], // Time to First Byte (ms)
  };

  const [good, poor] = thresholds[name] || [0, 0];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Convert Web Vitals metric to our format
 */
function convertMetric(metric: Metric): PerformanceMetric {
  return {
    name: metric.name as PerformanceMetricName,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
  };
}

/**
 * Initialize Web Vitals monitoring
 */
export function initPerformanceMonitoring() {
  // Skip in development to avoid console spam
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // Cumulative Layout Shift - measures visual stability
  onCLS((metric) => {
    sendToAnalytics(convertMetric(metric));
  });

  // Interaction to Next Paint - measures interactivity (replaces FID)
  onINP((metric) => {
    sendToAnalytics(convertMetric(metric));
  });

  // First Contentful Paint - measures loading
  onFCP((metric) => {
    sendToAnalytics(convertMetric(metric));
  });

  // Largest Contentful Paint - measures loading
  onLCP((metric) => {
    sendToAnalytics(convertMetric(metric));
  });

  // Time to First Byte - measures server response time
  onTTFB((metric) => {
    sendToAnalytics(convertMetric(metric));
  });
}

/**
 * Track custom performance metric
 */
export function trackCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
  const metric: PerformanceMetric = {
    name: 'CUSTOM',
    value,
    rating: 'good', // Custom metrics don't have standard ratings
    delta: 0,
    id: `${name}-${Date.now()}`,
    timestamp: Date.now(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}:`, value, metadata);
  }

  // Send to analytics with metadata
  if (process.env.NODE_ENV === 'production') {
    fetch(`${API_BASE_URL}/analytics/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metric,
        customName: name,
        metadata,
      }),
      keepalive: true,
    }).catch((error) => {
      if (import.meta.env.DEV) {
        console.error('Failed to send custom metric:', error);
      }
    });
  }
}

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.then((value) => {
      const duration = performance.now() - start;
      trackCustomMetric(name, duration);
      return value;
    });
  }

  const duration = performance.now() - start;
  trackCustomMetric(name, duration);
  return result;
}

/**
 * Performance mark and measure utilities
 */
export const PerformanceMarker = {
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        const measure = performance.measure(name, startMark, endMark);
        trackCustomMetric(name, measure.duration);
        return measure.duration;
      } catch (error) {
        console.error('Performance measure error:', error);
        return 0;
      }
    }
    return 0;
  },

  clearMarks: (name?: string) => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks(name);
    }
  },

  clearMeasures: (name?: string) => {
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures(name);
    }
  },
};

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

  window.addEventListener('load', () => {
    // Wait for all resources to load
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (perfData) {
        // DNS lookup time
        trackCustomMetric('dns-lookup', perfData.domainLookupEnd - perfData.domainLookupStart);

        // TCP connection time
        trackCustomMetric('tcp-connection', perfData.connectEnd - perfData.connectStart);

        // Request time
        trackCustomMetric('request-time', perfData.responseStart - perfData.requestStart);

        // Response time
        trackCustomMetric('response-time', perfData.responseEnd - perfData.responseStart);

        // DOM processing time
        trackCustomMetric('dom-processing', perfData.domComplete - perfData.domInteractive);

        // Total page load time
        trackCustomMetric('page-load', perfData.loadEventEnd - perfData.fetchStart);
      }
    }, 0);
  });
}

/**
 * Track resource loading performance
 */
export function trackResourcePerformance() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Group resources by type
    const resourcesByType: Record<string, number[]> = {};

    resources.forEach((resource) => {
      const type = resource.initiatorType;
      if (!resourcesByType[type]) {
        resourcesByType[type] = [];
      }
      resourcesByType[type].push(resource.duration);
    });

    // Calculate average load time per resource type
    Object.entries(resourcesByType).forEach(([type, durations]) => {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      trackCustomMetric(`resource-${type}-avg`, avg, {
        count: durations.length,
      });
    });
  });
}

/**
 * Monitor long tasks (tasks that block the main thread for > 50ms)
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          trackCustomMetric('long-task', entry.duration, {
            startTime: entry.startTime,
          });
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error: any) {
      // Long task API not supported
      console.warn('Long task monitoring not supported', error);
    }
  }
}

/**
 * Initialize all performance monitoring
 */
export function initAllPerformanceMonitoring() {
  initPerformanceMonitoring();
  trackPageLoad();
  trackResourcePerformance();
  monitorLongTasks();
}