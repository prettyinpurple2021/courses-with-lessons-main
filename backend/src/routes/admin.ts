import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { body } from 'express-validator';

const router = Router();

/**
 * Admin authentication routes
 */

// Admin login
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  asyncHandler(adminController.login)
);

// Verify admin status (protected)
router.get(
  '/verify',
  authenticate,
  requireAdmin,
  asyncHandler(adminController.verifyAdmin)
);

// Get dashboard stats (protected)
router.get(
  '/dashboard/stats',
  authenticate,
  requireAdmin,
  asyncHandler(adminController.getDashboardStats)
);

export default router;
