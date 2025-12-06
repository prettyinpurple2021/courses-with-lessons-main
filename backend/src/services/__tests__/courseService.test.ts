import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as courseService from '../courseService.js';
import * as webhookService from '../webhookService.js';
import * as achievementService from '../achievementService.js';

// Mock dependencies
vi.mock('../webhookService.js');
vi.mock('../achievementService.js');

const prisma = new PrismaClient();

describe('CourseService', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  let testUserId: string;
  let testCourseId: string;

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

    // Create test course
    const course = await prisma.course.create({
      data: {
        courseNumber: 1,
        title: 'Test Course',
        description: 'Test Description',
        thumbnail: 'test-thumbnail.jpg',
        published: true,
      },
    });
    testCourseId = course.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.enrollment.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.course.deleteMany({
      where: { id: testCourseId },
    });
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
  });

  describe('getCoursesWithLockStatus', () => {
    it('should return courses with correct lock status for new user', async () => {
      const courses = await courseService.getCoursesWithLockStatus(testUserId);

      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      
      // Course One should be unlocked for new users
      const courseOne = courses.find(c => c.courseNumber === 1);
      expect(courseOne).toBeDefined();
      expect(courseOne?.isLocked).toBe(false);
    });

    it('should mark Course One as enrolled when user enrolls', async () => {
      // Enroll user in Course One
      await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: testCourseId,
          currentLesson: 1,
          unlockedCourses: 1,
        },
      });

      const courses = await courseService.getCoursesWithLockStatus(testUserId);
      const courseOne = courses.find(c => c.id === testCourseId);
      
      expect(courseOne?.isEnrolled).toBe(true);
      expect(courseOne?.isLocked).toBe(false);
    });

    it('should lock Course Two until Course One is completed', async () => {
      // Create Course Two
      const courseTwo = await prisma.course.create({
        data: {
          courseNumber: 2,
          title: 'Course Two',
          description: 'Description',
          thumbnail: 'thumb.jpg',
          published: true,
        },
      });

      const courses = await courseService.getCoursesWithLockStatus(testUserId);
      const courseTwoResult = courses.find(c => c.id === courseTwo.id);
      
      expect(courseTwoResult?.isLocked).toBe(true);

      // Clean up
      await prisma.course.delete({ where: { id: courseTwo.id } });
    });
  });

  describe('getCourseDetails', () => {
    it('should return course details with lessons', async () => {
      // Create a lesson for the course
      await prisma.lesson.create({
        data: {
          courseId: testCourseId,
          lessonNumber: 1,
          title: 'Test Lesson',
          description: 'Test Description',
          youtubeVideoId: 'test-video-id',
          duration: 600,
        },
      });

      const details = await courseService.getCourseDetails(testCourseId, testUserId);

      expect(details).toBeDefined();
      expect(details.id).toBe(testCourseId);
      expect(details.lessons).toBeDefined();
      expect(details.lessons.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent course', async () => {
      const details = await courseService.getCourseDetails('non-existent-id', testUserId);
      expect(details).toBeNull();
    });
  });

  describe('enrollUserInCourse', () => {
    it('should enroll user in Course One', async () => {
      const enrollment = await courseService.enrollUserInCourse(testUserId, testCourseId);

      expect(enrollment).toBeDefined();
      expect(enrollment.userId).toBe(testUserId);
      expect(enrollment.courseId).toBe(testCourseId);
      expect(enrollment.currentLesson).toBe(1);
      expect(enrollment.unlockedCourses).toBe(1);
    });

    it('should not allow duplicate enrollment', async () => {
      // First enrollment
      await courseService.enrollUserInCourse(testUserId, testCourseId);

      // Attempt second enrollment should throw or return existing
      await expect(
        courseService.enrollUserInCourse(testUserId, testCourseId)
      ).rejects.toThrow();
    });
  });

  describe('completeCourse', () => {
    it('should mark course as completed and unlock next course', async () => {
      // Enroll user
      await courseService.enrollUserInCourse(testUserId, testCourseId);

      // Create Course Two
      const courseTwo = await prisma.course.create({
        data: {
          courseNumber: 2,
          title: 'Course Two',
          description: 'Description',
          thumbnail: 'thumb.jpg',
          published: true,
        },
      });

      // Complete Course One
      await courseService.completeCourse(testUserId, testCourseId);

      // Check enrollment updated
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId,
          },
        },
      });

      expect(enrollment?.completed).toBe(true);

      // Check Course Two is unlocked
      const courses = await courseService.getCoursesWithLockStatus(testUserId);
      const courseTwoResult = courses.find(c => c.id === courseTwo.id);
      expect(courseTwoResult?.isLocked).toBe(false);

      // Clean up
      await prisma.course.delete({ where: { id: courseTwo.id } });
    });

    it('should call achievement service when course is completed', async () => {
      await courseService.enrollUserInCourse(testUserId, testCourseId);
      
      await courseService.completeCourse(testUserId, testCourseId);

      expect(achievementService.checkAndUnlockAchievements).toHaveBeenCalled();
    });
  });
});
