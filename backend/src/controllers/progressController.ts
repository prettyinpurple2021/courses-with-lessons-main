import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService.js';

/**
 * PUT /api/progress/lessons/:lessonId
 * Update lesson progress (video position, activity, completion)
 */
export async function updateLessonProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.userId;
    const { videoPosition, currentActivity, completed } = req.body;

    await progressService.updateLessonProgress(userId, lessonId, {
      videoPosition,
      currentActivity,
      completed,
    });

    res.json({
      success: true,
      data: {
        message: 'Progress updated successfully',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/progress/batch
 * Batch update multiple progress records
 */
export async function batchUpdateProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      res.status(400).json({
        success: false,
        error: { message: 'Updates must be an array' },
      });
      return;
    }

    const result = await progressService.batchUpdateProgress(userId, updates);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/progress
 * Get all progress for the current user
 */
export async function getUserProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const progress = await progressService.getUserProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/progress/summary
 * Get progress summary statistics
 */
export async function getProgressSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const summary = await progressService.getProgressSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/progress/sync
 * Sync progress across devices
 */
export async function syncProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { clientProgress } = req.body;

    if (!Array.isArray(clientProgress)) {
      res.status(400).json({
        success: false,
        error: { message: 'clientProgress must be an array' },
      });
      return;
    }

    const result = await progressService.syncProgressAcrossDevices(
      userId,
      clientProgress
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/progress/last-accessed
 * Get last accessed lesson for "Continue Learning"
 */
export async function getLastAccessedLesson(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const lastLesson = await progressService.getLastAccessedLesson(userId);

    res.json({
      success: true,
      data: lastLesson,
    });
  } catch (error) {
    return next(error);
  }
}

