import { api } from './api';

export interface ProgressUpdate {
  lessonId: string;
  videoPosition?: number;
  currentActivity?: number;
  completed?: boolean;
}

export interface ProgressSummary {
  totalLessons: number;
  completedLessons: number;
  totalCourses: number;
  completedCourses: number;
  lastActivity: Date | null;
}

export interface LastAccessedLesson {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  videoPosition: number;
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  lessonId: string,
  updates: Partial<ProgressUpdate>
): Promise<void> {
  const response = await api.put(`/progress/lessons/${lessonId}`, updates);
  return response.data.data;
}

/**
 * Batch update multiple progress records
 */
export async function batchUpdateProgress(
  updates: ProgressUpdate[]
): Promise<{ success: number; failed: number }> {
  const response = await api.post('/progress/batch', { updates });
  return response.data.data;
}

/**
 * Get all user progress
 */
export async function getUserProgress(): Promise<any[]> {
  const response = await api.get('/progress');
  return response.data.data;
}

/**
 * Get progress summary
 */
export async function getProgressSummary(): Promise<ProgressSummary> {
  const response = await api.get('/progress/summary');
  return response.data.data;
}

/**
 * Sync progress across devices
 */
export async function syncProgress(clientProgress: any[]): Promise<{
  serverProgress: any[];
  conflicts: Array<{ lessonId: string; serverTime: Date; clientTime: Date }>;
}> {
  const response = await api.post('/progress/sync', { clientProgress });
  return response.data.data;
}

/**
 * Get last accessed lesson for "Continue Learning"
 */
export async function getLastAccessedLesson(): Promise<LastAccessedLesson | null> {
  const response = await api.get('/progress/last-accessed');
  return response.data.data;
}
