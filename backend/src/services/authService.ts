import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt.js';
import { generateResetToken, verifyResetToken, deleteResetToken } from '../utils/tokenStore.js';
import emailService from './emailService.js';
import { ValidationError, AuthenticationError, ConflictError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user account
   * 
   * Validates password strength, checks for existing user, hashes password,
   * creates user account, auto-enrolls in Course One, and generates JWT tokens.
   * 
   * @param input - Registration data containing email, password, firstName, lastName
   * @returns Authentication response with user data and JWT tokens
   * @throws ValidationError if password doesn't meet strength requirements
   * @throws ConflictError if user with email already exists
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = input;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message);
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      // Auto-enroll in Course One
      // Use upsert for atomic enrollment creation to handle edge cases
      const courseOne = await prisma.course.findFirst({
        where: { courseNumber: 1 },
      });

      if (courseOne) {
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: courseOne.id,
            },
          },
          create: {
            userId: user.id,
            courseId: courseOne.id,
            currentLesson: 1,
            unlockedCourses: 1,
          },
          update: {
            // No-op: enrollment already exists (shouldn't happen on registration, but safe)
          },
        });
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate user and generate JWT tokens
   * 
   * Validates email and password, auto-enrolls in Course One if user has no enrollments,
   * and generates access and refresh tokens.
   * 
   * @param input - Login credentials containing email and password
   * @returns Authentication response with user data and JWT tokens
   * @throws AuthenticationError if email or password is invalid
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Auto-enroll in Course One if user has no enrollments
      // Use transaction with upsert to atomically handle race conditions where
      // concurrent login requests might try to create the same enrollment
      await prisma.$transaction(async (tx) => {
        // Check if user has any enrollments (atomic within transaction)
        const existingEnrollments = await tx.enrollment.findFirst({
          where: { userId: user.id },
        });

        // Only create Course One enrollment if user has no enrollments
        if (!existingEnrollments) {
          const courseOne = await tx.course.findFirst({
            where: { courseNumber: 1 },
          });

          if (courseOne) {
            // Use upsert to handle race condition: if another concurrent request
            // created the enrollment between our check and this upsert, upsert will
            // update instead of failing with unique constraint violation
            await tx.enrollment.upsert({
              where: {
                userId_courseId: {
                  userId: user.id,
                  courseId: courseOne.id,
                },
              },
              create: {
                userId: user.id,
                courseId: courseOne.id,
                currentLesson: 1,
                unlockedCourses: 1,
              },
              update: {
                // No-op: enrollment already exists from concurrent request, keep existing data
              },
            });
          }
        }
      });

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(_refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // This will be implemented in the controller using verifyRefreshToken
    throw new Error('Method should be called from controller');
  }

  /**
   * Request password reset token
   * 
   * Generates a reset token and sends it via email. Returns a generic message
   * to prevent email enumeration attacks.
   * 
   * @param email - User's email address
   * @returns Generic success message (doesn't reveal if user exists)
   */
  async requestPasswordReset(email: string): Promise<string> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return 'If an account exists with this email, a password reset link has been sent';
    }

    // Generate reset token
    const resetToken = generateResetToken(user.id);

    // Send password reset email
    if (emailService.isConfigured()) {
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (error) {
        logger.error('Failed to send password reset email', { error, email });
        // Log token for development/testing (only in dev mode)
        if (process.env.NODE_ENV === 'development') {
          logger.info(`Password reset token for ${email}: ${resetToken}`);
          logger.info(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
        }
      }
    } else {
      // Fallback: log token if email not configured (only in dev mode)
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Password reset token for ${email}: ${resetToken}`);
        logger.info(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
      }
    }

    return 'If an account exists with this email, a password reset link has been sent';
  }

  /**
   * Reset user password using reset token
   * 
   * Validates token, checks password strength, hashes new password, and updates user.
   * 
   * @param token - Password reset token from email
   * @param newPassword - New password to set
   * @throws ValidationError if token is invalid/expired or password doesn't meet requirements
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify token
    const userId = verifyResetToken(token);

    if (!userId) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete used token
    deleteResetToken(token);
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export const authService = new AuthService();
