import { Request, Response, NextFunction } from 'express';
import { sanitizeObject } from '../utils/sanitization.js';

/**
 * Middleware to automatically sanitize request body, query, and params
 * Applies XSS protection to all string inputs
 */
export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query as Record<string, any>);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    return next(error);
  }
};

