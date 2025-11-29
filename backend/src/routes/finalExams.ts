import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as finalExamController from '../controllers/finalExamController.js';

const router = Router();

// All final exam routes require authentication
router.use(authenticate);

// GET /api/courses/:courseId/final-exam - Get final exam details
router.get('/:courseId/final-exam', asyncHandler(finalExamController.getFinalExam));

// POST /api/courses/:courseId/final-exam/submit - Submit final exam
router.post('/:courseId/final-exam/submit', asyncHandler(finalExamController.submitFinalExam));

// GET /api/courses/:courseId/final-exam/result - Get exam result
router.get('/:courseId/final-exam/result', asyncHandler(finalExamController.getExamResult));

// GET /api/courses/:courseId/final-exam/unlock - Check if exam is unlocked
router.get('/:courseId/final-exam/unlock', asyncHandler(finalExamController.checkExamUnlock));

export default router;
