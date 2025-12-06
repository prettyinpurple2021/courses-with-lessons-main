import { Request, Response } from 'express';
import { userService } from '../services/userService.js';
import { stripHtmlTags } from '../utils/sanitization.js';

export class UserController {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const profileData = await userService.getProfileData(req.user.userId);

      return res.status(200).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      return res.status(500).json({
        success: false,
        error: { message },
      });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const statistics = await userService.getUserStatistics(req.user.userId);

      return res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch statistics';
      return res.status(500).json({
        success: false,
        error: { message },
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { firstName, lastName, bio } = req.body;

      // Validation
      const errors: string[] = [];

      if (firstName !== undefined) {
        if (typeof firstName !== 'string' || firstName.trim().length < 2) {
          errors.push('First name must be at least 2 characters');
        }
      }

      if (lastName !== undefined) {
        if (typeof lastName !== 'string' || lastName.trim().length < 2) {
          errors.push('Last name must be at least 2 characters');
        }
      }

      if (bio !== undefined) {
        if (typeof bio !== 'string' || bio.length > 500) {
          errors.push('Bio must be 500 characters or less');
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: { message: errors.join(', ') },
        });
      }

      // Strip HTML tags from user-generated content for security
      const sanitizedBio = bio !== undefined ? stripHtmlTags(bio) : undefined;

      const updatedUser = await userService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        bio: sanitizedBio,
      });

      return res.status(200).json({
        success: true,
        data: { user: updatedUser },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      return res.status(500).json({
        success: false,
        error: { message },
      });
    }
  }

  async updateAvatar(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      // Accept either avatarUrl (string) or avatarData (base64)
      const { avatarUrl, avatarData } = req.body;

      if (!avatarUrl && !avatarData) {
        return res.status(400).json({
          success: false,
          error: { message: 'Avatar URL or data is required' },
        });
      }

      // Use avatarData if provided (base64), otherwise use avatarUrl
      const avatarToSave = avatarData || avatarUrl;

      const updatedUser = await userService.updateAvatar(req.user.userId, avatarToSave);

      return res.status(200).json({
        success: true,
        data: {
          avatarUrl: updatedUser.avatar,
          user: updatedUser
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update avatar';
      return res.status(500).json({
        success: false,
        error: { message },
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password and new password are required' },
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: { message: 'New password must be at least 8 characters' },
        });
      }

      await userService.changePassword(req.user.userId, currentPassword, newPassword);

      return res.status(200).json({
        success: true,
        data: { message: 'Password changed successfully' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      const statusCode = message === 'Current password is incorrect' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: { message },
      });
    }
  }

  async updateNotificationPreferences(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { emailNotifications, courseUpdates, communityDigest, achievementAlerts } = req.body;

      const updatedPreferences = await userService.updateNotificationPreferences(req.user.userId, {
        emailNotifications,
        courseUpdates,
        communityDigest,
        achievementAlerts,
      });

      return res.status(200).json({
        success: true,
        data: updatedPreferences,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update notification preferences';
      return res.status(500).json({
        success: false,
        error: { message },
      });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: { message: 'Password is required to delete account' },
        });
      }

      await userService.deleteAccount(req.user.userId, password);

      return res.status(200).json({
        success: true,
        data: { message: 'Account deleted successfully' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      const statusCode = message === 'Password is incorrect' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: { message },
      });
    }
  }

  async exportData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const exportedData = await userService.exportUserData(req.user.userId);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="my-data-export.json"');

      return res.status(200).json({
        success: true,
        data: exportedData,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export data';
      return res.status(500).json({
        success: false,
        error: { message },
      });
    }
  }
}

export const userController = new UserController();

