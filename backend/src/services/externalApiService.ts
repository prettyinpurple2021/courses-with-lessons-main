import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface ExternalCourseData {
  id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  thumbnailUrl: string | null;
  enrollmentDate: string | null;
  completionDate: string | null;
  progress: number;
  status: string; // not_started, in_progress, completed
  lastAccessedAt: string | null;
}

export interface CourseProgressData {
  courseId: string;
  courseName: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  currentLesson: number;
  finalProjectCompleted: boolean;
  finalExamCompleted: boolean;
  finalExamPassed: boolean | null;
}

export interface AchievementData {
  id: string;
  achievementId: string;
  achievementName: string;
  achievementType: string;
  description: string | null;
  badgeUrl: string | null;
  earnedAt: string;
}

export interface EnrollmentData {
  id: string;
  courseId: string;
  courseName: string;
  courseNumber: number;
  enrolledAt: string;
  completedAt: string | null;
  progress: number;
  status: string;
}

/**
 * Get user's enrolled courses for external API
 */
export async function getUserCourses(
  userId: string,
  limit: number = 3
): Promise<ExternalCourseData[]> {
  // Get all user enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
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
    take: limit,
  });

  const courses: ExternalCourseData[] = [];

  for (const enrollment of enrollments) {
    // Calculate progress
    const progress = await calculateCourseProgress(userId, enrollment.courseId);

    // Determine status
    let status = 'not_started';
    if (enrollment.completedAt) {
      status = 'completed';
    } else if (progress > 0) {
      status = 'in_progress';
    }

    // Get last accessed date from lesson progress
    const lastLessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        userId,
        lesson: {
          courseId: enrollment.courseId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        updatedAt: true,
      },
    });

    courses.push({
      id: enrollment.id,
      courseId: enrollment.course.id,
      courseName: enrollment.course.title,
      courseDescription: enrollment.course.description,
      thumbnailUrl: enrollment.course.thumbnail || null,
      enrollmentDate: enrollment.enrolledAt.toISOString(),
      completionDate: enrollment.completedAt?.toISOString() || null,
      progress,
      status,
      lastAccessedAt: lastLessonProgress?.updatedAt.toISOString() || enrollment.enrolledAt.toISOString(),
    });
  }

  return courses;
}

/**
 * Get detailed course progress for external API
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgressData | null> {
  // Get course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      courseNumber: true,
      title: true,
      lessons: {
        select: {
          id: true,
        },
      },
      finalProject: {
        select: {
          id: true,
        },
      },
      finalExam: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  // Get enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    return null;
  }

  // Calculate progress
  const progress = await calculateCourseProgress(userId, courseId);

  // Count completed lessons
  const lessonsCompleted = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: {
        in: course.lessons.map((l) => l.id),
      },
      completed: true,
    },
  });

  // Check final project status
  let finalProjectCompleted = false;
  if (course.finalProject) {
    const projectSubmission = await prisma.finalProjectSubmission.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: course.finalProject.id,
        },
      },
    });
    finalProjectCompleted = projectSubmission?.status === 'approved' || false;
  }

  // Check final exam status
  let finalExamCompleted = false;
  let finalExamPassed: boolean | null = null;
  if (course.finalExam) {
    const examResult = await prisma.finalExamResult.findUnique({
      where: {
        userId_examId: {
          userId,
          examId: course.finalExam.id,
        },
      },
    });
    finalExamCompleted = !!examResult;
    finalExamPassed = examResult?.passed || null;
  }

  return {
    courseId: course.id,
    courseName: course.title,
    progress,
    lessonsCompleted,
    totalLessons: course.lessons.length,
    currentLesson: enrollment.currentLesson,
    finalProjectCompleted,
    finalExamCompleted,
    finalExamPassed,
  };
}

/**
 * Get user achievements for external API
 */
export async function getUserAchievements(
  userId: string,
  limit: number = 6
): Promise<AchievementData[]> {
  const achievements = await prisma.achievement.findMany({
    where: { userId },
    orderBy: {
      unlockedAt: 'desc',
    },
    take: limit,
  });

  return achievements.map((achievement) => ({
    id: achievement.id,
    achievementId: achievement.id, // Using achievement ID as achievementId
    achievementName: achievement.title,
    achievementType: achievement.rarity, // Using rarity as type
    description: achievement.description,
    badgeUrl: achievement.icon || null,
    earnedAt: achievement.unlockedAt.toISOString(),
  }));
}

/**
 * Get all user enrollments for external API
 */
export async function getUserEnrollments(userId: string): Promise<EnrollmentData[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          courseNumber: true,
          title: true,
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  });

  const enrollmentData: EnrollmentData[] = [];

  for (const enrollment of enrollments) {
    // Calculate progress
    const progress = await calculateCourseProgress(userId, enrollment.courseId);

    // Determine status
    let status = 'not_started';
    if (enrollment.completedAt) {
      status = 'completed';
    } else if (progress > 0) {
      status = 'in_progress';
    }

    enrollmentData.push({
      id: enrollment.id,
      courseId: enrollment.course.id,
      courseName: enrollment.course.title,
      courseNumber: enrollment.course.courseNumber,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      completedAt: enrollment.completedAt?.toISOString() || null,
      progress,
      status,
    });
  }

  return enrollmentData;
}

/**
 * Helper function to calculate course progress
 * Re-exported from courseService for convenience
 */
async function calculateCourseProgress(userId: string, courseId: string): Promise<number> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        select: { id: true },
      },
      finalProject: {
        select: { id: true },
      },
      finalExam: {
        select: { id: true },
      },
    },
  });

  if (!course) {
    return 0;
  }

  let totalItems = course.lessons.length;
  let completedItems = 0;

  // Count completed lessons
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: course.lessons.map((l: { id: string }) => l.id) },
      completed: true,
    },
  });
  completedItems += completedLessons;

  // Count final project if exists
  if (course.finalProject) {
    totalItems += 1;
    const projectSubmission = await prisma.finalProjectSubmission.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: course.finalProject.id,
        },
      },
    });
    if (projectSubmission && projectSubmission.status === 'approved') {
      completedItems += 1;
    }
  }

  // Count final exam if exists
  if (course.finalExam) {
    totalItems += 1;
    const examResult = await prisma.finalExamResult.findUnique({
      where: {
        userId_examId: {
          userId,
          examId: course.finalExam.id,
        },
      },
    });
    if (examResult && examResult.passed) {
      completedItems += 1;
    }
  }

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

