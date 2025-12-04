import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt.js';
import { generateResetToken, verifyResetToken, deleteResetToken } from '../utils/tokenStore.js';
import emailService from './emailService.js';
import { ValidationError, AuthenticationError, ConflictError, NotFoundError } from '../utils/errors.js';

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
      const courseOne = await prisma.course.findFirst({
        where: { courseNumber: 1 },
      });

      if (courseOne) {
        await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseId: courseOne.id,
            currentLesson: 1,
            unlockedCourses: 1,
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
        console.error('Failed to send password reset email:', error);
        // Still log to console as fallback
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
      }
    } else {
      // Fallback: log to console if email not configured
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    }

    return 'If an account exists with this email, a password reset link has been sent';
  }

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
