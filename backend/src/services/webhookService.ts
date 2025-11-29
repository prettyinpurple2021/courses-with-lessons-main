import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface WebhookPayload {
  eventType: string;
  userId: string;
  timestamp: string;
  data: any;
}

/**
 * Generate HMAC SHA-256 signature for webhook payload
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Send webhook to SoloSuccess AI
 */
export async function sendWebhookToSoloSuccess(
  intelAcademyUserId: string,
  eventType: string,
  payload: any
): Promise<void> {
  try {
    // Find integration to get webhook URL and secret
    const integration = await prisma.soloSuccessIntegration.findUnique({
      where: { userId: intelAcademyUserId },
      include: {
        oauthClient: {
          select: {
            webhookUrl: true,
            webhookSecret: true,
            isActive: true,
          },
        },
      },
    });

    if (!integration || !integration.isActive) {
      logger.warn('Integration not found or inactive, skipping webhook', {
        intelAcademyUserId,
        eventType,
      });
      return;
    }

    if (!integration.oauthClient.isActive) {
      logger.warn('OAuth client not active, skipping webhook', {
        intelAcademyUserId,
        eventType,
      });
      return;
    }

    const webhookUrl = integration.oauthClient.webhookUrl;
    const webhookSecret = integration.oauthClient.webhookSecret;

    if (!webhookUrl) {
      logger.warn('Webhook URL not configured, skipping webhook', {
        intelAcademyUserId,
        eventType,
      });
      return;
    }

    if (!webhookSecret) {
      logger.warn('Webhook secret not configured, skipping webhook', {
        intelAcademyUserId,
        eventType,
      });
      return;
    }

    // Prepare webhook payload
    const webhookPayload: WebhookPayload = {
      eventType,
      userId: integration.solosuccessUserId,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    // Convert payload to JSON string
    const payloadString = JSON.stringify(webhookPayload);

    // Generate HMAC signature
    const signature = generateWebhookSignature(payloadString, webhookSecret);

    // Send webhook
    try {
      const response = await axios.post(webhookUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event-Type': eventType,
        },
        timeout: 10000, // 10 second timeout
      });

      logger.info('Webhook sent successfully', {
        intelAcademyUserId,
        eventType,
        status: response.status,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Log error but don't throw (non-blocking)
      logger.error('Failed to send webhook', {
        intelAcademyUserId,
        eventType,
        webhookUrl,
        status: axiosError.response?.status,
        message: axiosError.message,
      });
      
      // In production, queue for retry
      // For now, just log the error
      throw error; // Re-throw to let caller handle retry logic
    }
  } catch (error) {
    logger.error('Error sending webhook', {
      intelAcademyUserId,
      eventType,
      error,
    });
    throw error;
  }
}

/**
 * Queue webhook for async processing (for high-volume events)
 * Uses Redis if available, otherwise in-memory queue
 */
export async function queueWebhook(
  intelAcademyUserId: string,
  eventType: string,
  payload: any
): Promise<void> {
  try {
    // Try to use Redis if available
    const { getRedisClient } = await import('../config/redis.js');
    const redis = getRedisClient();
    
    if (redis) {
      try {
        const queueKey = `webhook:queue:${intelAcademyUserId}`;
        const webhookData = {
          intelAcademyUserId,
          eventType,
          payload,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        };
        
        await redis.lPush(queueKey, JSON.stringify(webhookData));
        await redis.expire(queueKey, 86400); // Expire after 24 hours
        
        logger.info('Webhook queued in Redis', {
          intelAcademyUserId,
          eventType,
        });
        return;
      } catch (redisError) {
        logger.warn('Redis operation failed, sending webhook synchronously', {
          error: redisError,
        });
      }
    }
  } catch (error) {
    logger.warn('Redis not available, sending webhook synchronously', {
      error,
    });
  }
  
  // Fallback: send synchronously
  try {
    await sendWebhookToSoloSuccess(intelAcademyUserId, eventType, payload);
  } catch (error) {
    // Log error but don't throw (non-blocking)
    logger.error('Failed to send webhook synchronously', {
      intelAcademyUserId,
      eventType,
      error,
    });
  }
}

/**
 * Process queued webhooks (for cron job)
 */
export async function processQueuedWebhooks(): Promise<{
  processed: number;
  failed: number;
}> {
  let processed = 0;
  let failed = 0;

  try {
    const { getRedisClient } = await import('../config/redis.js');
    const redis = getRedisClient();
    
    if (!redis) {
      logger.warn('Redis not available, cannot process queued webhooks');
      return { processed: 0, failed: 0 };
    }

    // Get all users with active integrations
    const integrations = await prisma.soloSuccessIntegration.findMany({
      where: { isActive: true },
      select: { userId: true },
    });

    for (const integration of integrations) {
      const queueKey = `webhook:queue:${integration.userId}`;
      
      // Process up to 10 webhooks per user
      for (let i = 0; i < 10; i++) {
        const webhookDataStr = await redis.rPop(queueKey);
        
        if (!webhookDataStr) {
          break; // No more webhooks for this user
        }

        try {
          const webhookData = JSON.parse(webhookDataStr);
          
          // Send webhook with retry logic
          let success = false;
          let retryCount = webhookData.retryCount || 0;
          const maxRetries = 3;

          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              await sendWebhookToSoloSuccess(
                webhookData.intelAcademyUserId,
                webhookData.eventType,
                webhookData.payload
              );
              success = true;
              break;
            } catch (error) {
              retryCount++;
              if (retryCount >= maxRetries) {
                throw error; // Max retries reached
              }
              // Exponential backoff
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, attempt) * 1000)
              );
            }
          }

          if (success) {
            processed++;
          } else {
            failed++;
            logger.error('Webhook failed after max retries', {
              intelAcademyUserId: webhookData.intelAcademyUserId,
              eventType: webhookData.eventType,
            });
          }
        } catch (error) {
          failed++;
          logger.error('Error processing queued webhook', {
            error,
            webhookData: webhookDataStr,
          });
        }
      }
    }

    logger.info('Queued webhooks processed', {
      processed,
      failed,
    });
  } catch (error) {
    logger.error('Error processing queued webhooks', { error });
  }

  return { processed, failed };
}

