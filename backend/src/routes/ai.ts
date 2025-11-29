import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();

router.use(authenticate);

router.post('/chat', asyncHandler(aiController.chat));
router.post('/tutor', asyncHandler(aiController.tutor));

export default router;
