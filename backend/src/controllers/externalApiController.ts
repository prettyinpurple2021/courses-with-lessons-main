import { Request, Response, NextFunction } from 'express';
import {
  getUserCourses,
  getCourseProgress,
  getUserAchievements,
  getUserEnrollments,
} from '../services/externalApiService.js';
import { NotFoundError } from '../utils/errors.js';

export class ExternalApiController {
  /**
   * GET /api/external/v1/courses
   * Get user's enrolled courses
   */
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.oauth) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const userId = req.oauth.userId;
      const limit = parseInt(req.query.limit as string) || 3;

      const courses = await getUserCourses(userId, limit);

      return res.status(200).json({
        success: true,
        data: {
          courses,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/external/v1/courses/:courseId/progress
   * Get detailed course progress
   */
  async getCourseProgressById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.oauth) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const userId = req.oauth.userId;
      const { courseId } = req.params;

      const progress = await getCourseProgress(userId, courseId);

      if (!progress) {
        throw new NotFoundError('Course not found or user not enrolled');
      }

      return res.status(200).json({
        success: true,
        data: {
          progress,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/external/v1/achievements
   * Get user achievements
   */
  async getAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.oauth) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const userId = req.oauth.userId;
      const limit = parseInt(req.query.limit as string) || 6;

      const achievements = await getUserAchievements(userId, limit);

      return res.status(200).json({
        success: true,
        data: {
          achievements,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/external/v1/enrollments
   * Get all user enrollments
   */
  async getEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.oauth) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const userId = req.oauth.userId;

      const enrollments = await getUserEnrollments(userId);

      return res.status(200).json({
        success: true,
        data: {
          enrollments,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const externalApiController = new ExternalApiController();

