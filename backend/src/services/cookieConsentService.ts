import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentData {
  preferences: CookiePreferences;
  version: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class CookieConsentService {
  /**
   * Store cookie consent in database
   * Creates audit trail for GDPR compliance
   */
  async storeConsent(data: CookieConsentData): Promise<void> {
    try {
      await prisma.cookieConsent.create({
        data: {
          userId: data.userId || null,
          sessionId: data.sessionId || null,
          preferences: data.preferences as any,
          version: data.version || '1.0',
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          timestamp: new Date(),
        },
      });

      logger.info('Cookie consent stored', {
        userId: data.userId,
        sessionId: data.sessionId,
        version: data.version,
      });
    } catch (error) {
      logger.error('Failed to store cookie consent', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.userId,
        sessionId: data.sessionId,
      });
      throw error;
    }
  }

  /**
   * Get latest consent for a user
   */
  async getLatestConsent(userId?: string, sessionId?: string): Promise<CookieConsentData | null> {
    try {
      const consent = await prisma.cookieConsent.findFirst({
        where: {
          ...(userId ? { userId } : {}),
          ...(sessionId ? { sessionId } : {}),
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (!consent) {
        return null;
      }

      return {
        preferences: consent.preferences as CookiePreferences,
        version: consent.version,
        userId: consent.userId || undefined,
        sessionId: consent.sessionId || undefined,
        ipAddress: consent.ipAddress || undefined,
        userAgent: consent.userAgent || undefined,
      };
    } catch (error) {
      logger.error('Failed to get cookie consent', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        sessionId,
      });
      return null;
    }
  }

  /**
   * Check if user has given consent for analytics
   */
  async hasAnalyticsConsent(userId?: string, sessionId?: string): Promise<boolean> {
    const consent = await this.getLatestConsent(userId, sessionId);
    return consent?.preferences.analytics ?? false;
  }

  /**
   * Check if user has given consent for marketing
   */
  async hasMarketingConsent(userId?: string, sessionId?: string): Promise<boolean> {
    const consent = await this.getLatestConsent(userId, sessionId);
    return consent?.preferences.marketing ?? false;
  }

  /**
   * Delete all consent records for a user (GDPR right to be forgotten)
   */
  async deleteUserConsent(userId: string): Promise<void> {
    try {
      await prisma.cookieConsent.deleteMany({
        where: {
          userId,
        },
      });

      logger.info('Cookie consent deleted for user', { userId });
    } catch (error) {
      logger.error('Failed to delete cookie consent', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete consent by session ID (for anonymous users)
   */
  async deleteSessionConsent(sessionId: string): Promise<void> {
    try {
      await prisma.cookieConsent.deleteMany({
        where: {
          sessionId,
        },
      });

      logger.info('Cookie consent deleted for session', { sessionId });
    } catch (error) {
      logger.error('Failed to delete session cookie consent', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
      });
      throw error;
    }
  }
}

export const cookieConsentService = new CookieConsentService();

