import { Request, Response, NextFunction } from 'express';
import { validateAndLogin } from '../services/ssoService.js';
import { ValidationError } from '../utils/errors.js';
import { getRefreshTokenCookieConfig } from '../utils/cookieConfig.js';

export class SSOController {
  /**
   * POST /api/sso/validate
   * Validate SSO token from SoloSuccess AI and auto-login user
   * Also supports GET for redirects (token in query parameter)
   */
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      // Get token from query parameter (GET) or body (POST)
      const token = (req.query.token as string) || req.body.token;

      if (!token) {
        throw new ValidationError('token is required');
      }

      // Validate token and create/get user
      const result = await validateAndLogin(token);

      // Set session token in httpOnly cookie for auto-login
      res.cookie('refreshToken', result.sessionToken, getRefreshTokenCookieConfig());

      // If request expects JSON (API call), return JSON
      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({
          success: true,
          data: {
            user: result.user,
            sessionToken: result.sessionToken,
            message: 'SSO login successful',
          },
        });
      }

      // Otherwise redirect to dashboard (web-based SSO)
      // In production, redirect to the frontend dashboard
      const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${dashboardUrl}/dashboard?token=${result.sessionToken}`);
    } catch (error) {
      return next(error);
    }
  }
}

export const ssoController = new SSOController();

