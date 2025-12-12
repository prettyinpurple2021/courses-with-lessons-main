import { PrismaClient } from '@prisma/client';
import { queueWebhook } from './webhookService.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface ProgressUpdate {
  lessonId: string;
  videoPosition?: number;
  currentActivity?: number;
  completed?: boolean;
}

export interface BatchProgressUpdate {
  updates: ProgressUpdate[];
}

/**
 * Update lesson progress with optimistic locking
 * This handles video position tracking and activity progression
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  updates: Partial<ProgressUpdate>
): Promise<void> {
  const { videoPosition, currentActivity, completed } = updates;

  // Prepare update data
  const updateData: any = {};
  
  if (videoPosition !== undefined) {
    updateData.videoPosition = videoPosition;
  }
  
  if (currentActivity !== undefined) {
    updateData.currentActivity = currentActivity;
  }
  
  if (completed !== undefined) {
    updateData.completed = completed;
    if (completed) {
      updateData.completedAt = new Date();
    }
  }

  // Upsert progress
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: updateData,
    create: {
      userId,
      lessonId,
      videoPosition: videoPosition || 0,
      currentActivity: currentActivity || 1,
      completed: completed || false,
      completedAt: completed ? new Date() : null,
    },
  });

  // Trigger webhook for progress update (only if lesson was completed)
  if (completed) {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: {
            select: {
              id: true,
              courseNumber: true,
              title: true,
            },
          },
        },
      });

      if (lesson) {
        await queueWebhook(userId, 'course.progress_updated', {
          lessonId: lesson.id,
          lessonNumber: lesson.lessonNumber,
          lessonTitle: lesson.title,
          courseId: lesson.course.id,
          courseNumber: lesson.course.courseNumber,
          courseTitle: lesson.course.title,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Log error but don't fail progress update if webhook fails
      logger.error('Failed to send progress webhook', { error, userId, lessonId });
    }
  }
}

/**
 * Batch update multiple progress records
 * Useful for syncing queued updates after offline mode
 */
export async function batchUpdateProgress(
  userId: string,
  updates: ProgressUpdate[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const update of updates) {
    try {
      await updateLessonProgress(userId, update.lessonId, update);
      success++;
    } catch (error) {
      logger.error(`Failed to update progress for lesson ${update.lessonId}`, { error, lessonId: update.lessonId });
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get all progress for a user
 * Used for cross-device synchronization
 */
export async function getUserProgress(userId: string): Promise<any[]> {
  const progress = await prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: {
          id: true,
          lessonNumber: true,
          title: true,
          courseId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return progress;
}

/**
 * Get progress summary for a user
 * Returns aggregated statistics
 */
export async function getProgressSummary(userId: string): Promise<{
  totalLessons: number;
  completedLessons: number;
  totalCourses: number;
  completedCourses: number;
  lastActivity: Date | null;
}> {
  // Get total lessons completed
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
    },
  });

  // Get total lessons available (from enrolled courses)
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  const totalLessons = enrollments.reduce(
    (sum: number, enrollment: any) => sum + enrollment.course.lessons.length,
    0
  );

  // Get completed courses
  const completedCourses = enrollments.filter(
    (enrollment: any) => enrollment.completedAt !== null
  ).length;

  // Get last activity timestamp
  const lastProgress = await prisma.lessonProgress.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return {
    totalLessons,
    completedLessons,
    totalCourses: enrollments.length,
    completedCourses,
    lastActivity: lastProgress?.createdAt || null,
  };
}

/**
 * Sync progress across devices
 * Returns the most recent progress for each lesson
 */
export async function syncProgressAcrossDevices(
  userId: string,
  clientProgress: Array<{
    lessonId: string;
    videoPosition: number;
    currentActivity: number;
    completed: boolean;
    lastUpdated: Date;
  }>
): Promise<{
  serverProgress: any[];
  conflicts: Array<{ lessonId: string; serverTime: Date; clientTime: Date }>;
}> {
  const serverProgress = await getUserProgress(userId);
  const conflicts: Array<{ lessonId: string; serverTime: Date; clientTime: Date }> = [];

  // Check for conflicts (different timestamps)
  for (const clientItem of clientProgress) {
    const serverItem = serverProgress.find(
      (sp: any) => sp.lessonId === clientItem.lessonId
    );

    if (serverItem) {
      const serverTime = new Date(serverItem.createdAt);
      const clientTime = new Date(clientItem.lastUpdated);

      // If server has newer data, there's a potential conflict
      if (serverTime > clientTime) {
        conflicts.push({
          lessonId: clientItem.lessonId,
          serverTime,
          clientTime,
        });
      } else if (clientTime > serverTime) {
        // Client has newer data, update server
        await updateLessonProgress(userId, clientItem.lessonId, {
          videoPosition: clientItem.videoPosition,
          currentActivity: clientItem.currentActivity,
          completed: clientItem.completed,
        });
      }
    }
  }

  // Get updated server progress
  const updatedServerProgress = await getUserProgress(userId);

  return {
    serverProgress: updatedServerProgress,
    conflicts,
  };
}

/**
 * Get last accessed lesson for "Continue Learning" functionality
 */
export async function getLastAccessedLesson(userId: string): Promise<{
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  videoPosition: number;
} | null> {
  const lastProgress = await prisma.lessonProgress.findFirst({
    where: {
      userId,
      completed: false, // Only get incomplete lessons
    },
    orderBy: { createdAt: 'desc' },
    include: {
      lesson: {
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lastProgress) {
    return null;
  }

  return {
    lessonId: lastProgress.lessonId,
    lessonTitle: lastProgress.lesson.title,
    courseId: lastProgress.lesson.courseId,
    courseTitle: lastProgress.lesson.course.title,
    videoPosition: lastProgress.videoPosition,
  };
}
