import { PrismaClient } from '@prisma/client';
import { checkAndUnlockAchievements } from './achievementService.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface ActivityDetails {
  id: string;
  activityNumber: number;
  title: string;
  description: string;
  type: string;
  content: any;
  required: boolean;
  lessonId: string;
  isCompleted: boolean;
  isLocked: boolean;
  submission?: {
    id: string;
    response: any;
    completed: boolean;
    submittedAt: Date;
    feedback: string | null;
  };
}

export interface ActivitySubmissionData {
  response: any;
}

export interface ActivityTypeHandler {
  validate: (content: any, response: any) => boolean;
  provideFeedback?: (content: any, response: any) => string;
}

/**
 * Activity type handlers for different activity types
 */
const activityTypeHandlers: Record<string, ActivityTypeHandler> = {
  quiz: {
    validate: (_content: any, response: any) => {
      // Quiz validation: check if all questions are answered
      if (!_content.questions || !Array.isArray(_content.questions)) {
        return false;
      }
      if (!response.answers || !Array.isArray(response.answers)) {
        return false;
      }
      return response.answers.length === _content.questions.length;
    },
    provideFeedback: (_content: any, _response: any) => {
      if (!_content.questions || !Array.isArray(_content.questions)) {
        return 'Unable to generate feedback: Invalid quiz content.';
      }

      let correctCount = 0;
      const totalQuestions = _content.questions.length;
      const questionFeedbacks: string[] = [];

      _content.questions.forEach((question: any, index: number) => {
        const userAnswer = _response.answers ? _response.answers[index] : null;
        const isCorrect = question.correctAnswer === userAnswer;

        if (isCorrect) {
          correctCount++;
          let feedback = `Question ${index + 1}: ✓ Correct!`;
          if (question.feedback || question.explanation) {
            feedback += ` ${question.feedback || question.explanation}`;
          }
          questionFeedbacks.push(feedback);
        } else {
          const correctOption = question.options ? question.options[question.correctAnswer] : question.correctAnswer;
          let feedback = `Question ${index + 1}: ✗ Incorrect.`;

          // Add explanation if provided
          if (question.feedback || question.explanation) {
            feedback += ` ${question.feedback || question.explanation}`;
          }

          // Show correct answer
          feedback += ` The correct answer is "${correctOption}".`;

          questionFeedbacks.push(feedback);
        }
      });

      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      // Build comprehensive feedback
      let feedback = `You answered ${correctCount} out of ${totalQuestions} questions correctly (${percentage}%).\n\n`;
      feedback += questionFeedbacks.join('\n\n');

      return feedback;
    },
  },
  exercise: {
    validate: (_content: any, response: any) => {
      // Exercise validation: check if response is provided
      return response.answer && response.answer.trim().length > 0;
    },
    provideFeedback: () => {
      return 'Your exercise has been submitted successfully. Keep up the great work!';
    },
  },
  reflection: {
    validate: (_content: any, response: any) => {
      // Reflection validation: check if response meets minimum length
      const minLength = _content.minLength || 50;
      return response.reflection && response.reflection.trim().length >= minLength;
    },
    provideFeedback: () => {
      return 'Thank you for your thoughtful reflection. Your insights are valuable!';
    },
  },
  practical_task: {
    validate: (_content: any, response: any) => {
      // Practical task validation: check if all required fields are provided
      if (!response.submission) {
        return false;
      }
      const requiredFields = _content.requiredFields || [];
      return requiredFields.every((field: string) => response.submission[field]);
    },
    provideFeedback: () => {
      return 'Your practical task has been submitted. Excellent work on completing this hands-on activity!';
    },
  },
};

/**
 * Get activity details by ID
 */
