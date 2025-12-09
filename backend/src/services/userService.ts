import prisma from '../config/prisma.js';

export class UserService {
  async getProfileData(userId: string) {
    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        emailNotifications: true,
        courseUpdates: true,
        communityDigest: true,
        achievementAlerts: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get statistics
    const statistics = await this.getUserStatistics(userId);

    // Get course progress
    const courseProgress = await this.getCourseProgress(userId);

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        rarity: true,
        unlockedAt: true,
      },
    });

    return {
      user,
      statistics,
      courseProgress,
      achievements,
    };
  }

  async getUserStatistics(userId: string) {
    // Count completed courses
    const coursesCompleted = await prisma.enrollment.count({
      where: {
        userId,
        completedAt: { not: null },
      },
    });

    // Count lessons viewed (completed)
    const lessonsViewed = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
      },
    });

    // Count activities completed
    const activitiesCompleted = await prisma.activitySubmission.count({
      where: {
        userId,
        completed: true,
      },
    });

    // Calculate average exam score
    const examResults = await prisma.finalExamResult.findMany({
      where: { userId },
      select: { score: true },
    });

    const averageScore =
      examResults.length > 0
        ? Math.round(examResults.reduce((sum: number, result: { score: number }) => sum + result.score, 0) / examResults.length)
        : 0;

    // Use real values from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalStudyTime: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    const totalStudyTime = user?.totalStudyTime || 0;
    const currentStreak = user?.currentStreak || 0;
    const longestStreak = user?.longestStreak || 0;

    return {
      coursesCompleted,
      lessonsViewed,
      activitiesCompleted,
      averageScore,
      totalStudyTime,
      currentStreak,
      longestStreak,
    };
  }

  async getCourseProgress(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            courseNumber: true,
            title: true,
            thumbnail: true,
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        course: {
          courseNumber: 'asc',
        },
      },
    });

    // Batch fetch all lesson progress to avoid N+1 queries
    const allLessonIds = enrollments.flatMap((enrollment) =>
      enrollment.course.lessons.map((l) => l.id)
    );

    const completedLessons = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
      select: {
        lessonId: true,
      },
    });

    const completedLessonIds = new Set(completedLessons.map((lp) => lp.lessonId));

    // Map progress data (no async operations in map)
    const progressData = enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.lessons.length;
      const completedCount = enrollment.course.lessons.filter((l) =>
        completedLessonIds.has(l.id)
      ).length;

      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (enrollment.completedAt) {
        status = 'completed';
      } else if (completedCount > 0) {
        status = 'in_progress';
      }

      return {
        courseId: enrollment.course.id,
        courseNumber: enrollment.course.courseNumber,
        courseTitle: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        progress,
        lessonsCompleted: completedCount,
        totalLessons,
        status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt: enrollment.completedAt?.toISOString(),
      };
    });

    return progressData;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      bio?: string;
    }
  ) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        emailNotifications: true,
        courseUpdates: true,
        communityDigest: true,
        achievementAlerts: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async updateAvatar(userId: string, avatarData: string) {
    const { uploadImageToCloudinary, deleteImageFromCloudinary, isCloudinaryConfigured } = await import('../utils/imageUpload.js');

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    let avatarUrl = avatarData;

    // If Cloudinary is configured and data is base64, upload to Cloudinary
    if (isCloudinaryConfigured() && avatarData.startsWith('data:image')) {
      try {
        avatarUrl = await uploadImageToCloudinary(avatarData, 'avatars');

        // Delete old avatar from Cloudinary if it exists
        if (currentUser?.avatar && currentUser.avatar.includes('cloudinary.com')) {
          await deleteImageFromCloudinary(currentUser.avatar);
        }
      } catch (error) {
        console.error('Failed to upload to Cloudinary, using base64:', error);
        // Fall back to storing base64 if Cloudinary fails
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        emailNotifications: true,
        courseUpdates: true,
        communityDigest: true,
        achievementAlerts: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const bcrypt = await import('bcrypt');

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean;
      courseUpdates?: boolean;
      communityDigest?: boolean;
      achievementAlerts?: boolean;
    }
  ) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: preferences,
      select: {
        id: true,
        emailNotifications: true,
        courseUpdates: true,
        communityDigest: true,
        achievementAlerts: true,
      },
    });

    return updatedUser;
  }

  async deleteAccount(userId: string, password: string) {
    const bcrypt = await import('bcrypt');

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Password is incorrect');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  }

  /**
   * Export all user data for GDPR compliance (right to data portability)
   */
  async exportUserData(userId: string) {
    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        emailNotifications: true,
        courseUpdates: true,
        communityDigest: true,
        achievementAlerts: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get enrollments and progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            courseNumber: true,
          },
        },
      },
    });

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            title: true,
            lessonNumber: true,
          },
        },
      },
    });

    // Get activity submissions
    const activitySubmissions = await prisma.activitySubmission.findMany({
      where: { userId },
      include: {
        activity: {
          select: {
            title: true,
            type: true,
          },
        },
      },
    });

    // Get notes
    const notes = await prisma.note.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get forum posts
    const forumPosts = await prisma.forumPost.findMany({
      where: { authorId: userId },
      select: {
        content: true,
        createdAt: true,
        thread: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get forum threads
    const forumThreads = await prisma.forumThread.findMany({
      where: { authorId: userId },
      select: {
        title: true,
        createdAt: true,
      },
    });

    // Get certificates
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      select: {
        verificationCode: true,
        issuedAt: true,
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      select: {
        title: true,
        description: true,
        unlockedAt: true,
      },
    });

    // Get exam results
    const examResults = await prisma.finalExamResult.findMany({
      where: { userId },
      include: {
        exam: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Get cookie consent records
    const cookieConsents = await prisma.cookieConsent.findMany({
      where: { userId },
      select: {
        preferences: true,
        version: true,
        timestamp: true,
      },
    });

    return {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      profile: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        accountCreated: user.createdAt,
      },
      preferences: {
        emailNotifications: user.emailNotifications,
        courseUpdates: user.courseUpdates,
        communityDigest: user.communityDigest,
        achievementAlerts: user.achievementAlerts,
      },
      enrollments: enrollments.map((e) => ({
        course: e.course.title,
        courseNumber: e.course.courseNumber,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
      })),
      lessonProgress: lessonProgress.map((lp) => ({
        lesson: lp.lesson.title,
        lessonNumber: lp.lesson.lessonNumber,
        completed: lp.completed,
        videoPosition: lp.videoPosition,
        completedAt: lp.completedAt,
      })),
      activitySubmissions: activitySubmissions.map((as) => ({
        activity: as.activity.title,
        type: as.activity.type,
        response: as.response,
        completed: as.completed,
        submittedAt: as.submittedAt,
      })),
      notes: notes.map((n) => ({
        lesson: n.lesson.title,
        content: n.content,
        timestamp: n.timestamp,
        createdAt: n.createdAt,
      })),
      forumThreads: forumThreads.map((t) => ({
        title: t.title,
        createdAt: t.createdAt,
      })),
      forumPosts: forumPosts.map((p) => ({
        threadTitle: p.thread.title,
        content: p.content,
        createdAt: p.createdAt,
      })),
      certificates: certificates.map((c) => ({
        course: c.course.title,
        verificationCode: c.verificationCode,
        issuedAt: c.issuedAt,
      })),
      achievements: achievements.map((a) => ({
        title: a.title,
        description: a.description,
        unlockedAt: a.unlockedAt,
      })),
      examResults: examResults.map((er) => ({
        course: er.exam.course.title,
        score: er.score,
        passed: er.passed,
        submittedAt: er.submittedAt,
      })),
      cookieConsents: cookieConsents.map((cc) => ({
        preferences: cc.preferences,
        version: cc.version,
        timestamp: cc.timestamp,
      })),
    };
  }
}

export const userService = new UserService();
