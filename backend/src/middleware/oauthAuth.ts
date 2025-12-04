import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, OAuthTokenPayload } from '../services/oauthService.js';

// Extend Express Request type to include OAuth info
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      oauth?: {
        userId: string;
        clientId: string;
        token: string;
      };
    }
  }
}

/**
 * Middleware to validate OAuth access token
 * Used for external API endpoints that require OAuth authentication
 */
export const validateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'No access token provided',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let payload: OAuthTokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired access token',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }

    // Attach OAuth info to request
    req.oauth = {
      userId: payload.userId,
      clientId: payload.clientId,
      token,
    };

    next();
  } catch (error) {
    next(error);
  }
};

