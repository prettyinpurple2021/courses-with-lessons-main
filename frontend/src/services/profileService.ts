import { api } from './api';
import { ProfileData, UserStatistics } from '../types/profile';

export const profileService = {
  async getProfile(): Promise<ProfileData> {
    const response = await api.get('/users/me/profile');
    return response.data.data;
  },

  async getStatistics(): Promise<UserStatistics> {
    const response = await api.get('/users/me/statistics');
    return response.data.data;
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
  }): Promise<void> {
    await api.put('/users/me', data);
  },

  async updateAvatar(file: File): Promise<{ avatarUrl: string; user: any }> {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await api.put('/users/me/avatar', { avatarData: base64 });
    return response.data.data;
  },
};
