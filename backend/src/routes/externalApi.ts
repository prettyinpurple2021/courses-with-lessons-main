import { Router } from 'express';
import { externalApiController } from '../controllers/externalApiController.js';
import { validateAccessToken } from '../middleware/oauthAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for external API endpoints (100 requests/minute per token)
// Rate limiting is per IP since we can't easily track per-token in this middleware
// In production, consider using Redis for per-token rate limiting
export const externalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use token for rate limiting if available
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Use token as key
    }
    // Fallback to IP
    return req.ip || 'unknown';
  },
});

// All routes require OAuth access token authentication
router.use(validateAccessToken);
router.use(externalApiLimiter);

/**
 * External API v1 endpoints
 * All endpoints require OAuth access token in Authorization header
 */

/**
 * GET /api/external/v1/courses
 * Get user's enrolled courses
 * Query params: limit (optional, default: 3)
 */
router.get(
  '/courses',
  asyncHandler(externalApiController.getCourses.bind(externalApiController))
);

/**
 * GET /api/external/v1/courses/:courseId/progress
 * Get detailed course progress
 */
router.get(
  '/courses/:courseId/progress',
  asyncHandler(
    externalApiController.getCourseProgressById.bind(externalApiController)
  )
);

/**
 * GET /api/external/v1/achievements
 * Get user achievements
 * Query params: limit (optional, default: 6)
 */
router.get(
  '/achievements',
  asyncHandler(externalApiController.getAchievements.bind(externalApiController))
);

/**
 * GET /api/external/v1/enrollments
 * Get all user enrollments
 */
router.get(
  '/enrollments',
  asyncHandler(externalApiController.getEnrollments.bind(externalApiController))
);

export default router;

