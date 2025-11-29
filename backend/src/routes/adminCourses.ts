import { Router } from 'express';
import { adminCourseController } from '../controllers/adminCourseController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { body, param } from 'express-validator';

const router = Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

/**
 * Course management routes
 */

// Get all courses
router.get('/courses', asyncHandler(adminCourseController.getAllCourses));

// Get course by ID
router.get('/courses/:id', asyncHandler(adminCourseController.getCourseById));

// Create course
router.post(
  '/courses',
  validate([
    body('courseNumber').isInt({ min: 1, max: 7 }).withMessage('Course number must be between 1 and 7'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('thumbnail').isURL().withMessage('Valid thumbnail URL is required'),
    body('published').optional().isBoolean(),
  ]),
  asyncHandler(adminCourseController.createCourse)
);

// Update course
router.put(
  '/courses/:id',
  validate([
    param('id').isUUID().withMessage('Valid course ID is required'),
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('thumbnail').optional().isURL(),
    body('published').optional().isBoolean(),
  ]),
  asyncHandler(adminCourseController.updateCourse)
);

// Delete course
router.delete(
  '/courses/:id',
  validate([param('id').isUUID().withMessage('Valid course ID is required')]),
  asyncHandler(adminCourseController.deleteCourse)
);

/**
 * Lesson management routes
 */

// Get all lessons for a course
router.get(
  '/courses/:courseId/lessons',
  validate([param('courseId').isUUID().withMessage('Valid course ID is required')]),
  asyncHandler(adminCourseController.getCourseLessons)
);

// Create lesson
router.post(
  '/courses/:courseId/lessons',
  validate([
    param('courseId').isUUID().withMessage('Valid course ID is required'),
    body('lessonNumber').isInt({ min: 1, max: 12 }).withMessage('Lesson number must be between 1 and 12'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('youtubeVideoId').notEmpty().withMessage('YouTube video ID is required'),
    body('duration').isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
  ]),
  asyncHandler(adminCourseController.createLesson)
);

// Update lesson
router.put(
  '/lessons/:lessonId',
  validate([
    param('lessonId').isUUID().withMessage('Valid lesson ID is required'),
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('youtubeVideoId').optional().notEmpty(),
    body('duration').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(adminCourseController.updateLesson)
);

// Delete lesson
router.delete(
  '/lessons/:lessonId',
  validate([param('lessonId').isUUID().withMessage('Valid lesson ID is required')]),
  asyncHandler(adminCourseController.deleteLesson)
);

// Validate YouTube video
router.get(
  '/youtube/validate/:videoId',
  validate([param('videoId').notEmpty().withMessage('Video ID is required')]),
  asyncHandler(adminCourseController.validateYouTubeVideo)
);

/**
 * Final project routes
 */

// Create final project
router.post(
  '/courses/:courseId/final-project',
  validate([
    param('courseId').isUUID().withMessage('Valid course ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('instructions').notEmpty().withMessage('Instructions are required'),
    body('requirements').isObject().withMessage('Requirements must be an object'),
  ]),
  asyncHandler(adminCourseController.createFinalProject)
);

// Update final project
router.put(
  '/final-projects/:projectId',
  validate([
    param('projectId').isUUID().withMessage('Valid project ID is required'),
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('instructions').optional().notEmpty(),
    body('requirements').optional().isObject(),
  ]),
  asyncHandler(adminCourseController.updateFinalProject)
);

/**
 * Final exam routes
 */

// Create final exam
router.post(
  '/courses/:courseId/final-exam',
  validate([
    param('courseId').isUUID().withMessage('Valid course ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
    body('passingScore').isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  ]),
  asyncHandler(adminCourseController.createFinalExam)
);

// Update final exam
router.put(
  '/final-exams/:examId',
  validate([
    param('examId').isUUID().withMessage('Valid exam ID is required'),
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('timeLimit').optional().isInt({ min: 1 }),
    body('passingScore').optional().isInt({ min: 0, max: 100 }),
  ]),
  asyncHandler(adminCourseController.updateFinalExam)
);

/**
 * Activity management routes
 */

// Get all activities for a lesson
router.get(
  '/lessons/:lessonId/activities',
  validate([param('lessonId').isUUID().withMessage('Valid lesson ID is required')]),
  asyncHandler(adminCourseController.getLessonActivities)
);

// Create activity
router.post(
  '/lessons/:lessonId/activities',
  validate([
    param('lessonId').isUUID().withMessage('Valid lesson ID is required'),
    body('activityNumber').isInt({ min: 1 }).withMessage('Activity number must be a positive integer'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['quiz', 'exercise', 'reflection', 'practical_task']).withMessage('Invalid activity type'),
    body('content').isObject().withMessage('Content must be an object'),
    body('required').optional().isBoolean(),
  ]),
  asyncHandler(adminCourseController.createActivity)
);

// Update activity
router.put(
  '/activities/:activityId',
  validate([
    param('activityId').isUUID().withMessage('Valid activity ID is required'),
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('type').optional().isIn(['quiz', 'exercise', 'reflection', 'practical_task']),
    body('content').optional().isObject(),
    body('required').optional().isBoolean(),
  ]),
  asyncHandler(adminCourseController.updateActivity)
);

// Delete activity
router.delete(
  '/activities/:activityId',
  validate([param('activityId').isUUID().withMessage('Valid activity ID is required')]),
  asyncHandler(adminCourseController.deleteActivity)
);

export default router;
