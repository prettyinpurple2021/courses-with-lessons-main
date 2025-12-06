import { api } from './api';

export interface NotificationPreferences {
  emailNotifications: boolean;
  courseUpdates: boolean;
  communityDigest: boolean;
  achievementAlerts: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  password: string;
}

export const settingsService = {
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.put('/users/me/password', data);
    return response.data.data;
  },

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/users/me/notifications', preferences);
    return response.data.data;
  },

  async deleteAccount(data: DeleteAccountData): Promise<{ message: string }> {
    const response = await api.delete('/users/me', { data });
    return response.data.data;
  },

  async exportData(): Promise<any> {
    const response = await api.get('/users/me/export');
    return response.data.data;
  },
};
