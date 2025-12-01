import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = (
  err: ApiError | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Check if it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.statusCode) {
    // Handle other errors with statusCode
    statusCode = err.statusCode;
    message = err.isOperational ? err.message : 'Internal server error';
    isOperational = err.isOperational || false;
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a6613aa6-709b-4c6a-b69d-a5caff5afc35', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H9',
      location: 'errorHandler.ts:errorHandler',
      message: 'Global error handler invoked',
      data: {
        statusCode,
        isOperational,
        path: req.path,
        method: req.method,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // Log the error with structured logging
  const logMeta = {
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
    stack: err.stack,
    isOperational,
  };

  if (statusCode >= 500) {
    logger.error(err.message, logMeta);
  } else if (statusCode >= 400) {
    logger.warn(err.message, logMeta);
  }

  // Check if response has already been sent
  // This prevents "Cannot set headers after they are sent to the client" errors
  if (res.headersSent) {
    // If headers were already sent, we can't send a new response
    // Log the error and let the request end naturally
    logger.error('Error occurred after response was sent', logMeta);
    return;
  }

  // Send error response
  try {
    res.status(statusCode).json({
      success: false,
      error: {
        message: isOperational ? message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: err.stack,
          details: err.message,
        }),
      },
    });
  } catch (sendError) {
    // If sending the error response fails, log it
    // This can happen if the connection was closed
    logger.error('Failed to send error response', {
      originalError: err.message,
      sendError: sendError instanceof Error ? sendError.message : sendError,
    });
  }
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
