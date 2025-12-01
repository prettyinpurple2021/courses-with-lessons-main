import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { ValidationError, AuthenticationError, NotFoundError } from '../utils/errors.js';
import { getRefreshTokenCookieConfig } from '../utils/cookieConfig.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a6613aa6-709b-4c6a-b69d-a5caff5afc35', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'authController.ts:register',
          message: 'AuthController.register called',
          data: {
            hasEmail: !!email,
            hasPassword: !!password,
            hasFirstName: !!firstName,
            hasLastName: !!lastName,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        throw new ValidationError('All fields are required');
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      // Set refresh token in httpOnly cookie with secure configuration
      res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieConfig());

      return res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a6613aa6-709b-4c6a-b69d-a5caff5afc35', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'authController.ts:login',
          message: 'AuthController.login called',
          data: {
            hasEmail: !!email,
            hasPassword: !!password,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      // Validate required fields
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await authService.login({ email, password });

      // Set refresh token in httpOnly cookie with secure configuration
      res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieConfig());

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a6613aa6-709b-4c6a-b69d-a5caff5afc35', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'authController.ts:login',
          message: 'AuthController.login success',
          data: {
            userId: result.user.id,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      return res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a6613aa6-709b-4c6a-b69d-a5caff5afc35', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'authController.ts:login',
          message: 'AuthController.login error',
          data: {
            errorName: (error as Error).name,
            errorMessage: (error as Error).message,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AuthenticationError('No refresh token provided');
      }

      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Generate new tokens
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      // Set new refresh token in cookie with secure configuration
      res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieConfig());

      return res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      const message = await authService.requestPasswordReset(email);

      return res.status(200).json({
        success: true,
        data: { message },
      });
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new ValidationError('Token and password are required');
      }

      await authService.resetPassword(token, password);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
