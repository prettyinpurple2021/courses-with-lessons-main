import { PrismaClient } from '@prisma/client';
import * as finalProjectService from './finalProjectService.js';
import * as certificateService from './certificateService.js';
import { queueWebhook } from './webhookService.js';
import { checkAndUnlockAchievements } from './achievementService.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface FinalExamDetails {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  isUnlocked: boolean;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    order: number;
    points: number;
    options: Array<{
      id: string;
      text: string;
      order: number;
    }>;
  }>;
  result?: {
    id: string;
    score: number;
    passed: boolean;
    submittedAt: Date;
  } | null;
}

export interface ExamSubmissionData {
  answers: Record<string, string>; // questionId -> answerId
}

export interface ExamResult {
  id: string;
  score: number;
  passed: boolean;
  gradingStatus: 'GRADED' | 'PENDING_REVIEW';
  submittedAt: Date;
  answers: Record<string, string>;
}

/**
 * Get final exam by course ID
 */
export async function getFinalExamByCourseId(
  userId: string,
  courseId: string
): Promise<FinalExamDetails | null> {
  const finalExam = await prisma.finalExam.findUnique({
    where: { courseId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              text: true,
              order: true,
              // Don't include isCorrect in the response
            },
          },
        },
      },
    },
  });

  if (!finalExam) {
    return null;
  }

  // Check if exam is unlocked (final project must be approved)
  const isUnlocked = await isExamUnlocked(userId, courseId);

  // Get user's result if exists
  const result = await prisma.finalExamResult.findUnique({
    where: {
      userId_examId: {
        userId,
        examId: finalExam.id,
      },
    },
  });

  return {
    id: finalExam.id,
    courseId: finalExam.courseId,
    title: finalExam.title,
    description: finalExam.description,
    timeLimit: finalExam.timeLimit,
    passingScore: finalExam.passingScore,
    isUnlocked,
    questions: finalExam.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      order: q.order,
      points: q.points,
      options: q.options,
    })),
    result: result
      ? {
        id: result.id,
        score: result.score,
        passed: result.passed,
        submittedAt: result.submittedAt,
      }
      : null,
  };
}

/**
 * Check if final exam is unlocked (final project must be approved)
 */
export async function isExamUnlocked(userId: string, courseId: string): Promise<boolean> {
  return await finalProjectService.isProjectApproved(userId, courseId);
}

/**
 * Submit final exam and calculate score
 * 
 * Validates exam unlock status, calculates score based on answers,
 * saves/updates exam result, and unlocks achievements if applicable.
 * 
 * @param userId - ID of the user submitting the exam
 * @param examId - ID of the exam being submitted
 * @param submissionData - User's answers to exam questions
 * @returns Exam result with score, pass status, and answers
 * @throws Error if exam not found, not unlocked, or submission invalid
 */
export async function submitFinalExam(
  userId: string,
  examId: string,
  submissionData: ExamSubmissionData
): Promise<ExamResult> {
  // Get exam details with correct answers
  const exam = await prisma.finalExam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!exam) {
    throw new Error('Final exam not found');
  }

  // Check if exam is unlocked
  const isUnlocked = await isExamUnlocked(userId, exam.courseId);
  if (!isUnlocked) {
    throw new Error('Final exam is locked. Complete and get approval for the final project first.');
  }

  // Validate submission data
  if (!submissionData.answers || Object.keys(submissionData.answers).length === 0) {
    throw new Error('Exam answers are required');
  }

  // Calculate score
  const { score, totalPoints, requiresManualGrading } = calculateExamScore(exam.questions, submissionData.answers);
  const scorePercentage = Math.round((score / totalPoints) * 100);

  // If manual grading is required, we CANNOT pass the student yet
  // passed is ALWAYS false until reviewed if manual grading is needed
  const passed = !requiresManualGrading && scorePercentage >= exam.passingScore;
  const gradingStatus = requiresManualGrading ? 'PENDING_REVIEW' : 'GRADED';

  // Check if result already exists
  const existingResult = await prisma.finalExamResult.findUnique({
    where: {
      userId_examId: {
        userId,
        examId,
      },
    },
  });

  let result;

  if (existingResult) {
    // Update existing result (allow retakes)
    result = await prisma.finalExamResult.update({
      where: {
        userId_examId: {
          userId,
          examId,
        },
      },
      data: {
        score: scorePercentage,
        answers: submissionData.answers,
        passed,
        gradingStatus,
        submittedAt: new Date(),
      },
    });
  } else {
    // Create new result
    result = await prisma.finalExamResult.create({
      data: {
        userId,
        examId,
        score: scorePercentage,
        answers: submissionData.answers,
        passed,
        gradingStatus,
      },
    });
  }

  // Only unlock achievements/course if fully graded and passed
  if (gradingStatus === 'GRADED') {
    // Check and unlock achievements for exam submission (perfect score)
    try {
      await checkAndUnlockAchievements(userId, 'exam_submitted');
    } catch (error) {
      // Log error but don't fail exam submission if achievement check fails
      logger.error('Failed to check achievements', { error, userId, examId });
    }

    // If passed, mark course as completed and unlock next course
    if (passed) {
      await completeCourse(userId, exam.courseId);
    }
  }

  return {
    id: result.id,
    score: result.score,
    passed: result.passed,
    gradingStatus: result.gradingStatus as 'GRADED' | 'PENDING_REVIEW',
    submittedAt: result.submittedAt,
    answers: result.answers as unknown as Record<string, string>,
  };
}

