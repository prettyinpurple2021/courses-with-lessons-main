import { Router } from 'express';
import { oauthController } from '../controllers/oauthController.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { oauthTokenLimiter, oauthAuthorizeLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * OAuth 2.0 Authorization Endpoint
 * GET /oauth/authorize
 * User must be authenticated (via JWT or session)
 */
router.get(
  '/authorize',
  oauthAuthorizeLimiter,
  optionalAuthenticate,
  asyncHandler(oauthController.authorize.bind(oauthController))
);

/**
 * OAuth 2.0 Token Endpoint
 * POST /oauth/token
 * Exchanges authorization code for tokens or refreshes access token
 */
router.post(
  '/token',
  oauthTokenLimiter,
  asyncHandler(oauthController.token.bind(oauthController))
);

/**
 * OAuth 2.0 Token Revocation Endpoint
 * POST /oauth/revoke
 * Revokes access and refresh tokens
 */
router.post(
  '/revoke',
  oauthTokenLimiter,
  asyncHandler(oauthController.revoke.bind(oauthController))
);

export default router;

