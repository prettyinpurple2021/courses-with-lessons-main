import { Request, Response, NextFunction } from 'express';
import * as activityService from '../services/activityService.js';

/**
 * GET /api/activities/:id
 * Get activity details
 */
export async function getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const activity = await activityService.getActivityById(userId, id);

    if (!activity) {
      res.status(404).json({
        success: false,
        error: { message: 'Activity not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/activities/:id/submit
 * Submit activity response
 */
export async function submitActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { response } = req.body;

    if (!response) {
      res.status(400).json({
        success: false,
        error: { message: 'Response is required' },
      });
      return;
    }

    const result = await activityService.submitActivity(userId, id, { response });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === 'You do not have access to this activity. Complete previous activities first.' ||
      error.message === 'Invalid submission. Please check your response and try again.'
    ) {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    if (error.message === 'Activity not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Activity not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * GET /api/activities/:id/unlock
 * Check if user can access an activity
 */
export async function checkActivityAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const hasAccess = await activityService.canAccessActivity(userId, id);

    if (!hasAccess) {
      const prerequisite = await activityService.getPrerequisiteActivity(id);
      res.json({
        success: true,
        data: {
          canAccess: false,
          message: prerequisite
            ? `You must complete "${prerequisite}" before accessing this activity`
            : 'You do not have access to this activity',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        canAccess: true,
        message: 'You have access to this activity',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/lessons/:lessonId/activities
 * Get all activities for a lesson
 */
export async function getActivitiesByLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.userId;

    const activities = await activityService.getActivitiesByLesson(userId, lessonId);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    return next(error);
  }
}

