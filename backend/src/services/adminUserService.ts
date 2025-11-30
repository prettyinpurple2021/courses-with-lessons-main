import prisma from '../config/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

interface UserFilters {
  search?: string;
  role?: string;
  courseId?: string;
  status?: 'active' | 'suspended';
}

export const adminUserService = {
  /**
   * Get all users with filters and pagination
   */
  async getAllUsers(filters: UserFilters, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search by name or email
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (filters.role) {
      where.role = filters.role;
    }

    // Filter by course enrollment
    if (filters.courseId) {
      where.enrollments = {
        some: {
          courseId: filters.courseId,
        },
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
              certificates: true,
              activitySubmissions: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get user by ID with full progress details
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                courseNumber: true,
                title: true,
                thumbnail: true,
              },
            },
          },
          orderBy: {
            enrolledAt: 'asc',
          },
        },
        certificates: {
          include: {
            course: {
              select: {
                courseNumber: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            activitySubmissions: true,
            lessonProgress: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  /**
   * Get user progress across all courses
   */
  async getUserProgress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get all courses
    const courses = await prisma.course.findMany({
      orderBy: { courseNumber: 'asc' },
      include: {
        lessons: {
          orderBy: { lessonNumber: 'asc' },
          include: {
            activities: true,
          },
        },
        finalProject: true,
        finalExam: true,
      },
    });

    // Get user's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
    });

    // Get user's lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { userId },
    });

    // Get user's activity submissions
    const activitySubmissions = await prisma.activitySubmission.findMany({
      where: { userId, completed: true },
    });

    // Get user's final project submissions
    const projectSubmissions = await prisma.finalProjectSubmission.findMany({
      where: { userId },
    });

    // Get user's final exam results
    const examResults = await prisma.finalExamResult.findMany({
      where: { userId },
    });

    // Build progress data for each course
    const progressData = courses.map((course: any) => {
      const enrollment = enrollments.find((e: any) => e.courseId === course.id);
      const isEnrolled = !!enrollment;
      const isCompleted = !!enrollment?.completedAt;

      // Calculate lesson progress
      const completedLessons = lessonProgress.filter(
        (lp: any) =>
          lp.completed &&
          course.lessons.some((lesson: any) => lesson.id === lp.lessonId)
      ).length;

      // Calculate activity progress
      const totalActivities = course.lessons.reduce(
        (sum: number, lesson: any) => sum + lesson.activities.length,
        0
      );
      const completedActivities = activitySubmissions.filter((as: any) =>
        course.lessons.some((lesson: any) =>
          lesson.activities.some((activity: any) => activity.id === as.activityId)
        )
      ).length;

      // Check final project status
      const projectSubmission = course.finalProject
        ? projectSubmissions.find((ps: any) => ps.projectId === course.finalProject!.id)
        : null;

      // Check final exam status
      const examResult = course.finalExam
        ? examResults.find((er: any) => er.examId === course.finalExam!.id)
        : null;

      return {
        courseId: course.id,
        courseNumber: course.courseNumber,
        courseTitle: course.title,
        isEnrolled,
        isCompleted,
        enrolledAt: enrollment?.enrolledAt,
        completedAt: enrollment?.completedAt,
        currentLesson: enrollment?.currentLesson || 1,
        totalLessons: course.lessons.length,
        completedLessons,
        totalActivities,
        completedActivities,
        finalProjectStatus: projectSubmission?.status || 'not_started',
        finalExamPassed: examResult?.passed || false,
        finalExamScore: examResult?.score,
      };
    });

    return {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      courses: progressData,
    };
  },

  /**
   * Get detailed activity completion status for a user
   */
  async getUserActivityStatus(userId: string, courseId?: string) {
    const where: any = { userId };

    if (courseId) {
      // Get activities for specific course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          lessons: {
            include: {
              activities: true,
            },
          },
        },
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const activityIds = course.lessons.flatMap((lesson: any) =>
        lesson.activities.map((activity: any) => activity.id)
      );

      where.activityId = { in: activityIds };
    }

    const submissions = await prisma.activitySubmission.findMany({
      where,
      include: {
        activity: {
          include: {
            lesson: {
              include: {
                course: {
                  select: {
                    courseNumber: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return submissions.map((submission: any) => ({
      activityId: submission.activityId,
      activityTitle: submission.activity.title,
      activityType: submission.activity.type,
      lessonNumber: submission.activity.lesson.lessonNumber,
      lessonTitle: submission.activity.lesson.title,
      courseNumber: submission.activity.lesson.course.courseNumber,
      courseTitle: submission.activity.lesson.course.title,
      completed: submission.completed,
      submittedAt: submission.submittedAt,
      feedback: submission.feedback,
    }));
  },

  /**
   * Manually unlock a course for a user
   */
  async unlockCourse(userId: string, courseNumber: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const course = await prisma.course.findUnique({
      where: { courseNumber },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      throw new ValidationError('User is already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id,
        unlockedCourses: courseNumber,
      },
    });

    return enrollment;
  },

  /**
   * Manually unlock a lesson for a user
   */
  async unlockLesson(userId: string, lessonId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ValidationError('User is not enrolled in this course');
    }

    // Update enrollment to unlock this lesson
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
      data: {
        currentLesson: lesson.lessonNumber,
      },
    });

    // Create or update lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        completed: false,
      },
      update: {},
    });

    return { success: true, message: 'Lesson unlocked successfully' };
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string) {
    if (!['student', 'admin'].includes(role)) {
      throw new ValidationError('Invalid role. Must be "student" or "admin"');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return user;
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: 'User deleted successfully' };
  },
};
