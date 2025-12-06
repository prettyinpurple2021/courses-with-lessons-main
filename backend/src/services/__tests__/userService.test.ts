import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { UserService } from '../userService.js';

const prisma = new PrismaClient();
const userService = new UserService();

describe('UserService', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
  });

  describe('getProfileData', () => {
    it('should return user profile data with statistics', async () => {
      const profileData = await userService.getProfileData(testUserId);

      expect(profileData).toBeDefined();
      expect(profileData.user).toBeDefined();
      expect(profileData.user.id).toBe(testUserId);
      expect(profileData.statistics).toBeDefined();
      expect(profileData.courseProgress).toBeDefined();
      expect(profileData.achievements).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        userService.getProfileData('non-existent-id')
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserStatistics', () => {
    it('should return zero statistics for new user', async () => {
      const statistics = await userService.getUserStatistics(testUserId);

      expect(statistics).toBeDefined();
      expect(statistics.coursesCompleted).toBe(0);
      expect(statistics.lessonsViewed).toBe(0);
      expect(statistics.activitiesCompleted).toBe(0);
      expect(statistics.averageExamScore).toBe(0);
    });

    it('should calculate correct statistics for user with progress', async () => {
      // Create course and enrollment
      const course = await prisma.course.create({
        data: {
          courseNumber: 1,
          title: 'Test Course',
          description: 'Test',
          thumbnail: 'thumb.jpg',
          published: true,
        },
      });

      await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: course.id,
          currentLesson: 1,
          unlockedCourses: 1,
          completedAt: new Date(),
        },
      });

      const statistics = await userService.getUserStatistics(testUserId);

      expect(statistics.coursesCompleted).toBe(1);

      // Clean up
      await prisma.enrollment.deleteMany({ where: { userId: testUserId } });
      await prisma.course.delete({ where: { id: course.id } });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile fields', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Test bio',
      };

      const updated = await userService.updateProfile(testUserId, updates);

      expect(updated.firstName).toBe('Updated');
      expect(updated.lastName).toBe('Name');
      expect(updated.bio).toBe('Test bio');
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        userService.updateProfile('non-existent-id', { firstName: 'Test' })
      ).rejects.toThrow('User not found');
    });
  });
});

