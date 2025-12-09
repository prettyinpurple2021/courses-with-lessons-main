import prisma from '../config/prisma.js';
import { comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { checkAndUnlockAchievements } from './achievementService.js';
import { completeCourse } from './finalExamService.js';

export const adminService = {
  /**
   * Admin login
   */
  async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalActivities,
      activeEnrollments,
      completedCourses,
      recentUsers,
    ] = await Promise.all([
      // Total users (excluding admins)
      prisma.user.count({
        where: { role: 'student' },
      }),

      // Total courses
      prisma.course.count(),

      // Total lessons
      prisma.lesson.count(),

      // Total activities
      prisma.activity.count(),

      // Active enrollments (not completed)
      prisma.enrollment.count({
        where: { completedAt: null },
      }),

      // Completed courses
      prisma.enrollment.count({
        where: { completedAt: { not: null } },
      }),

      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          role: 'student',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalLessons,
      totalActivities,
      activeEnrollments,
      completedCourses,
      recentUsers,
    };
  },

  /**
   * Get pending exams for review
   */
  async getPendingExams() {
    return prisma.finalExamResult.findMany({
      where: {
        gradingStatus: 'PENDING_REVIEW',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
  },

  /**
   * Grade an exam result
   */
  async gradeExam(resultId: string, score: number, passed: boolean) {
    const result = await prisma.finalExamResult.findUnique({
      where: { id: resultId },
    });

    if (!result) {
      throw new Error('Exam result not found');
    }

    // Update the result
    const updatedResult = await prisma.finalExamResult.update({
      where: { id: resultId },
      data: {
        score,
        passed,
        gradingStatus: 'GRADED',
      },
    });

    // If passed, trigger completion logic (achievements, course completion)
    // We can reuse the logic from finalExamService or duplicate it here.
    // For simplicity and to avoid circular dependencies, we'll implement the core completion logic here.

    if (passed) {
      // 1. Unlock 'Exam Master' achievement if score is 100
      // 1. Check for achievements
      try {
        await checkAndUnlockAchievements(result.userId, 'exam_submitted');
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }

      // 2. Check if course is completed (all lessons + final exam passed)
      const exam = await prisma.finalExam.findUnique({
        where: { id: result.examId },
        select: { courseId: true },
      });

      if (exam) {
        await completeCourse(result.userId, exam.courseId);
      }
    }

    return updatedResult;
  },
};
