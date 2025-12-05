import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';

const router = Router();

/**
 * Admin authentication routes
 */

// Admin login (with rate limiting)
router.post(
  '/login',
  authLimiter, // Apply stricter rate limiting for admin login
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

// Get pending exams (protected)
router.get(
  '/grading/pending',
  authenticate,
  requireAdmin,
  asyncHandler(adminController.getPendingExams)
);

// Grade exam (protected)
router.post(
  '/grading/:resultId',
  authenticate,
  requireAdmin,
  validate([
    body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('passed').isBoolean().withMessage('Passed status is required'),
  ]),
  asyncHandler(adminController.gradeExam)
);

export default router;
