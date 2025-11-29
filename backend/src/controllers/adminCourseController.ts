import { Request, Response, NextFunction } from 'express';
import { adminCourseService } from '../services/adminCourseService';

export const adminCourseController = {
  /**
   * Get all courses for admin management
   */
  async getAllCourses(_req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await adminCourseService.getAllCourses();

      res.json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get course by ID with full details
   */
  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await adminCourseService.getCourseById(id);

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new course
   */
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const courseData = req.body;
      const course = await adminCourseService.createCourse(courseData);

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update course
   */
  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const courseData = req.body;
      const course = await adminCourseService.updateCourse(id, courseData);

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete course
   */
  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminCourseService.deleteCourse(id);

      res.json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all lessons for a course
   */
  async getCourseLessons(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const lessons = await adminCourseService.getCourseLessons(courseId);

      res.json({
        success: true,
        data: lessons,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create lesson
   */
  async createLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const lessonData = req.body;
      const lesson = await adminCourseService.createLesson(courseId, lessonData);

      res.status(201).json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update lesson
   */
  async updateLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const lessonData = req.body;
      const lesson = await adminCourseService.updateLesson(lessonId, lessonData);

      res.json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete lesson
   */
  async deleteLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      await adminCourseService.deleteLesson(lessonId);

      res.json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Validate YouTube video ID
   */
  async validateYouTubeVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const videoData = await adminCourseService.validateYouTubeVideo(videoId);

      res.json({
        success: true,
        data: videoData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create final project for course
   */
  async createFinalProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const projectData = req.body;
      const project = await adminCourseService.createFinalProject(courseId, projectData);

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update final project
   */
  async updateFinalProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const projectData = req.body;
      const project = await adminCourseService.updateFinalProject(projectId, projectData);

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create final exam for course
   */
  async createFinalExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const examData = req.body;
      const exam = await adminCourseService.createFinalExam(courseId, examData);

      res.status(201).json({
        success: true,
        data: exam,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update final exam
   */
  async updateFinalExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { examId } = req.params;
      const examData = req.body;
      const exam = await adminCourseService.updateFinalExam(examId, examData);

      res.json({
        success: true,
        data: exam,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all activities for a lesson
   */
  async getLessonActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const activities = await adminCourseService.getLessonActivities(lessonId);

      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create activity
   */
  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const activityData = req.body;
      const activity = await adminCourseService.createActivity(lessonId, activityData);

      res.status(201).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update activity
   */
  async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { activityId } = req.params;
      const activityData = req.body;
      const activity = await adminCourseService.updateActivity(activityId, activityData);

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete activity
   */
  async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { activityId } = req.params;
      await adminCourseService.deleteActivity(activityId);

      res.json({
        success: true,
        message: 'Activity deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
