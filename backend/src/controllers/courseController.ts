import { Request, Response, NextFunction } from 'express';
import * as courseService from '../services/courseService.js';

/**
 * GET /api/courses
 * List all courses with lock status for the authenticated user
 */
export async function getAllCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const courses = await courseService.getAllCoursesWithStatus(userId);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/courses/:id
 * Get course details by ID
 */
export async function getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Use the new function that includes enrollment status and progress
    const course = await courseService.getCourseByIdWithStatus(id, userId);

    if (!course) {
      res.status(404).json({
        success: false,
        error: { message: 'Course not found' },
      });
      return;
    }

    // Check if user can access this course
    const hasAccess = await courseService.canAccessCourse(userId, id);

    res.json({
      success: true,
      data: {
        ...course,
        hasAccess,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/courses/:id/can-access
 * Check if user can access a specific course
 */
export async function checkCourseAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const hasAccess = await courseService.canAccessCourse(userId, id);

    if (!hasAccess) {
      const prerequisite = await courseService.getPrerequisiteCourse(id);
      res.json({
        success: true,
        data: {
          canAccess: false,
          message: prerequisite
            ? `You must complete "${prerequisite}" before accessing this course`
            : 'You do not have access to this course',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        canAccess: true,
        message: 'You have access to this course',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/courses/:id/enroll
 * Enroll user in a course
 */
export async function enrollInCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await courseService.enrollInCourse(userId, id);

    res.status(201).json({
      success: true,
      data: {
        message: 'Successfully enrolled in course',
      },
    });
  } catch (error: any) {
    if (error.message === 'Cannot enroll in locked course') {
      res.status(403).json({
        success: false,
        error: { message: 'You must complete the previous course before enrolling in this one' },
      });
      return;
    }
    if (error.message === 'Already enrolled in this course') {
      res.status(409).json({
        success: false,
        error: { message: 'You are already enrolled in this course' },
      });
      return;
    }
    if (error.message === 'Course not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Course not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * POST /api/courses/:id/unlock-next
 * Unlock next course after completing current course
 */
export async function unlockNextCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await courseService.unlockNextCourse(userId, id);

    res.json({
      success: true,
      data: {
        message: 'Next course unlocked successfully',
      },
    });
  } catch (error: any) {
    if (error.message === 'Course not completed yet') {
      res.status(400).json({
        success: false,
        error: { message: 'You must complete all lessons, final project, and final exam before unlocking the next course' },
      });
      return;
    }
    if (error.message === 'Course not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Course not found' },
      });
      return;
    }
    next(error);
  }
}

