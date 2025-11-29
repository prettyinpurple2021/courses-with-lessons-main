import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LessonDetails {
  id: string;
  lessonNumber: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
  courseId: string;
  activities: Array<{
    id: string;
    activityNumber: number;
    title: string;
    description: string;
    type: string;
    content: any;
    required: boolean;
    isCompleted: boolean;
    isLocked: boolean;
  }>;
  progress: {
    completed: boolean;
    videoPosition: number;
    currentActivity: number;
  };
}

export interface LessonResource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

/**
 * Get lesson details with activities and progress
 */
export async function getLessonById(userId: string, lessonId: string): Promise<LessonDetails | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      activities: {
        orderBy: { activityNumber: 'asc' },
        select: {
          id: true,
          activityNumber: true,
          title: true,
          description: true,
          type: true,
          content: true,
          required: true,
        },
      },
      course: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  // Get user's progress for this lesson
  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });

  // Get activity submissions to determine completion status
  const activitySubmissions = await prisma.activitySubmission.findMany({
    where: {
      userId,
      activityId: { in: lesson.activities.map((a: any) => a.id) },
    },
    select: {
      activityId: true,
      completed: true,
    },
  });

  const submissionMap = new Map(
    activitySubmissions.map((s: any) => [s.activityId, s.completed])
  );

  // Determine which activities are locked based on sequential progression
  const currentActivityNumber = progress?.currentActivity || 1;

  const activitiesWithStatus = lesson.activities.map((activity: any) => {
    const isCompleted = submissionMap.get(activity.id) || false;
    const isLocked = activity.activityNumber > currentActivityNumber;

    return {
      ...activity,
      isCompleted,
      isLocked,
    };
  });

  return {
    id: lesson.id,
    lessonNumber: lesson.lessonNumber,
    title: lesson.title,
    description: lesson.description,
    youtubeVideoId: lesson.youtubeVideoId,
    duration: lesson.duration,
    courseId: lesson.course.id,
    activities: activitiesWithStatus,
    progress: {
      completed: progress?.completed || false,
      videoPosition: progress?.videoPosition || 0,
      currentActivity: progress?.currentActivity || 1,
    },
  };
}

/**
 * Check if user can access a specific lesson
 */
export async function canAccessLesson(userId: string, lessonId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      lessonNumber: true,
      courseId: true,
    },
  });

  if (!lesson) {
    return false;
  }

  // Check if user is enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) {
    return false;
  }

  // Check if this lesson is unlocked (sequential progression)
  return lesson.lessonNumber <= enrollment.currentLesson;
}

/**
 * Get all resources for a lesson
 */
export async function getLessonResources(lessonId: string): Promise<LessonResource[]> {
  const resources = await prisma.resource.findMany({
    where: { lessonId },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      fileType: true,
      fileSize: true,
    },
  });

  return resources;
}

/**
 * Check if all activities in a lesson are completed
 */
export async function areAllActivitiesCompleted(userId: string, lessonId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      activities: {
        where: { required: true },
        select: { id: true },
      },
    },
  });

  if (!lesson || lesson.activities.length === 0) {
    return true; // No required activities means lesson can be completed
  }

  const completedActivities = await prisma.activitySubmission.count({
    where: {
      userId,
      activityId: { in: lesson.activities.map((a: any) => a.id) },
      completed: true,
    },
  });

  return completedActivities === lesson.activities.length;
}

/**
 * Mark lesson as completed and unlock next lesson
 */
export async function completeLessonAndUnlockNext(userId: string, lessonId: string): Promise<void> {
  // Verify all required activities are completed
  const allActivitiesCompleted = await areAllActivitiesCompleted(userId, lessonId);
  if (!allActivitiesCompleted) {
    throw new Error('All required activities must be completed before marking lesson as complete');
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      lessonNumber: true,
      courseId: true,
    },
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  // Update or create lesson progress
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      completed: true,
      completedAt: new Date(),
      videoPosition: 0,
      currentActivity: 1,
    },
  });

  // Update enrollment to unlock next lesson
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (enrollment && lesson.lessonNumber >= enrollment.currentLesson) {
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
      data: {
        currentLesson: lesson.lessonNumber + 1,
      },
    });
  }
}

/**
 * Update video position for a lesson
 */
export async function updateVideoPosition(
  userId: string,
  lessonId: string,
  position: number
): Promise<void> {
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      videoPosition: position,
    },
    create: {
      userId,
      lessonId,
      videoPosition: position,
      completed: false,
      currentActivity: 1,
    },
  });
}

/**
 * Get prerequisite lesson for a given lesson
 */
export async function getPrerequisiteLesson(lessonId: string): Promise<string | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      lessonNumber: true,
      courseId: true,
    },
  });

  if (!lesson || lesson.lessonNumber === 1) {
    return null;
  }

  const prerequisite = await prisma.lesson.findFirst({
    where: {
      courseId: lesson.courseId,
      lessonNumber: lesson.lessonNumber - 1,
    },
    select: { title: true },
  });

  return prerequisite?.title || null;
}
