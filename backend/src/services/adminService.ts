import prisma from '../config/prisma.js';
import { comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

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
};
