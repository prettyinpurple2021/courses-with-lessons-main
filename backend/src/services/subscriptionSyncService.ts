import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Map subscription tier to unlocked courses count
 * free → Courses 1-2 (Basic/Introductory)
 * accelerator → Courses 1-4 (Premium/Standard)
 * premium → Courses 1-7 (Enterprise/Full Access)
 */
export function getUnlockedCoursesForTier(tier: string): number {
  const tierMapping: Record<string, number> = {
    free: 2,        // Basic: Courses 1-2
    accelerator: 4, // Premium: Courses 1-4
    premium: 7,     // Enterprise: All courses 1-7
  };
  
  return tierMapping[tier.toLowerCase()] || 1; // Default to course 1 only
}

/**
 * Sync subscription tier to course access levels
 */
export async function syncSubscriptionTier(
  intelAcademyUserId: string,
  tier: string
): Promise<void> {
  const unlockedCourses = getUnlockedCoursesForTier(tier);
  
  // Update all enrollments to reflect new access level
  await prisma.enrollment.updateMany({
    where: { userId: intelAcademyUserId },
    data: { unlockedCourses },
  });
  
  // If user has no enrollments, create enrollment for Course One
  // Use upsert to handle race conditions where multiple concurrent calls
  // might try to create the same enrollment
  const courseOne = await prisma.course.findFirst({
    where: { courseNumber: 1 },
  });
  
  if (courseOne) {
    try {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: intelAcademyUserId,
            courseId: courseOne.id,
          },
        },
        create: {
          userId: intelAcademyUserId,
          courseId: courseOne.id,
          currentLesson: 1,
          unlockedCourses,
        },
        update: {
          // Update unlockedCourses in case it changed
          unlockedCourses,
        },
      });
    } catch (error: any) {
      // Handle race condition: if enrollment was created by another concurrent call,
      // update it instead
      if (error.code === 'P2002') {
        // Unique constraint violation - enrollment already exists, update it
        await prisma.enrollment.update({
          where: {
            userId_courseId: {
              userId: intelAcademyUserId,
              courseId: courseOne.id,
            },
          },
          data: {
            unlockedCourses,
          },
        });
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  }
  
  logger.info('Subscription tier synced', {
    userId: intelAcademyUserId,
    tier,
    unlockedCourses,
  });
}

/**
 * Sync subscription tier for integration record
 * Note: This function only updates existing integrations.
 * New integrations should be created through the OAuth flow.
 */
export async function syncIntegrationSubscriptionTier(
  intelAcademyUserId: string,
  solosuccessUserId: string,
  tier: string
): Promise<void> {
  // Sync course access
  await syncSubscriptionTier(intelAcademyUserId, tier);
  
  // Check if integration exists
  const existingIntegration = await prisma.soloSuccessIntegration.findUnique({
    where: { userId: intelAcademyUserId },
  });
  
  if (existingIntegration) {
    // Update existing integration record
    await prisma.soloSuccessIntegration.update({
      where: { userId: intelAcademyUserId },
      data: {

        subscriptionTier: tier,
        lastSyncAt: new Date(),
        syncStatus: 'synced',
      },
    });
    
    logger.info('Integration subscription tier synced', {
      intelAcademyUserId,
      solosuccessUserId,
      tier,
    });
  } else {
    // Integration doesn't exist yet - it will be created when OAuth flow completes
    // For now, just log that we're skipping creation
    logger.info('Integration not found, skipping creation (will be created via OAuth flow)', {
      intelAcademyUserId,
      solosuccessUserId,
      tier,
    });
  }
}

/**
 * Sync all active integrations (for batch sync cron job)
 */
export async function syncAllIntegrations(): Promise<{
  success: number;
  failed: number;
}> {
  const integrations = await prisma.soloSuccessIntegration.findMany({
    where: { isActive: true },
    select: {
      userId: true,
      solosuccessUserId: true,
      subscriptionTier: true,
    },
  });
  
  let success = 0;
  let failed = 0;
  
  for (const integration of integrations) {
    try {
      await syncSubscriptionTier(integration.userId, integration.subscriptionTier);
      
      // Update lastSyncAt
      await prisma.soloSuccessIntegration.update({
        where: { userId: integration.userId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'synced',
        },
      });
      
      success++;
    } catch (error) {
      logger.error('Failed to sync integration', {
        userId: integration.userId,
        error,
      });
      
      // Update sync status to error
      await prisma.soloSuccessIntegration.update({
        where: { userId: integration.userId },
        data: {
          syncStatus: 'error',
        },
      });
      
      failed++;
    }
  }
  
  logger.info('Batch sync completed', {
    total: integrations.length,
    success,
    failed,
  });
  
  return { success, failed };
}

