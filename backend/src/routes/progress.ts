import { Router } from 'express';
import * as progressController from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// All progress routes require authentication
router.use(authenticate);

// Update lesson progress
router.put('/lessons/:lessonId', asyncHandler(progressController.updateLessonProgress));

// Batch update progress
router.post('/batch', asyncHandler(progressController.batchUpdateProgress));

// Get all user progress
router.get('/', asyncHandler(progressController.getUserProgress));

// Get progress summary
router.get('/summary', asyncHandler(progressController.getProgressSummary));

// Sync progress across devices
router.post('/sync', asyncHandler(progressController.syncProgress));

// Get last accessed lesson
router.get('/last-accessed', asyncHandler(progressController.getLastAccessedLesson));

export default router;
