import { Request, Response } from 'express';
import { processQueuedWebhooks, cleanupOldWebhooks } from '../services/webhookService.js';
import { syncAllIntegrations } from '../services/subscriptionSyncService.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to verify cron secret
 */
export function verifyCronSecret(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error('CRON_SECRET not configured');
    return res.status(500).json({ error: 'Cron authentication not configured' });
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron job attempt', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

/**
 * Process queued webhooks
 * GET /api/cron/process-webhooks
 */
export async function processWebhooks(req: Request, res: Response) {
  try {
    const result = await processQueuedWebhooks();
    
    logger.info('Cron: Webhooks processed', result);
    
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Cron: Error processing webhooks', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to process webhooks',
    });
  }
}

/**
 * Sync all Intel Academy integrations
 * GET /api/cron/sync-intel-academy
 */
export async function syncIntelAcademy(req: Request, res: Response) {
  try {
    const result = await syncAllIntegrations();
    
    logger.info('Cron: Integrations synced', result);
    
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Cron: Error syncing integrations', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to sync integrations',
    });
  }
}

/**
 * Clean up old webhook events
 * GET /api/cron/cleanup-webhooks
 */
export async function cleanupWebhooks(req: Request, res: Response) {
  try {
    const result = await cleanupOldWebhooks();
    
    logger.info('Cron: Webhooks cleaned up', result);
    
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Cron: Error cleaning up webhooks', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to cleanup webhooks',
    });
  }
}

