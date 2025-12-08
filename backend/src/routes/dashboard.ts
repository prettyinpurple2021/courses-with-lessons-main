
import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get recent lessons
router.get('/recent-lessons', authenticate, dashboardController.getRecentLessons);

// Get achievements
router.get('/achievements', authenticate, dashboardController.getAchievements);

export default router;
