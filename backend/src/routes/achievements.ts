import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as achievementController from '../controllers/achievementController.js';

const router = Router();

// All achievement routes require authentication
router.use(authenticate);

// GET /api/achievements - Get all achievements for current user
router.get('/', asyncHandler(achievementController.getUserAchievements));

// GET /api/achievements/definitions - Get all achievement definitions
router.get('/definitions', asyncHandler(achievementController.getAchievementDefinitions));

// POST /api/achievements/:id/unlock - Manually trigger achievement unlock (for testing)
router.post('/:id/unlock', asyncHandler(achievementController.unlockAchievement));

export default router;

