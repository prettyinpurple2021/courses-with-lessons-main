import { api } from './api';
import { Course, CourseDetails } from '../types/course';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
}

/**
 * Get all courses with lock status for the authenticated user
 */
export async function getAllCourses(): Promise<Course[]> {
  const response = await api.get<ApiResponse<Course[]>>('/courses');
  return response.data.data;
}

/**
 * Get course details by ID
 */
export async function getCourseById(courseId: string): Promise<CourseDetails> {
  const response = await api.get<ApiResponse<CourseDetails>>(`/courses/${courseId}`);
  return response.data.data;
}

/**
 * Check if user can access a specific course
 */
export async function checkCourseAccess(courseId: string): Promise<{
  canAccess: boolean;
  message: string;
}> {
  const response = await api.get<ApiResponse<{ canAccess: boolean; message: string }>>(
    `/courses/${courseId}/can-access`
  );
  return response.data.data;
}

/**
 * Enroll user in a course
 */
export async function enrollInCourse(courseId: string): Promise<void> {
  await api.post(`/courses/${courseId}/enroll`);
}

/**
 * Unlock next course after completing current course
 */
export async function unlockNextCourse(courseId: string): Promise<void> {
  await api.post(`/courses/${courseId}/unlock-next`);
}
