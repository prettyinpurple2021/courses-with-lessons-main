import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as finalProjectController from '../controllers/finalProjectController.js';

const router = Router();

// All final project routes require authentication
router.use(authenticate);

// GET /api/courses/:courseId/final-project - Get final project details
router.get('/:courseId/final-project', asyncHandler(finalProjectController.getFinalProject));

// POST /api/courses/:courseId/final-project/submit - Submit final project
router.post('/:courseId/final-project/submit', asyncHandler(finalProjectController.submitFinalProject));

// GET /api/courses/:courseId/final-project/status - Get submission status
router.get('/:courseId/final-project/status', asyncHandler(finalProjectController.getSubmissionStatus));

export default router;
