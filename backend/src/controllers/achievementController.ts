import { Request, Response, NextFunction } from 'express';
import * as achievementService from '../services/achievementService.js';

/**
 * GET /api/achievements
 * Get all achievements for the current user
 */
export async function getUserAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const achievements = await achievementService.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/achievements/definitions
 * Get all achievement definitions (for display purposes)
 */
export async function getAchievementDefinitions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const definitions = achievementService.getAchievementDefinitions();

    res.json({
      success: true,
      data: definitions,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/achievements/:id/unlock
 * Manually trigger achievement check (admin or for testing)
 */
export async function unlockAchievement(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await achievementService.unlockAchievement(userId, id);

    if (!result) {
      res.status(404).json({
        success: false,
        error: { message: 'Achievement not found or already unlocked' },
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