/**
 * Clean up old webhook queue entries (for cron job)
 * Removes webhook queue entries older than 7 days
 */
export async function cleanupOldWebhooks(): Promise<{
  cleaned: number;
}> {
  let cleaned = 0;

  try {
    const { getRedisClient } = await import('../config/redis.js');
    const redis = getRedisClient();
    
    if (!redis) {
      logger.warn('Redis not available, cannot cleanup old webhooks');
      return { cleaned: 0 };
    }

    // Get all users with active integrations
    const integrations = await prisma.soloSuccessIntegration.findMany({
      where: { isActive: true },
      select: { userId: true },
    });

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const integration of integrations) {
      const queueKey = `webhook:queue:${integration.userId}`;
      
      // Get all webhooks for this user
      const webhookDataStrs = await redis.lRange(queueKey, 0, -1);
      
      for (const webhookDataStr of webhookDataStrs) {
        try {
          const webhookData = JSON.parse(webhookDataStr);
          const webhookTimestamp = new Date(webhookData.timestamp).getTime();
          
          // Remove if older than 7 days
          if (webhookTimestamp < sevenDaysAgo) {
            await redis.lRem(queueKey, 1, webhookDataStr);
            cleaned++;
          }
        } catch (error) {
          // If parsing fails, remove the entry
          await redis.lRem(queueKey, 1, webhookDataStr);
          cleaned++;
        }
      }
    }

    logger.info('Old webhooks cleaned up', {
      cleaned,
    });
  } catch (error) {
    logger.error('Error cleaning up old webhooks', { error });
  }

  return { cleaned };
}

