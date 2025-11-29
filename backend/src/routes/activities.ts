import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as activityController from '../controllers/activityController.js';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

// GET /api/activities/:id - Get activity details
router.get('/:id', asyncHandler(activityController.getActivityById));

// POST /api/activities/:id/submit - Submit activity response
router.post('/:id/submit', asyncHandler(activityController.submitActivity));

// GET /api/activities/:id/unlock - Check if user can access activity
router.get('/:id/unlock', asyncHandler(activityController.checkActivityAccess));

export default router;
