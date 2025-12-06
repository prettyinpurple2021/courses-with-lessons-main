import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllCourses, getCourseById, enrollInCourse, checkCourseAccess } from '../courseService';
import { api } from '../api';

// Mock the api module
vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('courseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCourses', () => {
    it('should fetch and return all courses', async () => {
      const mockCourses = [
        {
          id: '1',
          courseNumber: 1,
          title: 'Course One',
          description: 'Description',
          thumbnail: 'thumb.jpg',
          isLocked: false,
          isEnrolled: true,
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        data: {
          success: true,
          data: mockCourses,
        },
      });

      const courses = await getAllCourses();

      expect(api.get).toHaveBeenCalledWith('/courses');
      expect(courses).toEqual(mockCourses);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(getAllCourses()).rejects.toThrow('Network error');
    });
  });

  describe('getCourseById', () => {
    it('should fetch and return course details', async () => {
      const mockCourseDetails = {
        id: '1',
        courseNumber: 1,
        title: 'Course One',
        description: 'Description',
        lessons: [],
        finalProject: null,
        finalExam: null,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: {
          success: true,
          data: mockCourseDetails,
        },
      });

      const course = await getCourseById('1');

      expect(api.get).toHaveBeenCalledWith('/courses/1');
      expect(course).toEqual(mockCourseDetails);
    });
  });

  describe('enrollInCourse', () => {
    it('should enroll user in course', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true },
      });

      await enrollInCourse('course-id');

      expect(api.post).toHaveBeenCalledWith('/courses/course-id/enroll');
    });

    it('should handle enrollment errors', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Enrollment failed'));

      await expect(enrollInCourse('course-id')).rejects.toThrow('Enrollment failed');
    });
  });

  describe('checkCourseAccess', () => {
    it('should check if user can access course', async () => {
      const mockAccess = {
        canAccess: true,
        message: 'You can access this course',
      };

      vi.mocked(api.get).mockResolvedValue({
        data: {
          success: true,
          data: mockAccess,
        },
      });

      const access = await checkCourseAccess('course-id');

      expect(api.get).toHaveBeenCalledWith('/courses/course-id/can-access');
      expect(access).toEqual(mockAccess);
    });
  });
});

