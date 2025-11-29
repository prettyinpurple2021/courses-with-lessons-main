import { api } from './api';
import { Activity, ActivitySubmissionResult } from '../types/activity';

export const activityService = {
  /**
   * Get activity details by ID
   */
  async getActivityById(activityId: string): Promise<Activity> {
    const response = await api.get(`/activities/${activityId}`);
    return response.data.data;
  },

  /**
   * Submit activity response
   */
  async submitActivity(activityId: string, response: any): Promise<ActivitySubmissionResult> {
    const result = await api.post(`/activities/${activityId}/submit`, { response });
    return result.data.data;
  },

  /**
   * Check if user can access an activity
   */
  async checkActivityAccess(activityId: string): Promise<{ canAccess: boolean; message: string }> {
    const response = await api.get(`/activities/${activityId}/unlock`);
    return response.data.data;
  },

  /**
   * Get all activities for a lesson
   */
  async getActivitiesByLesson(lessonId: string): Promise<Activity[]> {
    const response = await api.get(`/lessons/${lessonId}/activities`);
    return response.data.data;
  },
};