export async function getActivityById(userId: string, activityId: string): Promise<ActivityDetails | null> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      lesson: {
        select: {
          id: true,
          lessonNumber: true,
          courseId: true,
        },
      },
    },
  });

  if (!activity) {
    return null;
  }

  // Get user's submission for this activity
  const submission = await prisma.activitySubmission.findUnique({
    where: {
      userId_activityId: {
        userId,
        activityId,
      },
    },
  });

  // Get lesson progress to determine if activity is locked
  const lessonProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: activity.lessonId,
      },
    },
  });

  const currentActivityNumber = lessonProgress?.currentActivity || 1;
  const isLocked = activity.activityNumber > currentActivityNumber;
  const isCompleted = submission?.completed || false;

  return {
    id: activity.id,
    activityNumber: activity.activityNumber,
    title: activity.title,
    description: activity.description,
    type: activity.type,
    content: activity.content,
    required: activity.required,
    lessonId: activity.lesson.id,
    isCompleted,
    isLocked,
    submission: submission
      ? {
        id: submission.id,
        response: submission.response,
        completed: submission.completed,
        submittedAt: submission.submittedAt,
        feedback: submission.feedback,
      }
      : undefined,
  };
}

/**
 * Get all activities for a lesson
 */
export async function getActivitiesByLesson(userId: string, lessonId: string): Promise<ActivityDetails[]> {
  const activities = await prisma.activity.findMany({
    where: { lessonId },
    orderBy: { activityNumber: 'asc' },
  });

  // Get all submissions for these activities
  const activityIds = activities.map((activity: { id: string }) => activity.id);
  const submissions = await prisma.activitySubmission.findMany({
    where: {
      userId,
      activityId: { in: activityIds },
    },
  });

  const submissionMap = new Map(
    submissions.map((submission: { activityId: string }) => [submission.activityId, submission])
  );

  // Get lesson progress
  const lessonProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });

  const currentActivityNumber = lessonProgress?.currentActivity || 1;

  return activities.map((activity: any) => {
    const submission: any = submissionMap.get(activity.id);
    const isLocked = activity.activityNumber > currentActivityNumber;
    const isCompleted = submission?.completed || false;

    const result: ActivityDetails = {
      id: activity.id,
      activityNumber: activity.activityNumber,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      content: activity.content,
      required: activity.required,
      lessonId: activity.lessonId,
      isCompleted,
      isLocked,
    };

    if (submission) {
      result.submission = {
        id: submission.id,
        response: submission.response,
        completed: submission.completed,
        submittedAt: submission.submittedAt,
        feedback: submission.feedback,
      };
    }

    return result;
  });
}

/**
 * Check if user can access an activity
 */
export async function canAccessActivity(userId: string, activityId: string): Promise<boolean> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      activityNumber: true,
      lessonId: true,
    },
  });

  if (!activity) {
    return false;
  }

  // Get lesson progress
  const lessonProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: activity.lessonId,
      },
    },
  });

  const currentActivityNumber = lessonProgress?.currentActivity || 1;

  // User can access if activity number is <= current activity number
  return activity.activityNumber <= currentActivityNumber;
}

/**
 * Validate activity submission based on activity type
 */
export function validateActivitySubmission(activityType: string, content: any, response: any): boolean {
  const handler = activityTypeHandlers[activityType];
  if (!handler) {
    // Unknown activity type, accept any non-empty response
    return response && Object.keys(response).length > 0;
  }
  return handler.validate(content, response);
}

/**
 * Generate feedback for activity submission
 */
export function generateActivityFeedback(activityType: string, content: any, response: any): string {
  const handler = activityTypeHandlers[activityType];
  if (!handler || !handler.provideFeedback) {
    return 'Your submission has been received. Great job!';
  }
  return handler.provideFeedback(content, response);
}

/**
 * Submit activity response and update progress
 * 
 * Validates user access, validates submission format, generates feedback,
 * saves submission, unlocks next activity if applicable, and marks lesson
 * as completed if all activities are done.
 * 
 * @param userId - ID of the user submitting the activity
 * @param activityId - ID of the activity being submitted
 * @param submissionData - User's response data
 * @returns Object containing success status, feedback, unlock status, and completion status
 * @throws Error if user doesn't have access, activity not found, or submission is invalid
 */
