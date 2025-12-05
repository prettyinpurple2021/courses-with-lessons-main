import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService.js';

/**
 * Admin authentication controller
 */
export const adminController = {
  /**
   * Admin login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await adminService.login(email, password);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify admin status
   */
  async verifyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: {
          isAdmin: true,
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },
} catch (error) {
  next(error);
}
  },

  /**
   * Get pending exams
   */
  async getPendingExams(_req: Request, res: Response, next: NextFunction) {
  try {
    const exams = await adminService.getPendingExams();

    res.json({
      success: true,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
},

  /**
   * Grade an exam
   */
  async gradeExam(req: Request, res: Response, next: NextFunction) {
  try {
    const { resultId } = req.params;
    const { score, passed } = req.body;

    if (typeof score !== 'number' || typeof passed !== 'boolean') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Score (number) and passed (boolean) are required',
        },
      });
      return;
    }

    const result = await adminService.gradeExam(resultId, score, passed);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
},
};
