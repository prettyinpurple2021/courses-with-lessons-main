import { Request, Response, NextFunction } from 'express';
import * as finalProjectService from '../services/finalProjectService.js';

/**
 * GET /api/courses/:courseId/final-project
 * Get final project details for a course
 */
export async function getFinalProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const finalProject = await finalProjectService.getFinalProjectByCourseId(userId, courseId);

    if (!finalProject) {
      res.status(404).json({
        success: false,
        error: { message: 'Final project not found for this course' },
      });
      return;
    }

    res.json({
      success: true,
      data: finalProject,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/courses/:courseId/final-project/submit
 * Submit final project for a course
 */
export async function submitFinalProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;
    const submissionData = req.body;

    // Get the final project for this course
    const finalProject = await finalProjectService.getFinalProjectByCourseId(userId, courseId);

    if (!finalProject) {
      res.status(404).json({
        success: false,
        error: { message: 'Final project not found for this course' },
      });
      return;
    }

    await finalProjectService.submitFinalProject(userId, finalProject.id, submissionData);

    res.status(201).json({
      success: true,
      data: {
        message: 'Final project submitted successfully',
      },
    });
  } catch (error: any) {
    if (error.message === 'Final project is locked. Complete all lessons first.') {
      res.status(403).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    if (error.message === 'Submission data is required') {
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
 * GET /api/courses/:courseId/final-project/status
 * Get submission status for final project
 */
export async function getSubmissionStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    // Get the final project for this course
    const finalProject = await finalProjectService.getFinalProjectByCourseId(userId, courseId);

    if (!finalProject) {
      res.status(404).json({
        success: false,
        error: { message: 'Final project not found for this course' },
      });
      return;
    }

    const status = await finalProjectService.getSubmissionStatus(userId, finalProject.id);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    return next(error);
  }
}

