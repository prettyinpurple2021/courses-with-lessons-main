import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, asyncHandler(authController.register.bind(authController)));
router.post('/login', authLimiter, asyncHandler(authController.login.bind(authController)));
router.post('/forgot-password', authLimiter, asyncHandler(authController.forgotPassword.bind(authController)));
router.post('/reset-password', authLimiter, asyncHandler(authController.resetPassword.bind(authController)));

// Public route without strict rate limiting
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

// Protected routes
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));
router.get('/me', authenticate, asyncHandler(authController.getMe.bind(authController)));

export default router;
