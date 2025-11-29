import { Router } from 'express';
import { ssoController } from '../controllers/ssoController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * POST /api/sso/validate
 * Validate SSO token from SoloSuccess AI and auto-login user
 * 
 * Also supports GET for redirects:
 * GET /api/sso/validate?token=xxx
 */
router.post(
  '/validate',
  apiLimiter,
  asyncHandler(ssoController.validate.bind(ssoController))
);

// Also support GET for redirects
router.get(
  '/validate',
  apiLimiter,
  asyncHandler(ssoController.validate.bind(ssoController))
);

export default router;

