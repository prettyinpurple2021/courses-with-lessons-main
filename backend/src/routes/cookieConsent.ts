import { Router } from 'express';
import { body } from 'express-validator';
import { cookieConsentController } from '../controllers/cookieConsentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/consent/cookie
 * Store cookie consent preferences
 * Public endpoint (works for both authenticated and anonymous users)
 */
router.post(
  '/cookie',
  [
    body('preferences').isObject().withMessage('Preferences must be an object'),
    body('preferences.necessary').isBoolean().withMessage('Necessary preference must be boolean'),
    body('preferences.analytics').isBoolean().withMessage('Analytics preference must be boolean'),
    body('preferences.marketing').isBoolean().withMessage('Marketing preference must be boolean'),
    body('version').optional().isString().withMessage('Version must be a string'),
    body('sessionId').optional().isString().withMessage('Session ID must be a string'),
  ],
  // authenticate is optional - works for both authenticated and anonymous users
  cookieConsentController.storeConsent
);

/**
 * GET /api/consent/cookie
 * Get latest cookie consent for current user/session
 * Public endpoint
 */
router.get(
  '/cookie',
  // authenticate is optional
  cookieConsentController.getConsent
);

/**
 * DELETE /api/consent/cookie
 * Delete all consent records (GDPR right to be forgotten)
 * Public endpoint (works for both authenticated and anonymous users)
 */
router.delete(
  '/cookie',
  // authenticate is optional
  cookieConsentController.deleteConsent
);

export default router;

