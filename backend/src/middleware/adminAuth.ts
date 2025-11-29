import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

/**
 * Middleware to check if the authenticated user has admin role
 * Must be used after the auth middleware
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is authenticated (set by auth middleware)
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
