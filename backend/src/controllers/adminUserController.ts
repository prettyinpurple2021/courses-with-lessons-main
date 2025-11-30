import { Request, Response, NextFunction } from 'express';
import { adminUserService } from '../services/adminUserService.js';

export const adminUserController = {
  /**
   * Get all users with filters
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, role, courseId, page = '1', limit = '20' } = req.query;

      const filters = {
        search: search as string,
        role: role as string,
        courseId: courseId as string,
      };

      const result = await adminUserService.getAllUsers(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user by ID with details
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await adminUserService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user progress across all courses
   */
  async getUserProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const progress = await adminUserService.getUserProgress(userId);

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user activity completion status
   */
  async getUserActivityStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { courseId } = req.query;

      const activities = await adminUserService.getUserActivityStatus(
        userId,
        courseId as string
      );

      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Manually unlock a course for a user
   */
  async unlockCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { courseNumber } = req.body;

      const enrollment = await adminUserService.unlockCourse(
        userId,
        courseNumber
      );

      res.json({
        success: true,
        data: enrollment,
        message: 'Course unlocked successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Manually unlock a lesson for a user
   */
  async unlockLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { lessonId } = req.body;

      const result = await adminUserService.unlockLesson(userId, lessonId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await adminUserService.updateUserRole(userId, role);

      res.json({
        success: true,
        data: user,
        message: 'User role updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await adminUserService.deleteUser(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
