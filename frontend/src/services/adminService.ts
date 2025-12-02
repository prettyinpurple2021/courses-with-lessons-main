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
    return response.data.data;
  },

  /**
   * Verify admin status
   */
  async verifyAdmin(): Promise<{ isAdmin: boolean; user: any }> {
    const response = await api.get('/admin/verify');
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};
