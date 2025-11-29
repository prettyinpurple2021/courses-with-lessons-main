import { PrismaClient } from '@prisma/client';
import { queueWebhook } from './webhookService.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  checkFunction: (userId: string) => Promise<boolean>;
}

/**
 * Achievement definitions
 */
const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '👣',
    rarity: 'common',
    checkFunction: async (userId: string) => {
      const completedLessons = await prisma.lessonProgress.count({
        where: {
          userId,
          completed: true,
        },
      });
      return completedLessons >= 1;
    },
  },
  {
    id: 'course-starter',
    title: 'Course Starter',
    description: 'Enroll in your first course',
    icon: '🎯',
    rarity: 'common',
    checkFunction: async (userId: string) => {
      const enrollments = await prisma.enrollment.count({
        where: { userId },
      });
      return enrollments >= 1;
    },
  },
  {
    id: 'dedicated-learner',
    title: 'Dedicated Learner',
    description: 'Complete 5 lessons in a row',
    icon: '🔥',
    rarity: 'rare',
    checkFunction: async (userId: string) => {
      // Get all completed lessons ordered by completion date
      const completedLessons = await prisma.lessonProgress.findMany({
        where: {
          userId,
          completed: true,
        },
        orderBy: {
          completedAt: 'asc',
        },
        include: {
          lesson: {
            select: {
              courseId: true,
              lessonNumber: true,
            },
          },
        },
      });

      if (completedLessons.length < 5) {
        return false;
      }

      // Check for 5 consecutive lessons in the same course
      for (let i = 0; i <= completedLessons.length - 5; i++) {
        const sequence = completedLessons.slice(i, i + 5);
        const courseId = sequence[0].lesson.courseId;
        const firstLessonNumber = sequence[0].lesson.lessonNumber;

        // Check if all 5 are in the same course and consecutive
        const isConsecutive = sequence.every((progress, index) => {
          return (
            progress.lesson.courseId === courseId &&
            progress.lesson.lessonNumber === firstLessonNumber + index
          );
        });

        if (isConsecutive) {
          return true;
        }
      }

      return false;
    },
  },
  {
    id: 'course-conqueror',
    title: 'Course Conqueror',
    description: 'Complete your first course',
    icon: '🎓',
    rarity: 'epic',
    checkFunction: async (userId: string) => {
      const completedCourses = await prisma.enrollment.count({
        where: {
          userId,
          completedAt: { not: null },
        },
      });
      return completedCourses >= 1;
    },
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Score 100% on a final exam',
    icon: '⭐',
    rarity: 'epic',
    checkFunction: async (userId: string) => {
      const examResults = await prisma.finalExamResult.findMany({
        where: {
          userId,
          passed: true,
        },
      });

      // Check if any exam has 100% score (score is stored as percentage)
      return examResults.some((result) => result.score === 100);
    },
  },
  {
    id: 'boss-commander',
    title: 'Boss Commander',
    description: 'Complete all 7 courses',
    icon: '💎',
    rarity: 'legendary',
    checkFunction: async (userId: string) => {
      const totalCourses = await prisma.course.count();
      const completedCourses = await prisma.enrollment.count({
        where: {
          userId,
          completedAt: { not: null },
        },
      });
      return completedCourses >= totalCourses;
    },
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete a course in under 2 weeks',
    icon: '⚡',
    rarity: 'rare',
    checkFunction: async (userId: string) => {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId,
          completedAt: { not: null },
        },
        select: {
          enrolledAt: true,
          completedAt: true,
        },
      });

      const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

      for (const enrollment of enrollments) {
        if (enrollment.completedAt && enrollment.enrolledAt) {
          const timeDiff =
            enrollment.completedAt.getTime() - enrollment.enrolledAt.getTime();
          if (timeDiff <= twoWeeksInMs) {
            return true;
          }
        }
      }

      return false;
    },
  },
];

/**
 * Check if user already has an achievement
 */
async function hasAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  const achievement = await prisma.achievement.findFirst({
    where: {
      userId,
      title: ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId)?.title,
    },
  });
  return !!achievement;
}

/**
 * Unlock an achievement for a user
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<{ unlocked: boolean; achievement: any } | null> {
  const definition = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
  if (!definition) {
    logger.warn(`Unknown achievement ID: ${achievementId}`);
    return null;
  }

  // Check if already unlocked
  if (await hasAchievement(userId, achievementId)) {
    return null;
  }

  // Check if user qualifies
  const qualifies = await definition.checkFunction(userId);
  if (!qualifies) {
    return null;
  }

  // Create achievement
  const achievement = await prisma.achievement.create({
    data: {
      userId,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      rarity: definition.rarity,
    },
  });

  logger.info(`Achievement unlocked: ${definition.title} for user ${userId}`);

  // Trigger webhook for achievement earned
  try {
    await queueWebhook(userId, 'achievement.earned', {
      achievementId: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      unlockedAt: achievement.unlockedAt.toISOString(),
    });
  } catch (error) {
    logger.error('Failed to send achievement webhook:', error);
    // Don't fail achievement unlock if webhook fails
  }

  return {
    unlocked: true,
    achievement,
  };
}

/**
 * Check and unlock achievements for a user based on a specific trigger
 */
export async function checkAndUnlockAchievements(
  userId: string,
  trigger: 'lesson_completed' | 'course_enrolled' | 'course_completed' | 'exam_submitted'
): Promise<Array<{ unlocked: boolean; achievement: any }>> {
  const unlocked: Array<{ unlocked: boolean; achievement: any }> = [];

  // Map triggers to relevant achievement IDs
  const triggerMap: Record<string, string[]> = {
    lesson_completed: ['first-steps', 'dedicated-learner'],
    course_enrolled: ['course-starter'],
    course_completed: ['course-conqueror', 'speed-demon', 'boss-commander'],
    exam_submitted: ['perfect-score'],
  };

  const relevantAchievements = triggerMap[trigger] || [];

  for (const achievementId of relevantAchievements) {
    const result = await unlockAchievement(userId, achievementId);
    if (result) {
      unlocked.push(result);
    }
  }

  return unlocked;
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: string) {
  return await prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
  });
}

/**
 * Get achievement definitions (for frontend display)
 */
export function getAchievementDefinitions(): Omit<
  AchievementDefinition,
  'checkFunction'
>[] {
  return ACHIEVEMENT_DEFINITIONS.map(({ checkFunction, ...rest }) => rest);
}

