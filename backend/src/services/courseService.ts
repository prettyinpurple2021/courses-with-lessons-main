import { PrismaClient } from '@prisma/client';
import { queueWebhook } from './webhookService.js';
import { checkAndUnlockAchievements } from './achievementService.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface CourseWithLockStatus {
  id: string;
  courseNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  published: boolean;
  isLocked: boolean;
  isEnrolled: boolean;
  isCompleted: boolean;
  progress?: number;
  lessonCount: number;
}

export interface CourseDetails {
  id: string;
  courseNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  published: boolean;
  lessons: Array<{
    id: string;
    lessonNumber: number;
    title: string;
    description: string;
    youtubeVideoId: string;
    duration: number;
  }>;
  finalProject: {
    id: string;
    title: string;
    description: string;
  } | null;
  finalExam: {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
  } | null;
}

/**
 * Get all courses with lock status for a specific user
 * 
 * Optimized to avoid N+1 queries by batching progress calculations.
 * 
 * @param userId - The ID of the user to get courses for
 * @returns Array of courses with lock status, enrollment status, and progress
 * @throws Error if database query fails
 */
export async function getAllCoursesWithStatus(userId: string): Promise<CourseWithLockStatus[]> {
  // Get all courses ordered by course number
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { courseNumber: 'asc' },
    include: {
      lessons: {
        select: { id: true },
      },
      enrollments: {
        where: { userId },
        select: {
          completedAt: true,
        },
      },
    },
  });

  // Get user's highest unlocked course
  const userEnrollment = await prisma.enrollment.findFirst({
    where: { userId },
    orderBy: { unlockedCourses: 'desc' },
    select: { unlockedCourses: true },
  });

  const highestUnlockedCourse = userEnrollment?.unlockedCourses || 1;

  // Batch fetch all lesson progress for enrolled courses to avoid N+1 queries
  const enrolledCourseIds = courses
    .filter((course: any) => course.enrollments.length > 0)
    .map((course: any) => course.id);

  const progressMap: Record<string, number> = {};
  if (enrolledCourseIds.length > 0) {
    // Get all lesson IDs for enrolled courses
    const allLessonIds = courses
      .filter((course) => enrolledCourseIds.includes(course.id))
      .flatMap((course) => course.lessons.map((l: { id: string }) => l.id));

    // Get all completed lessons for this user in one query
    const completedLessons = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
      select: {
        lessonId: true,
      },
    });

    const completedLessonIds = new Set(completedLessons.map((lp) => lp.lessonId));

    // Calculate progress for each enrolled course
    for (const course of courses) {
      if (enrolledCourseIds.includes(course.id)) {
        const totalLessons = course.lessons.length;
        const completedCount = course.lessons.filter((l: { id: string }) =>
          completedLessonIds.has(l.id)
        ).length;
        progressMap[course.id] = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      }
    }
  }

  // Map courses with lock status (no async operations in map)
  const coursesWithStatus: CourseWithLockStatus[] = courses.map((course) => {
    const enrollment = course.enrollments[0];
    const isEnrolled = !!enrollment;
    const isCompleted = !!enrollment?.completedAt;
    const isLocked = course.courseNumber > highestUnlockedCourse;
    const progress = isEnrolled ? (progressMap[course.id] || 0) : 0;

    return {
      id: course.id,
      courseNumber: course.courseNumber,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      published: course.published,
      isLocked,
      isEnrolled,
      isCompleted,
      progress,
      lessonCount: course.lessons.length,
    };
  });

  return coursesWithStatus;
}

/**
 * Get course by ID with all details
 */
export async function getCourseById(courseId: string): Promise<CourseDetails | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { lessonNumber: 'asc' },
        select: {
          id: true,
          lessonNumber: true,
          title: true,
          description: true,
          youtubeVideoId: true,
          duration: true,
        },
      },
      finalProject: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      finalExam: {
        select: {
          id: true,
          title: true,
          description: true,
          timeLimit: true,
          passingScore: true,
        },
      },
    },
  });

  return course;
}

/**
 * Get course by ID with enrollment status and progress for a user
 */
export async function getCourseByIdWithStatus(
  courseId: string,
  userId: string
): Promise<any | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { lessonNumber: 'asc' },
        select: {
          id: true,
          lessonNumber: true,
          title: true,
          description: true,
          youtubeVideoId: true,
          duration: true,
        },
      },
      finalProject: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      finalExam: {
        select: {
          id: true,
          title: true,
          description: true,
          timeLimit: true,
          passingScore: true,
        },
      },
      enrollments: {
        where: { userId },
        select: {
          completedAt: true,
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  // Check enrollment status
  const enrollment = course.enrollments[0];
  const isEnrolled = !!enrollment;
  const isCompleted = !!enrollment?.completedAt;

  // Calculate progress if enrolled
  let progress = 0;
  let completedLessonsCount = 0;
  if (isEnrolled) {
    progress = await calculateCourseProgress(userId, courseId);
    // Calculate actual number of completed lessons (separate from overall progress)
    completedLessonsCount = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: course.lessons.map((l: { id: string }) => l.id) },
        completed: true,
      },
    });
  }

  // Get user's highest unlocked course for lock status
  const userEnrollment = await prisma.enrollment.findFirst({
    where: { userId },
    orderBy: { unlockedCourses: 'desc' },
    select: { unlockedCourses: true },
  });

  const highestUnlockedCourse = userEnrollment?.unlockedCourses || 1;
  const isLocked = course.courseNumber > highestUnlockedCourse;

  // Destructure to exclude enrollments
  const { enrollments: _enrollments, ...courseData } = course;

  return {
    ...courseData,
    isEnrolled,
    isCompleted,
    isLocked,
    progress,
    completedLessons: completedLessonsCount,
    lessonCount: course.lessons.length,
  };
}

