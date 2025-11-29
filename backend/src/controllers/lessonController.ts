import { Request, Response, NextFunction } from 'express';
import * as lessonService from '../services/lessonService.js';

/**
 * GET /api/lessons/:id
 * Get lesson details with activities and progress
 */
export async function getLessonById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const lesson = await lessonService.getLessonById(userId, id);

    if (!lesson) {
      res.status(404).json({
        success: false,
        error: { message: 'Lesson not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/lessons/:id/unlock
 * Check if user can access a specific lesson
 */
export async function checkLessonAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const hasAccess = await lessonService.canAccessLesson(userId, id);

    if (!hasAccess) {
      const prerequisite = await lessonService.getPrerequisiteLesson(id);
      res.json({
        success: true,
        data: {
          canAccess: false,
          message: prerequisite
            ? `You must complete "${prerequisite}" before accessing this lesson`
            : 'You do not have access to this lesson',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        canAccess: true,
        message: 'You have access to this lesson',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/lessons/:id/resources
 * Get all resources for a lesson
 */
export async function getLessonResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if user has access to this lesson
    const hasAccess = await lessonService.canAccessLesson(userId, id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have access to this lesson' },
      });
      return;
    }

    const resources = await lessonService.getLessonResources(id);

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/lessons/:id/complete
 * Mark lesson as completed and unlock next lesson
 */
export async function completeLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await lessonService.completeLessonAndUnlockNext(userId, id);

    res.json({
      success: true,
      data: {
        message: 'Lesson completed successfully',
      },
    });
  } catch (error: any) {
    if (error.message === 'All required activities must be completed before marking lesson as complete') {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    if (error.message === 'Lesson not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Lesson not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * PUT /api/lessons/:id/progress
 * Update video position for a lesson
 */
export async function updateVideoProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { position } = req.body;
    const userId = req.user!.userId;

    if (typeof position !== 'number' || position < 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid video position' },
      });
      return;
    }

    await lessonService.updateVideoPosition(userId, id, position);

    res.json({
      success: true,
      data: {
        message: 'Video progress updated',
      },
    });
  } catch (error) {
    return next(error);
  }
}