/**
 * Calculate exam score based on answers
 */
function calculateExamScore(
  questions: Array<{
    id: string;
    type: string;
    points: number;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>,
  answers: Record<string, string>
): { score: number; totalPoints: number; requiresManualGrading: boolean } {
  let score = 0;
  let totalPoints = 0;
  let requiresManualGrading = false;

  for (const question of questions) {
    totalPoints += question.points;
    const userAnswer = answers[question.id];

    if (!userAnswer) {
      continue; // No answer provided
    }

    if (question.type === 'multiple_choice') {
      // Find the correct option
      const correctOption = question.options.find((opt) => opt.isCorrect);
      if (correctOption && userAnswer === correctOption.id) {
        score += question.points;
      }
    } else if (question.type === 'true_false') {
      // Find the correct option
      const correctOption = question.options.find((opt) => opt.isCorrect);
      if (correctOption && userAnswer === correctOption.id) {
        score += question.points;
      }
    } else if (question.type === 'short_answer') {
      // For short answer, we require manual grading
      requiresManualGrading = true;
      // We don't add points for this yet
    }
  }

  return { score, totalPoints, requiresManualGrading };
}

/**
 * Get exam result for a user
 */
export async function getExamResult(userId: string, examId: string): Promise<ExamResult | null> {
  const result = await prisma.finalExamResult.findUnique({
    where: {
      userId_examId: {
        userId,
        examId,
      },
    },
  });

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    score: result.score,
    passed: result.passed,
    gradingStatus: result.gradingStatus as 'GRADED' | 'PENDING_REVIEW',
    submittedAt: result.submittedAt,
    answers: result.answers as unknown as Record<string, string>,
  };
}

/**
 * Complete course and unlock next course
 */
/**
 * Complete course and unlock next course
 */
export async function completeCourse(userId: string, courseId: string): Promise<void> {
  // Get current course number
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { courseNumber: true },
  });

  if (!course) {
    return;
  }

  // Update enrollment to mark course as completed
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    return;
  }

  // Only update if not already completed
  if (!enrollment.completedAt) {
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

    // Generate certificate for course completion
    try {
      await certificateService.createCertificate(userId, courseId);
    } catch (error) {
      logger.error('Error creating certificate', { error, userId, courseId });
      // Don't fail the course completion if certificate creation fails
    }

    // Trigger webhook for course completion
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
        await queueWebhook(userId, 'course.completed', {
          courseId: course.id,
          courseNumber: course.courseNumber,
          courseTitle: course.title,
          completedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Log error but don't fail course completion if webhook fails
      logger.error('Failed to send completion webhook', { error, userId, courseId });
    }

    // Check and unlock achievements for course completion
    try {
      await checkAndUnlockAchievements(userId, 'course_completed');
    } catch (error) {
      // Log error but don't fail course completion if achievement check fails
      logger.error('Failed to check achievements', { error, userId, courseId });
    }
  }
}

/**
 * Check if exam is passed
 */
export async function isExamPassed(userId: string, courseId: string): Promise<boolean> {
  const exam = await prisma.finalExam.findUnique({
    where: { courseId },
  });

  if (!exam) {
    return false;
  }

  const result = await prisma.finalExamResult.findUnique({
    where: {
      userId_examId: {
        userId,
        examId: exam.id,
      },
    },
  });

  return result?.passed || false;
}
