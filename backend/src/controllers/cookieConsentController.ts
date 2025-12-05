import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { cookieConsentService, CookiePreferences } from '../services/cookieConsentService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError } from '../utils/errors.js';
import { getSecureCookieConfig } from '../utils/cookieConfig.js';

/**
 * Generate or retrieve session ID for anonymous users
 */
function getOrCreateSessionId(req: Request): string {
  let sessionId = req.cookies['session_id'];
  
  if (!sessionId) {
    // Generate a simple session ID (in production, use a more secure method)
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  return sessionId;
}

export class CookieConsentController {
  /**
   * POST /api/consent/cookie
   * Store cookie consent preferences
   */
  storeConsent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Invalid request data', errors.array()));
    }

    const { preferences, version, sessionId: clientSessionId } = req.body;
    const userId = req.user?.userId;

    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return next(new ValidationError('Preferences are required'));
    }

    const { necessary, analytics, marketing } = preferences as CookiePreferences;

    if (typeof necessary !== 'boolean' || typeof analytics !== 'boolean' || typeof marketing !== 'boolean') {
      return next(new ValidationError('Invalid preferences format'));
    }

    // Get or create session ID for anonymous users
    const sessionId = userId ? undefined : (clientSessionId || getOrCreateSessionId(req));

    // Store consent in database
    await cookieConsentService.storeConsent({
      preferences: { necessary, analytics, marketing },
      version: version || '1.0',
      userId,
      sessionId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || undefined,
    });

    // Set session ID cookie for anonymous users (httpOnly for security)
    if (!userId && sessionId) {
      res.cookie('session_id', sessionId, getSecureCookieConfig(365 * 24 * 60 * 60 * 1000)); // 1 year
    }

    // Also set a simple consent cookie (non-httpOnly for client-side access)
    // This is a backup method, but localStorage is primary
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('cookie_consent', JSON.stringify({ necessary, analytics, marketing }), {
      httpOnly: false, // Allow JavaScript access as backup
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      path: '/',
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Cookie consent stored successfully',
        preferences: { necessary, analytics, marketing },
        version: version || '1.0',
      },
    });
  });

  /**
   * GET /api/consent/cookie
   * Get latest cookie consent for current user/session
   */
  getConsent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const sessionId = req.cookies['session_id'] || req.query.sessionId as string;

    if (!userId && !sessionId) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const consent = await cookieConsentService.getLatestConsent(userId, sessionId);

    return res.status(200).json({
      success: true,
      data: consent,
    });
  });

  /**
   * DELETE /api/consent/cookie
   * Delete all consent records for current user (GDPR right to be forgotten)
   */
  deleteConsent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const sessionId = req.cookies['session_id'];

    if (userId) {
      await cookieConsentService.deleteUserConsent(userId);
    } else if (sessionId) {
      await cookieConsentService.deleteSessionConsent(sessionId);
    } else {
      return next(new ValidationError('No user or session identified'));
    }

    // Clear consent cookies
    res.clearCookie('cookie_consent');
    if (sessionId) {
      res.clearCookie('session_id');
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Cookie consent deleted successfully',
      },
    });
  });
}

export const cookieConsentController = new CookieConsentController();

