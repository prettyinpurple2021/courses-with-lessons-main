import { Request, Response, NextFunction } from 'express';
import {
  generateAuthorizationCodeFlow,
  exchangeCodeForToken,
  refreshAccessToken,
  revokeToken,
} from '../services/oauthService.js';
import { ValidationError } from '../utils/errors.js';
import { optionalAuthenticate } from '../middleware/auth.js';

export class OAuthController {
  /**
   * GET /oauth/authorize
   * OAuth 2.0 authorization endpoint
   * Redirects user to authorization page, then generates authorization code
   */
  async authorize(req: Request, res: Response, next: NextFunction) {
    try {
      const { client_id, redirect_uri, response_type, state } = req.query;

      // Validate required parameters
      if (!client_id || typeof client_id !== 'string') {
        throw new ValidationError('client_id is required');
      }

      if (!redirect_uri || typeof redirect_uri !== 'string') {
        throw new ValidationError('redirect_uri is required');
      }

      if (response_type !== 'code') {
        throw new ValidationError('response_type must be "code"');
      }

      // Check if user is authenticated (from session or JWT)
      // Try to get user from JWT token first
      let userId: string | undefined;
      
      try {
        optionalAuthenticate(req, res, () => {
          // Continue after optional auth
        });
        
        if (req.user) {
          userId = req.user.userId;
        }
      } catch (error) {
        // User not authenticated, redirect to login
        // In production, redirect to login page with return URL
        return res.status(401).json({
          success: false,
          error: {
            message: 'User must be authenticated',
            code: 'AUTHENTICATION_REQUIRED',
          },
        });
      }

      // If still no user, check session (for web-based OAuth flows)
      if (!userId) {
        // Check if there's a session-based auth (would need session middleware)
        // For now, require JWT authentication
        return res.status(401).json({
          success: false,
          error: {
            message: 'User must be authenticated',
            code: 'AUTHENTICATION_REQUIRED',
          },
        });
      }

      // Generate authorization code
      const code = await generateAuthorizationCodeFlow(
        userId,
        client_id,
        redirect_uri
      );

      // Build redirect URL with authorization code
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.set('code', code);
      if (state) {
        redirectUrl.searchParams.set('state', state as string);
      }

      // Redirect to client's redirect URI
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /oauth/token
   * OAuth 2.0 token endpoint
   * Exchanges authorization code for access and refresh tokens
   */
  async token(req: Request, res: Response, next: NextFunction) {
    try {
      const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token } =
        req.body;

      // Validate grant type
      if (grant_type === 'authorization_code') {
        // Validate required fields for authorization code grant
        if (!code) {
          throw new ValidationError('code is required');
        }

        if (!client_id) {
          throw new ValidationError('client_id is required');
        }

        if (!client_secret) {
          throw new ValidationError('client_secret is required');
        }

        if (!redirect_uri) {
          throw new ValidationError('redirect_uri is required');
        }

        // Exchange code for tokens
        const tokenResponse = await exchangeCodeForToken(
          code,
          client_id,
          client_secret,
          redirect_uri
        );

        return res.status(200).json({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in,
          token_type: tokenResponse.token_type,
        });
      } else if (grant_type === 'refresh_token') {
        // Validate required fields for refresh token grant
        if (!refresh_token) {
          throw new ValidationError('refresh_token is required');
        }

        // Refresh access token
        const tokenResponse = await refreshAccessToken(refresh_token);

        return res.status(200).json({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in,
          token_type: tokenResponse.token_type,
        });
      } else {
        throw new ValidationError('Invalid grant_type. Must be "authorization_code" or "refresh_token"');
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /oauth/revoke
   * OAuth 2.0 token revocation endpoint
   * Revokes access and refresh tokens
   */
  async revoke(req: Request, res: Response, _next: NextFunction) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ValidationError('token is required');
      }

      // Revoke token
      await revokeToken(token);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Token revoked successfully',
        },
      });
    } catch (error) {
      // Even if token is invalid, return success (OAuth 2.0 spec)
      return res.status(200).json({
        success: true,
        data: {
          message: 'Token revoked',
        },
      });
    }
  }
}

export const oauthController = new OAuthController();

