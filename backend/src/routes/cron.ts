import { Router } from 'express';
import {
  verifyCronSecret,
  processWebhooks,
  syncIntelAcademy,
  cleanupWebhooks,
} from '../controllers/cronController.js';

const router = Router();

// All cron routes require authentication via CRON_SECRET
router.use(verifyCronSecret);

// Process queued webhooks (run every minute)
router.get('/process-webhooks', processWebhooks);

// Sync all Intel Academy integrations (run daily)
router.get('/sync-intel-academy', syncIntelAcademy);

// Clean up old webhook events (run daily)
router.get('/cleanup-webhooks', cleanupWebhooks);

export default router;

