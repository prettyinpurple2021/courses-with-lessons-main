import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as courseController from '../controllers/courseController.js';

const router = Router();

// All course routes require authentication
router.use(authenticate);

// GET /api/courses - List all courses with lock status
router.get('/', asyncHandler(courseController.getAllCourses));

// GET /api/courses/:id - Get course details
router.get('/:id', asyncHandler(courseController.getCourseById));

// GET /api/courses/:id/can-access - Check if user can access course
router.get('/:id/can-access', asyncHandler(courseController.checkCourseAccess));

// POST /api/courses/:id/enroll - Enroll in course
router.post('/:id/enroll', asyncHandler(courseController.enrollInCourse));

// POST /api/courses/:id/unlock-next - Unlock next course
router.post('/:id/unlock-next', asyncHandler(courseController.unlockNextCourse));

export default router;
