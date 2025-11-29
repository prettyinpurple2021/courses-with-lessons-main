import { Router } from 'express';
import { subscriptionSyncController } from '../controllers/subscriptionSyncController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = Router();

/**
 * POST /api/integrations/solo-success/sync-subscription
 * Sync subscription tier for a user
 * Called by SoloSuccess AI when user's subscription changes
 * 
 * Body: {
 *   userId: string (Intel Academy user ID),
 *   solosuccessUserId: string (SoloSuccess AI user ID),
 *   tier: string (free, accelerator, premium)
 * }
 */
router.post(
  '/sync-subscription',
  apiLimiter,
  validate([
    body('userId').notEmpty().withMessage('userId is required'),
    body('solosuccessUserId').notEmpty().withMessage('solosuccessUserId is required'),
    body('tier')
      .notEmpty()
      .withMessage('tier is required')
      .isIn(['free', 'accelerator', 'premium'])
      .withMessage('tier must be one of: free, accelerator, premium'),
  ]),
  asyncHandler(
    subscriptionSyncController.syncSubscription.bind(subscriptionSyncController)
  )
);

/**
 * GET /api/integrations/solo-success/sync-all
 * Batch sync all active integrations
 * For cron job execution
 * Requires CRON_SECRET in Authorization header
 */
router.get(
  '/sync-all',
  asyncHandler(subscriptionSyncController.syncAll.bind(subscriptionSyncController))
);

/**
 * GET /api/integrations/solo-success/status/:userId
 * Get integration status for a user
 */
router.get(
  '/status/:userId',
  apiLimiter,
  asyncHandler(
    subscriptionSyncController.getStatus.bind(subscriptionSyncController)
  )
);

export default router;

