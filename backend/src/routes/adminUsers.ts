import express from 'express';
import { adminUserController } from '../controllers/adminUserController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get('/users', asyncHandler(adminUserController.getAllUsers));
router.get('/users/:userId', asyncHandler(adminUserController.getUserById));
router.get('/users/:userId/progress', asyncHandler(adminUserController.getUserProgress));
router.get('/users/:userId/activities', asyncHandler(adminUserController.getUserActivityStatus));
router.post('/users/:userId/unlock-course', asyncHandler(adminUserController.unlockCourse));
router.post('/users/:userId/unlock-lesson', asyncHandler(adminUserController.unlockLesson));
router.put('/users/:userId/role', asyncHandler(adminUserController.updateUserRole));
router.delete('/users/:userId', asyncHandler(adminUserController.deleteUser));

export default router;
