/**
 * Query optimization utilities and patterns
 * Best practices for Prisma queries to avoid N+1 problems
 */

import { getPrismaClient } from '../config/database.js';

/**
 * Example: Get user with all enrollments and course details (optimized with includes)
 * This prevents N+1 queries by fetching related data in a single query
 */
export async function getUserWithEnrollments(userId: string) {
  const prisma = getPrismaClient();

  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              courseNumber: true,
              title: true,
              description: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      },
      certificates: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              courseNumber: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Example: Get course with lessons and activities (optimized)
 */
export async function getCourseWithLessons(courseId: string) {
  const prisma = getPrismaClient();

  return await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: {
          lessonNumber: 'asc',
        },
        include: {
          activities: {
            orderBy: {
              activityNumber: 'asc',
            },
            select: {
              id: true,
              activityNumber: true,
              title: true,
              type: true,
              required: true,
            },
          },
          resources: {
            select: {
              id: true,
              title: true,
              fileType: true,
              fileSize: true,
            },
          },
        },
      },
      finalProject: true,
      finalExam: {
        include: {
          questions: {
            orderBy: {
              order: 'asc',
            },
            include: {
              options: {
                orderBy: {
                  order: 'asc',
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Example: Get user progress with selective fields (optimized)
 */
export async function getUserProgress(userId: string, courseId: string) {
  const prisma = getPrismaClient();

  // Use select to fetch only needed fields
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    select: {
      id: true,
      currentLesson: true,
      completedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              lessonNumber: true,
            },
            orderBy: {
              lessonNumber: 'asc',
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return null;
  }

  // Get lesson progress in a separate optimized query
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lessonId: {
        in: enrollment.course.lessons.map((l: any) => l.id),
      },
    },
    select: {
      lessonId: true,
      completed: true,
      videoPosition: true,
      currentActivity: true,
    },
  });

  return {
    enrollment,
    lessonProgress,
  };
}

/**
 * Example: Batch query for multiple users' progress (optimized)
 */
export async function getBatchUserProgress(userIds: string[], courseId: string) {
  const prisma = getPrismaClient();

  // Single query to get all enrollments
  return await prisma.enrollment.findMany({
    where: {
      userId: {
        in: userIds,
      },
      courseId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Example: Efficient count query with filters
 */
export async function getCoursesCount(filters: {
  published?: boolean;
  searchTerm?: string;
}) {
  const prisma = getPrismaClient();

  return await prisma.course.count({
    where: {
      ...(filters.published !== undefined && { published: filters.published }),
      ...(filters.searchTerm && {
        OR: [
          { title: { contains: filters.searchTerm, mode: 'insensitive' } },
          { description: { contains: filters.searchTerm, mode: 'insensitive' } },
        ],
      }),
    },
  });
}

/**
 * Example: Aggregation query for statistics
 */
export async function getCourseStatistics(courseId: string) {
  const prisma = getPrismaClient();

  const [enrollmentCount, completionCount, avgProgress] = await Promise.all([
    // Total enrollments
    prisma.enrollment.count({
      where: { courseId },
    }),

    // Completed enrollments
    prisma.enrollment.count({
      where: {
        courseId,
        completedAt: {
          not: null,
        },
      },
    }),

    // Average progress (custom calculation)
    prisma.enrollment.findMany({
      where: { courseId },
      select: {
        currentLesson: true,
      },
    }),
  ]);

  const totalLessons = 12; // Fixed number of lessons per course
  const avgLessonProgress =
    avgProgress.reduce((sum: number, e: any) => sum + e.currentLesson, 0) / avgProgress.length || 0;
  const avgProgressPercentage = (avgLessonProgress / totalLessons) * 100;

  return {
    enrollmentCount,
    completionCount,
    completionRate: enrollmentCount > 0 ? (completionCount / enrollmentCount) * 100 : 0,
    avgProgressPercentage: Math.round(avgProgressPercentage),
  };
}

/**
 * Transaction example for atomic operations
 */
export async function completeLesson(userId: string, lessonId: string) {
  const prisma = getPrismaClient();

  return await prisma.$transaction(async (tx: any) => {
    // Update lesson progress
    const lessonProgress = await tx.lessonProgress.update({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      data: {
        completed: true,
        completedAt: new Date(),
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

    // Update enrollment current lesson
    await tx.enrollment.updateMany({
      where: {
        userId,
        courseId: lessonProgress.lesson.courseId,
      },
      data: {
        currentLesson: lessonProgress.lesson.lessonNumber + 1,
      },
    });

    return lessonProgress;
  });
}
