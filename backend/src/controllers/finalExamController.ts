import { Request, Response, NextFunction } from 'express';
import * as finalExamService from '../services/finalExamService.js';

/**
 * GET /api/courses/:courseId/final-exam
 * Get final exam details for a course
 */
export async function getFinalExam(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const finalExam = await finalExamService.getFinalExamByCourseId(userId, courseId);

    if (!finalExam) {
      res.status(404).json({
        success: false,
        error: { message: 'Final exam not found for this course' },
      });
      return;
    }

    res.json({
      success: true,
      data: finalExam,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/courses/:courseId/final-exam/submit
 * Submit final exam for a course
 */
export async function submitFinalExam(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;
    const submissionData = req.body;

    // Get the final exam for this course
    const finalExam = await finalExamService.getFinalExamByCourseId(userId, courseId);

    if (!finalExam) {
      res.status(404).json({
        success: false,
        error: { message: 'Final exam not found for this course' },
      });
      return;
    }

    const result = await finalExamService.submitFinalExam(userId, finalExam.id, submissionData);

    res.status(201).json({
      success: true,
      data: {
        message: result.passed
          ? 'Congratulations! You passed the final exam and completed the course!'
          : 'Exam submitted. You did not pass this time, but you can retake it.',
        result,
      },
    });
  } catch (error: any) {
    if (
      error.message ===
      'Final exam is locked. Complete and get approval for the final project first.'
    ) {
      res.status(403).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    if (error.message === 'Exam answers are required') {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
}

/**
 * GET /api/courses/:courseId/final-exam/result
 * Get exam result for a course
 */
export async function getExamResult(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    // Get the final exam for this course
    const finalExam = await finalExamService.getFinalExamByCourseId(userId, courseId);

    if (!finalExam) {
      res.status(404).json({
        success: false,
        error: { message: 'Final exam not found for this course' },
      });
      return;
    }

    const result = await finalExamService.getExamResult(userId, finalExam.id);

    if (!result) {
      res.status(404).json({
        success: false,
        error: { message: 'No exam result found. You have not taken this exam yet.' },
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/courses/:courseId/final-exam/unlock
 * Check if final exam is unlocked
 */
export async function checkExamUnlock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const isUnlocked = await finalExamService.isExamUnlocked(userId, courseId);

    res.json({
      success: true,
      data: {
        isUnlocked,
        message: isUnlocked
          ? 'Final exam is unlocked and ready to take'
          : 'Final exam is locked. Complete and get approval for the final project first.',
      },
    });
  } catch (error) {
    return next(error);
  }
}

