import { api } from './api';

export interface AdminLoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  accessToken: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalActivities: number;
  activeEnrollments: number;
  completedCourses: number;
  recentUsers: number;
}

export const adminService = {
  /**
   * Admin login
   */
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await api.post('/admin/login', { email, password });
    // Backend returns { success: true, data: { user: ..., accessToken: ... } }
    return response.data.data;
  },

  /**
   * Verify admin status
   */
  async verifyAdmin(): Promise<{ isAdmin: boolean; user: any }> {
    const response = await api.get('/admin/verify');
    // Backend returns { success: true, data: { isAdmin: boolean, user: ... } }
    return response.data.data || response.data;
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    // Backend returns { success: true, data: { totalUsers, totalCourses, ... } }
    return response.data.data;
  },

  /**
   * Get pending exams for review
   */
  async getPendingExams(): Promise<any[]> {
    const response = await api.get('/admin/grading/pending');
    return response.data.data;
  },

  /**
   * Grade an exam
   */
  async gradeExam(resultId: string, score: number, passed: boolean): Promise<any> {
    const response = await api.post(`/admin/grading/${resultId}`, {
      score,
      passed,
    });
    return response.data.data;
  },
};
