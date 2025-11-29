import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// All user routes require authentication
router.get('/me/profile', authenticate, asyncHandler((req, res) => userController.getProfile(req, res)));
router.get('/me/statistics', authenticate, asyncHandler((req, res) => userController.getStatistics(req, res)));
router.put('/me', authenticate, asyncHandler((req, res) => userController.updateProfile(req, res)));
router.put('/me/avatar', authenticate, asyncHandler((req, res) => userController.updateAvatar(req, res)));
router.put('/me/password', authenticate, asyncHandler((req, res) => userController.changePassword(req, res)));
router.put('/me/notifications', authenticate, asyncHandler((req, res) => userController.updateNotificationPreferences(req, res)));
router.delete('/me', authenticate, asyncHandler((req, res) => userController.deleteAccount(req, res)));

export default router;
