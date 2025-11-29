import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { param, body } from 'express-validator';
import * as contentGenerationController from '../controllers/adminContentGenerationController.js';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * Generate a single activity for a lesson
 */
router.post(
  '/lessons/:lessonId/generate-activity',
  validate([
    param('lessonId').isUUID().withMessage('Valid lesson ID is required'),
    body('activityType').isIn(['quiz', 'exercise', 'practical_task', 'reflection']).withMessage('Valid activity type is required'),
    body('activityNumber').isInt({ min: 1 }).withMessage('Activity number must be a positive integer'),
    body('position').optional().isIn(['opening', 'mid', 'closing']).withMessage('Position must be opening, mid, or closing'),
  ]),
  asyncHandler(contentGenerationController.generateActivity)
);

/**
 * Generate multiple activities for a lesson (full lesson plan)
 */
router.post(
  '/lessons/:lessonId/generate-activities',
  validate([
    param('lessonId').isUUID().withMessage('Valid lesson ID is required'),
    body('activityPlan').optional().isArray().withMessage('Activity plan must be an array'),
    body('dryRun').optional().isBoolean().withMessage('Dry run must be a boolean'),
  ]),
  asyncHandler(contentGenerationController.generateLessonActivities)
);

/**
 * Generate activities for all lessons in a course
 */
router.post(
  '/courses/:courseId/generate-activities',
  validate([
    param('courseId').isUUID().withMessage('Valid course ID is required'),
    body('dryRun').optional().isBoolean().withMessage('Dry run must be a boolean'),
  ]),
  asyncHandler(contentGenerationController.generateCourseActivities)
);

export default router;