/**
 * Check if user can access a specific course
 */
export async function canAccessCourse(userId: string, courseId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { courseNumber: true },
  });

  if (!course) {
    return false;
  }

  // Get user's highest unlocked course
  const userEnrollment = await prisma.enrollment.findFirst({
    where: { userId },
    orderBy: { unlockedCourses: 'desc' },
    select: { unlockedCourses: true },
  });

  const highestUnlockedCourse = userEnrollment?.unlockedCourses || 1;

  return course.courseNumber <= highestUnlockedCourse;
}

/**
 * Enroll user in a course (only if they have access)
 */
export async function enrollInCourse(userId: string, courseId: string): Promise<any> {
  // Check if user can access this course
  const hasAccess = await canAccessCourse(userId, courseId);
  if (!hasAccess) {
    throw new Error('Cannot enroll in locked course');
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    throw new Error('Already enrolled in this course');
  }

  // Get course number to set unlockedCourses
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { courseNumber: true },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  // Get current highest unlocked courses
  const currentEnrollment = await prisma.enrollment.findFirst({
    where: { userId },
    orderBy: { unlockedCourses: 'desc' },
    select: { unlockedCourses: true },
  });

  const unlockedCourses = currentEnrollment?.unlockedCourses || 1;

  // Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      currentLesson: 1,
      unlockedCourses,
    },
  });

  // Trigger webhook for course enrollment
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        courseNumber: true,
        title: true,
      },
    });

    if (course) {
      await queueWebhook(userId, 'course.enrolled', {
        courseId: course.id,
        courseNumber: course.courseNumber,
        courseTitle: course.title,
        enrolledAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Log error but don't fail enrollment if webhook fails
    logger.error('Failed to send enrollment webhook', { error, userId, courseId });
  }

  // Check and unlock achievements for course enrollment
  try {
    await checkAndUnlockAchievements(userId, 'course_enrolled');
  } catch (error) {
    // Log error but don't fail enrollment if achievement check fails
    logger.error('Failed to check achievements', { error, userId, courseId });
  }
  // ... (webhook and achievements logic stays the same) ...
  return enrollment;
}

/**
 * Check if course is completed (all lessons, final project, and final exam done)
 */
export async function isCourseCompleted(userId: string, courseId: string): Promise<boolean> {
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
    return false;
  }

  // Check all lessons are completed
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: course.lessons.map((l: { id: string }) => l.id) },
      completed: true,
    },
  });

  if (completedLessons !== course.lessons.length) {
    return false;
  }

  // Check final project is submitted and approved
  if (course.finalProject) {
    const projectSubmission = await prisma.finalProjectSubmission.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: course.finalProject.id,
        },
      },
    });

    if (!projectSubmission || projectSubmission.status !== 'approved') {
      return false;
    }
  }

  // Check final exam is passed
  if (course.finalExam) {
    const examResult = await prisma.finalExamResult.findUnique({
      where: {
        userId_examId: {
          userId,
          examId: course.finalExam.id,
        },
      },
    });

    if (!examResult || !examResult.passed) {
      return false;
    }
  }

  return true;
}

/**
 * Unlock next course after completing current course
 */
export async function unlockNextCourse(userId: string, courseId: string): Promise<void> {
  // Verify course is completed
  const isCompleted = await isCourseCompleted(userId, courseId);
  if (!isCompleted) {
    throw new Error('Course not completed yet');
  }

  // Get current course number
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { courseNumber: true },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  // Check if there's a next course
  const nextCourse = await prisma.course.findUnique({
    where: { courseNumber: course.courseNumber + 1 },
  });

  if (!nextCourse) {
    // No next course, this is the last one
    return;
  }

  // Update enrollment to mark course as completed and unlock next course
  await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      completedAt: new Date(),
      unlockedCourses: course.courseNumber + 1,
    },
  });

  // Update all other enrollments to have the new unlocked courses value
  await prisma.enrollment.updateMany({
    where: {
      userId,
      unlockedCourses: { lt: course.courseNumber + 1 },
    },
    data: {
      unlockedCourses: course.courseNumber + 1,
    },
  });
}

/**
 * Calculate course progress percentage
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

/**
 * Get prerequisite course for a given course
 */
export async function getPrerequisiteCourse(courseId: string): Promise<string | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { courseNumber: true },
  });

  if (!course || course.courseNumber === 1) {
    return null;
  }

  const prerequisite = await prisma.course.findUnique({
    where: { courseNumber: course.courseNumber - 1 },
    select: { title: true },
  });

  return prerequisite?.title || null;
}