export async function submitActivity(
  userId: string,
  activityId: string,
  submissionData: ActivitySubmissionData
): Promise<{ success: boolean; feedback: string; nextActivityUnlocked: boolean; lessonCompleted: boolean }> {
  // Check if user can access this activity
  const hasAccess = await canAccessActivity(userId, activityId);
  if (!hasAccess) {
    throw new Error('You do not have access to this activity. Complete previous activities first.');
  }

  // Get activity details
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      lesson: {
        include: {
          activities: {
            where: { required: true },
            orderBy: { activityNumber: 'asc' },
          },
        },
      },
    },
  });

  if (!activity) {
    throw new Error('Activity not found');
  }

  // Validate submission
  const isValid = validateActivitySubmission(activity.type, activity.content, submissionData.response);
  if (!isValid) {
    throw new Error('Invalid submission. Please check your response and try again.');
  }

  // Generate feedback
  const feedback = generateActivityFeedback(activity.type, activity.content, submissionData.response);

  // Create or update submission
  await prisma.activitySubmission.upsert({
    where: {
      userId_activityId: {
        userId,
        activityId,
      },
    },
    update: {
      response: submissionData.response,
      completed: true,
      submittedAt: new Date(),
      feedback,
    },
    create: {
      userId,
      activityId,
      response: submissionData.response,
      completed: true,
      feedback,
    },
  });

  // Check if this is the last activity in the lesson
  const totalRequiredActivities = activity.lesson.activities.length;
  const isLastActivity = activity.activityNumber === totalRequiredActivities;

  let nextActivityUnlocked = false;
  let lessonCompleted = false;

  if (!isLastActivity) {
    // Unlock next activity
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: activity.lessonId,
        },
      },
      update: {
        currentActivity: activity.activityNumber + 1,
      },
      create: {
        userId,
        lessonId: activity.lessonId,
        currentActivity: activity.activityNumber + 1,
        completed: false,
        videoPosition: 0,
      },
    });
    nextActivityUnlocked = true;
  } else {
    // Check if all required activities are completed
    const activityIds = activity.lesson.activities.map((act: { id: string }) => act.id);
    const completedActivities = await prisma.activitySubmission.count({
      where: {
        userId,
        activityId: { in: activityIds },
        completed: true,
      },
    });

    if (completedActivities === totalRequiredActivities) {
      // Mark lesson as completed and unlock next lesson
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: activity.lessonId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId,
          lessonId: activity.lessonId,
          completed: true,
          completedAt: new Date(),
          currentActivity: activity.activityNumber,
          videoPosition: 0,
        },
      });

      // Unlock next lesson in the course
      const lesson = await prisma.lesson.findUnique({
        where: { id: activity.lessonId },
        select: {
          lessonNumber: true,
          courseId: true,
        },
      });

      if (lesson) {
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

      lessonCompleted = true;

      // Check and unlock achievements for lesson completion
      try {
        await checkAndUnlockAchievements(userId, 'lesson_completed');
      } catch (error) {
        // Log error but don't fail activity submission if achievement check fails
        logger.error('Failed to check achievements', { error, userId, activityId });
      }
    }
  }

  return {
    success: true,
    feedback,
    nextActivityUnlocked,
    lessonCompleted,
  };
}

/**
 * Get prerequisite activity for a given activity
 */
export async function getPrerequisiteActivity(activityId: string): Promise<string | null> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      activityNumber: true,
      lessonId: true,
    },
  });

  if (!activity || activity.activityNumber === 1) {
    return null;
  }

  const prerequisite = await prisma.activity.findFirst({
    where: {
      lessonId: activity.lessonId,
      activityNumber: activity.activityNumber - 1,
    },
    select: { title: true },
  });

  return prerequisite?.title || null;
}