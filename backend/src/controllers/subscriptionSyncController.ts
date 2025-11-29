import { Request, Response, NextFunction } from 'express';
import {
  syncIntegrationSubscriptionTier,
  syncAllIntegrations,
} from '../services/subscriptionSyncService.js';
import { ValidationError } from '../utils/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionSyncController {
  /**
   * POST /api/integrations/solo-success/sync-subscription
   * Sync subscription tier for a user (called by SoloSuccess AI when subscription changes)
   * Requires API key authentication or OAuth token
   */
  async syncSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, solosuccessUserId, tier } = req.body;

      if (!userId || !solosuccessUserId || !tier) {
        throw new ValidationError('userId, solosuccessUserId, and tier are required');
      }

      // Validate tier
      const validTiers = ['free', 'accelerator', 'premium'];
      if (!validTiers.includes(tier.toLowerCase())) {
        throw new ValidationError(`Invalid tier. Must be one of: ${validTiers.join(', ')}`);
      }

      // Sync subscription tier
      await syncIntegrationSubscriptionTier(userId, solosuccessUserId, tier);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Subscription tier synced successfully',
          userId,
          tier,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/integrations/solo-success/sync-all
   * Batch sync all active integrations (for cron job)
   * Requires CRON_SECRET authentication
   */
  async syncAll(req: Request, res: Response, next: NextFunction) {
    try {
      // Verify cron secret
      const cronSecret = req.headers.authorization?.replace('Bearer ', '');
      const expectedSecret = process.env.CRON_SECRET;

      if (!expectedSecret || cronSecret !== expectedSecret) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid cron secret',
            code: 'UNAUTHORIZED',
          },
        });
      }

      // Sync all integrations
      const result = await syncAllIntegrations();

      return res.status(200).json({
        success: true,
        data: {
          message: 'Batch sync completed',
          total: result.success + result.failed,
          success: result.success,
          failed: result.failed,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/integrations/solo-success/status/:userId
   * Get integration status for a user
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const integration = await prisma.soloSuccessIntegration.findUnique({
        where: { userId },
        include: {
          oauthClient: {
            select: {
              name: true,
              clientId: true,
            },
          },
        },
      });

      if (!integration) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Integration not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          integration: {
            userId: integration.userId,
            solosuccessUserId: integration.solosuccessUserId,
            subscriptionTier: integration.subscriptionTier,
            isActive: integration.isActive,
            syncStatus: integration.syncStatus,
            lastSyncAt: integration.lastSyncAt?.toISOString() || null,
            oauthClient: integration.oauthClient ? {
              name: integration.oauthClient.name,
              clientId: integration.oauthClient.clientId,
            } : null,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const subscriptionSyncController = new SubscriptionSyncController();

