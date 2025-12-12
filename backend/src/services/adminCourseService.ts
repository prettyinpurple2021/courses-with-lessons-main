import prisma from '../config/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import axios from 'axios';
import { logger } from '../utils/logger.js';

interface CourseData {
  courseNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  published?: boolean;
}

interface LessonData {
  lessonNumber: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
}

interface FinalProjectData {
  title: string;
  description: string;
  instructions: string;
  requirements: any;
}

interface FinalExamData {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: ExamQuestionData[];
}

interface ExamQuestionData {
  text: string;
  type: string;
  order: number;
  points: number;
  options?: ExamQuestionOptionData[];
}

interface ExamQuestionOptionData {
  text: string;
  isCorrect: boolean;
  order: number;
}

interface ActivityData {
  activityNumber: number;
  title: string;
  description: string;
  type: string;
  content: any;
  required?: boolean;
}

export const adminCourseService = {
  /**
   * Get all courses with lesson counts
   */
  async getAllCourses() {
    const courses = await prisma.course.findMany({
      orderBy: { courseNumber: 'asc' },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
        finalProject: {
          select: {
            id: true,
            title: true,
          },
        },
        finalExam: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return courses;
  },

  /**
   * Get course by ID with full details
   */
  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { lessonNumber: 'asc' },
          include: {
            _count: {
              select: {
                activities: true,
                resources: true,
              },
            },
          },
        },
        finalProject: true,
        finalExam: {
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return course;
  },

  /**
   * Create new course
   */
  async createCourse(data: CourseData) {
    // Check if course number already exists
    const existing = await prisma.course.findUnique({
      where: { courseNumber: data.courseNumber },
    });

    if (existing) {
      throw new ValidationError(`Course ${data.courseNumber} already exists`);
    }

    const course = await prisma.course.create({
      data: {
        courseNumber: data.courseNumber,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        published: data.published ?? false,
      },
    });

    return course;
  },

  /**
   * Update course
   */
  async updateCourse(id: string, data: Partial<CourseData>) {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.thumbnail && { thumbnail: data.thumbnail }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return course;
  },

  /**
   * Delete course
   */
  async deleteCourse(id: string) {
    await prisma.course.delete({
      where: { id },
    });
  },

  /**
   * Get all lessons for a course
   */
  async getCourseLessons(courseId: string) {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { lessonNumber: 'asc' },
      include: {
        _count: {
          select: {
            activities: true,
            resources: true,
          },
        },
      },
    });

    return lessons;
  },

  /**
   * Create lesson
   */
  async createLesson(courseId: string, data: LessonData) {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if lesson number already exists for this course
    const existing = await prisma.lesson.findUnique({
      where: {
        courseId_lessonNumber: {
          courseId,
          lessonNumber: data.lessonNumber,
        },
      },
    });

    if (existing) {
      throw new ValidationError(
        `Lesson ${data.lessonNumber} already exists for this course`
      );
    }

    // Validate YouTube video ID
    await this.validateYouTubeVideo(data.youtubeVideoId);

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        lessonNumber: data.lessonNumber,
        title: data.title,
        description: data.description,
        youtubeVideoId: data.youtubeVideoId,
        duration: data.duration,
      },
    });

    return lesson;
  },

  /**
   * Update lesson
   */
  async updateLesson(lessonId: string, data: Partial<LessonData>) {
    // If YouTube video ID is being updated, validate it
    if (data.youtubeVideoId) {
      await this.validateYouTubeVideo(data.youtubeVideoId);
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.youtubeVideoId && { youtubeVideoId: data.youtubeVideoId }),
        ...(data.duration && { duration: data.duration }),
      },
    });

    return lesson;
  },

  /**
   * Delete lesson
   */
  async deleteLesson(lessonId: string) {
    await prisma.lesson.delete({
      where: { id: lessonId },
    });
  },

  /**
   * Validate YouTube video ID and fetch metadata
   */
  async validateYouTubeVideo(videoId: string) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      // If no API key, just return basic validation
      logger.warn('YouTube API key not configured, skipping video validation');
      return {
        valid: true,
        videoId,
        title: 'Unknown',
        duration: 0,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: {
            part: 'snippet,contentDetails',
            id: videoId,
            key: apiKey,
          },
        }
      );

      if (!response.data.items || response.data.items.length === 0) {
        throw new ValidationError('YouTube video not found or is private');
      }

      const video = response.data.items[0];
      const duration = this.parseYouTubeDuration(video.contentDetails.duration);

      return {
        valid: true,
        videoId,
        title: video.snippet.title,
        duration,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ValidationError('Failed to validate YouTube video');
      }
      throw error;
    }
  },

  /**
   * Parse YouTube duration format (PT1H2M3S) to seconds
   */
  parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  },

  /**
   * Create final project for course
   */
  async createFinalProject(courseId: string, data: FinalProjectData) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { finalProject: true },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.finalProject) {
      throw new ValidationError('Final project already exists for this course');
    }

    const project = await prisma.finalProject.create({
      data: {
        courseId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        requirements: data.requirements,
      },
    });

    return project;
  },

  /**
   * Update final project
   */
  async updateFinalProject(projectId: string, data: Partial<FinalProjectData>) {
    const project = await prisma.finalProject.update({
      where: { id: projectId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.instructions && { instructions: data.instructions }),
        ...(data.requirements && { requirements: data.requirements }),
      },
    });

    return project;
  },

  /**
   * Create final exam for course
   */
  async createFinalExam(courseId: string, data: FinalExamData) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { finalExam: true },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.finalExam) {
      throw new ValidationError('Final exam already exists for this course');
    }

    const exam = await prisma.finalExam.create({
      data: {
        courseId,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        questions: {
          create: data.questions.map((q) => ({
            text: q.text,
            type: q.type,
            order: q.order,
            points: q.points,
            options: q.options
              ? {
                  create: q.options,
                }
              : undefined,
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return exam;
  },

  /**
   * Update final exam
   */
  async updateFinalExam(examId: string, data: Partial<FinalExamData>) {
    const exam = await prisma.finalExam.update({
      where: { id: examId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.timeLimit && { timeLimit: data.timeLimit }),
        ...(data.passingScore && { passingScore: data.passingScore }),
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return exam;
  },

  /**
   * Get all activities for a lesson
   */
  async getLessonActivities(lessonId: string) {
    const activities = await prisma.activity.findMany({
      where: { lessonId },
      orderBy: { activityNumber: 'asc' },
    });

    return activities;
  },

  /**
   * Create activity for lesson
   */
  async createActivity(lessonId: string, data: ActivityData) {
    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    // Check if activity number already exists for this lesson
    const existing = await prisma.activity.findUnique({
      where: {
        lessonId_activityNumber: {
          lessonId,
          activityNumber: data.activityNumber,
        },
      },
    });

    if (existing) {
      throw new ValidationError(
        `Activity ${data.activityNumber} already exists for this lesson`
      );
    }

    const activity = await prisma.activity.create({
      data: {
        lessonId,
        activityNumber: data.activityNumber,
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content,
        required: data.required ?? true,
      },
    });

    return activity;
  },

  /**
   * Update activity
   */
  async updateActivity(activityId: string, data: Partial<ActivityData>) {
    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.content && { content: data.content }),
        ...(data.required !== undefined && { required: data.required }),
      },
    });

    return activity;
  },

  /**
   * Delete activity
   */
  async deleteActivity(activityId: string) {
    await prisma.activity.delete({
      where: { id: activityId },
    });
  },
};
