import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Set sample rate for performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Set sample rate for profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app: undefined }),
      
      // Enable profiling
      new ProfilingIntegration(),
    ],
    
    // Filter out sensitive data
    beforeSend(event: Sentry.Event, _hint: Sentry.EventHint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Remove sensitive query parameters
      if (event.request?.query_string) {
        const sensitiveParams = ['token', 'password', 'secret'];
        const queryString = typeof event.request.query_string === 'string' 
          ? event.request.query_string 
          : '';
        
        if (queryString) {
          let sanitizedQuery = queryString;
          sensitiveParams.forEach(param => {
            if (sanitizedQuery.includes(param)) {
              sanitizedQuery = sanitizedQuery.replace(
                new RegExp(`${param}=[^&]*`, 'gi'),
                `${param}=[REDACTED]`
              );
            }
          });
          event.request.query_string = sanitizedQuery;
        }
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNREFUSED',
    ],
  });
}

/**
 * Sentry error handler middleware for Express
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler();

/**
 * Sentry request handler middleware for Express
 */
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

/**
 * Sentry tracing handler middleware for Express
 */
export const sentryTracingHandler = Sentry.Handlers.tracingHandler();
