import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FinalProjectDetails {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  requirements: any;
  isUnlocked: boolean;
  submission?: {
    id: string;
    submission: any;
    submittedAt: Date;
    status: string;
    feedback: string | null;
  } | null;
}

export interface ProjectSubmissionData {
  submission: any;
}

/**
 * Get final project by course ID
 */
export async function getFinalProjectByCourseId(
  userId: string,
  courseId: string
): Promise<FinalProjectDetails | null> {
  const finalProject = await prisma.finalProject.findUnique({
    where: { courseId },
  });

  if (!finalProject) {
    return null;
  }

  // Check if project is unlocked (all 12 lessons must be completed)
  const isUnlocked = await isProjectUnlocked(userId, courseId);

  // Get user's submission if exists
  const submission = await prisma.finalProjectSubmission.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: finalProject.id,
      },
    },
  });

  return {
    id: finalProject.id,
    courseId: finalProject.courseId,
    title: finalProject.title,
    description: finalProject.description,
    instructions: finalProject.instructions,
    requirements: finalProject.requirements,
    isUnlocked,
    submission: submission
      ? {
          id: submission.id,
          submission: submission.submission,
          submittedAt: submission.submittedAt,
          status: submission.status,
          feedback: submission.feedback,
        }
      : null,
  };
}

/**
 * Check if final project is unlocked (all 12 lessons completed)
 */
export async function isProjectUnlocked(userId: string, courseId: string): Promise<boolean> {
  // Get all lessons for the course
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    select: { id: true },
  }) as Array<{ id: string }>;

  if (lessons.length === 0) {
    return false;
  }

  // Check if all lessons are completed
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
      completed: true,
    },
  });

  return completedLessons === lessons.length;
}

/**
 * Submit final project
 */
export async function submitFinalProject(
  userId: string,
  projectId: string,
  submissionData: ProjectSubmissionData
): Promise<void> {
  // Get project details
  const project = await prisma.finalProject.findUnique({
    where: { id: projectId },
    select: { courseId: true },
  });

  if (!project) {
    throw new Error('Final project not found');
  }

  // Check if project is unlocked
  const isUnlocked = await isProjectUnlocked(userId, project.courseId);
  if (!isUnlocked) {
    throw new Error('Final project is locked. Complete all lessons first.');
  }

  // Validate submission data
  if (!submissionData.submission) {
    throw new Error('Submission data is required');
  }

  // Check if submission already exists
  const existingSubmission = await prisma.finalProjectSubmission.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (existingSubmission) {
    // Update existing submission
    await prisma.finalProjectSubmission.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: {
        submission: submissionData.submission,
        submittedAt: new Date(),
        status: 'pending', // Reset to pending on resubmission
        feedback: null,
      },
    });
  } else {
    // Create new submission
    await prisma.finalProjectSubmission.create({
      data: {
        userId,
        projectId,
        submission: submissionData.submission,
        status: 'pending',
      },
    });
  }
}

/**
 * Get submission status for a final project
 */
export async function getSubmissionStatus(
  userId: string,
  projectId: string
): Promise<{
  hasSubmission: boolean;
  status?: string;
  submittedAt?: Date;
  feedback?: string | null;
} | null> {
  const submission = await prisma.finalProjectSubmission.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!submission) {
    return {
      hasSubmission: false,
    };
  }

  return {
    hasSubmission: true,
    status: submission.status,
    submittedAt: submission.submittedAt,
    feedback: submission.feedback,
  };
}

/**
 * Approve final project submission (admin function)
 */
export async function approveProjectSubmission(
  userId: string,
  projectId: string,
  feedback?: string
): Promise<void> {
  const submission = await prisma.finalProjectSubmission.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  await prisma.finalProjectSubmission.update({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
    data: {
      status: 'approved',
      feedback,
    },
  });
}

/**
 * Request revision for final project submission (admin function)
 */
export async function requestProjectRevision(
  userId: string,
  projectId: string,
  feedback: string
): Promise<void> {
  const submission = await prisma.finalProjectSubmission.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  await prisma.finalProjectSubmission.update({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
    data: {
      status: 'needs_revision',
      feedback,
    },
  });
}

/**
 * Check if final project is approved
 */
export async function isProjectApproved(userId: string, courseId: string): Promise<boolean> {
  const project = await prisma.finalProject.findUnique({
    where: { courseId },
  });

  if (!project) {
    return false;
  }

  const submission = await prisma.finalProjectSubmission.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: project.id,
      },
    },
  });

  return submission?.status === 'approved';
}
