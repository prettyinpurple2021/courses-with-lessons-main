import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  // Check if user is authenticated (should be set by authenticate middleware)
  if (!req.user) {
    throw new AuthorizationError('Authentication required');
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  next();
};
