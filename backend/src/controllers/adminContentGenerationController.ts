import { Request, Response, NextFunction } from 'express';
import * as contentGenerationService from '../services/contentGenerationService.js';
import { adminCourseService } from '../services/adminCourseService.js';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export const adminContentGenerationController = {
  /**
   * Generate a single activity
   */
  async generateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const { activityType, activityNumber, position } = req.body;

      // Generate the activity
      const activity = await contentGenerationService.generateActivity({
        lessonId,
        activityType,
        activityNumber,
        position,
      });

      // Save to database
      const savedActivity = await adminCourseService.createActivity(lessonId, {
        activityNumber,
        title: activity.title,
        description: activity.description,
        type: activityType,
        content: activity.content,
        required: true,
      });

      res.status(201).json({
        success: true,
        data: savedActivity,
        message: 'Activity generated and saved successfully',
      });
    } catch (error) {
      logger.error('Error generating activity', { error, lessonId: req.params.lessonId });
      next(error);
    }
  },

  /**
   * Generate multiple activities for a lesson
   */
  async generateLessonActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const { activityPlan, dryRun } = req.body;

      // Get lesson info
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: {
            select: {
              courseNumber: true,
              title: true,
            },
          },
          activities: {
            orderBy: { activityNumber: 'asc' },
          },
        },
      });

      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lesson not found' },
        });
      }

      // Generate activities
      const activities = await contentGenerationService.generateLessonActivities(
        lessonId,
        activityPlan
      );

      if (dryRun) {
        return res.json({
          success: true,
          data: {
            lesson: {
              id: lesson.id,
              title: lesson.title,
              course: lesson.course.title,
            },
            activities,
            dryRun: true,
            message: 'Activities generated (dry run - not saved)',
          },
        });
      }

      // Save activities
      const savedActivities = [];
      const startActivityNumber = lesson.activities.length + 1;

      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const activityNumber = startActivityNumber + i;

        try {
          const saved = await adminCourseService.createActivity(lessonId, {
            activityNumber,
            title: activity.title,
            description: activity.description,
            type: activity.content.questions ? 'quiz' :
                  activity.content.steps ? 'exercise' :
                  activity.content.objectives ? 'practical_task' : 'reflection',
            content: activity.content,
            required: true,
          });

          savedActivities.push(saved);
        } catch (error) {
          logger.error(`Failed to save activity ${activityNumber}`, { error });
          throw error;
        }
      }

      res.status(201).json({
        success: true,
        data: {
          lesson: {
            id: lesson.id,
            title: lesson.title,
            course: lesson.course.title,
          },
          activities: savedActivities,
          count: savedActivities.length,
        },
        message: `Successfully generated and saved ${savedActivities.length} activities`,
      });
    } catch (error) {
      logger.error('Error generating lesson activities', { error, lessonId: req.params.lessonId });
      next(error);
    }
  },

  /**
   * Generate activities for all lessons in a course
   */
  async generateCourseActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const { dryRun } = req.body;

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          lessons: {
            orderBy: { lessonNumber: 'asc' },
            include: {
              activities: true,
            },
          },
        },
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' },
        });
      }

      const results = [];

      for (const lesson of course.lessons) {
        try {
          const activities = await contentGenerationService.generateLessonActivities(lesson.id);

          if (!dryRun) {
            const startActivityNumber = lesson.activities.length + 1;

            for (let i = 0; i < activities.length; i++) {
              const activity = activities[i];
              const activityNumber = startActivityNumber + i;

              await adminCourseService.createActivity(lesson.id, {
                activityNumber,
                title: activity.title,
                description: activity.description,
                type: activity.content.questions ? 'quiz' :
                      activity.content.steps ? 'exercise' :
                      activity.content.objectives ? 'practical_task' : 'reflection',
                content: activity.content,
                required: true,
              });
            }
          }

          results.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonNumber: lesson.lessonNumber,
            activitiesGenerated: activities.length,
            status: 'success',
          });
        } catch (error) {
          logger.error(`Error generating activities for lesson ${lesson.id}`, { error });
          results.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonNumber: lesson.lessonNumber,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // Add delay between lessons
        if (lesson !== course.lessons[course.lessons.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      res.json({
        success: true,
        data: {
          course: {
            id: course.id,
            title: course.title,
            courseNumber: course.courseNumber,
          },
          results,
          dryRun: dryRun || false,
          totalLessons: course.lessons.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'error').length,
        },
        message: dryRun
          ? `Generated activities for ${course.lessons.length} lessons (dry run - not saved)`
          : `Successfully generated activities for ${results.filter(r => r.status === 'success').length} lessons`,
      });
    } catch (error) {
      logger.error('Error generating course activities', { error, courseId: req.params.courseId });
      next(error);
    }
  },
};

