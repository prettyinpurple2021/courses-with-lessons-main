import express from 'express';
import { adminUserController } from '../controllers/adminUserController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { asyncHandler } from '../middleware/errorHandler';

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
