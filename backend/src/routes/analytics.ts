import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/analytics/performance
 * Receive performance metrics from frontend
 */
router.post(
  '/performance',
  [
    body('name').isString().notEmpty(),
    body('value').isNumeric(),
    body('timestamp').isNumeric(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, value, rating, delta, id, timestamp, customName, metadata } = req.body;

    // Log performance metric
    logger.info('Performance metric received', {
      name: customName || name,
      value,
      rating,
      delta,
      id,
      timestamp,
      metadata,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    // In production, you would:
    // 1. Store metrics in a time-series database (InfluxDB, TimescaleDB)
    // 2. Send to monitoring service (DataDog, New Relic, Sentry)
    // 3. Aggregate metrics for dashboards
    // 4. Set up alerts for performance degradation

    return res.status(200).json({ success: true });
  })
);

/**
 * POST /api/analytics/error
 * Receive error reports from frontend
 */
router.post(
  '/error',
  [
    body('message').isString().notEmpty(),
    body('stack').optional().isString(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, stack, componentStack, errorInfo } = req.body;

    // Log error
    logger.error('Frontend error reported', {
      message,
      stack,
      componentStack,
      errorInfo,
      userAgent: req.headers['user-agent'],
      url: req.headers.referer,
      ip: req.ip,
    });

    // In production, send to error tracking service (Sentry, Rollbar)

    return res.status(200).json({ success: true });
  })
);

/**
 * POST /api/analytics/event
 * Track custom events
 */
router.post(
  '/event',
  [
    body('event').isString().notEmpty(),
    body('properties').optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event, properties } = req.body;

    // Log event
    logger.info('Analytics event', {
      event,
      properties,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    // In production, send to analytics service (Google Analytics, Mixpanel, Amplitude)

    return res.status(200).json({ success: true });
  })
);

export default router;
