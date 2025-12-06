import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as lessonService from '../lessonService.js';

const prisma = new PrismaClient();

describe('LessonService', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  let testUserId: string;
  let testCourseId: string;
  let testLessonId: string;

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

    // Create test lesson
    const lesson = await prisma.lesson.create({
      data: {
        courseId: testCourseId,
        lessonNumber: 1,
        title: 'Test Lesson',
        description: 'Test Description',
        youtubeVideoId: 'test-video-id',
        duration: 600,
      },
    });
    testLessonId = lesson.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.lessonProgress.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.activitySubmission.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.activity.deleteMany({
      where: { lessonId: testLessonId },
    });
    await prisma.lesson.deleteMany({
      where: { id: testLessonId },
    });
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

  describe('getLessonById', () => {
    it('should return lesson details with activities', async () => {
      // Create activity
      await prisma.activity.create({
        data: {
          lessonId: testLessonId,
          activityNumber: 1,
          title: 'Test Activity',
          description: 'Test',
          type: 'quiz',
          content: { questions: [] },
          required: true,
        },
      });

      const lesson = await lessonService.getLessonById(testUserId, testLessonId);

      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe(testLessonId);
      expect(lesson?.activities).toBeDefined();
      expect(lesson?.activities.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent lesson', async () => {
      const lesson = await lessonService.getLessonById(testUserId, 'non-existent-id');
      expect(lesson).toBeNull();
    });

    it('should mark activities as locked based on sequential progression', async () => {
      // Create multiple activities
      await prisma.activity.createMany({
        data: [
          {
            lessonId: testLessonId,
            activityNumber: 1,
            title: 'Activity 1',
            type: 'quiz',
            content: {},
            required: true,
          },
          {
            lessonId: testLessonId,
            activityNumber: 2,
            title: 'Activity 2',
            type: 'quiz',
            content: {},
            required: true,
          },
        ],
      });

      const lesson = await lessonService.getLessonById(testUserId, testLessonId);

      expect(lesson?.activities[0].isLocked).toBe(false); // First activity unlocked
      expect(lesson?.activities[1].isLocked).toBe(true); // Second activity locked
    });
  });

  describe('updateLessonProgress', () => {
    it('should create progress record if it does not exist', async () => {
      await lessonService.updateLessonProgress(testUserId, testLessonId, 30);

      const progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId,
          },
        },
      });

      expect(progress).toBeDefined();
      expect(progress?.videoPosition).toBe(30);
    });

    it('should update existing progress record', async () => {
      // Create initial progress
      await prisma.lessonProgress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          videoPosition: 10,
          currentActivity: 1,
        },
      });

      await lessonService.updateLessonProgress(testUserId, testLessonId, 50);

      const progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId,
          },
        },
      });

      expect(progress?.videoPosition).toBe(50);
    });
  });

  describe('completeLesson', () => {
    it('should mark lesson as completed', async () => {
      // Create required activity and complete it
      const activity = await prisma.activity.create({
        data: {
          lessonId: testLessonId,
          activityNumber: 1,
          title: 'Required Activity',
          type: 'quiz',
          content: {},
          required: true,
        },
      });

      await prisma.activitySubmission.create({
        data: {
          userId: testUserId,
          activityId: activity.id,
          response: {},
          completed: true,
        },
      });

      await lessonService.completeLesson(testUserId, testLessonId);

      const progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId,
          },
        },
      });

      expect(progress?.completed).toBe(true);
    });

    it('should not complete lesson if required activities are incomplete', async () => {
      // Create required activity but don't complete it
      await prisma.activity.create({
        data: {
          lessonId: testLessonId,
          activityNumber: 1,
          title: 'Required Activity',
          type: 'quiz',
          content: {},
          required: true,
        },
      });

      await expect(
        lessonService.completeLesson(testUserId, testLessonId)
      ).rejects.toThrow();
    });
  });
});

