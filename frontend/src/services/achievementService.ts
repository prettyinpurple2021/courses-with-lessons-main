import { api } from './api';

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const achievementService = {
  /**
   * Get all achievements for the current user
   */
  async getUserAchievements(): Promise<Achievement[]> {
    const response = await api.get('/achievements');
    return response.data.data;
  },

  /**
   * Get all achievement definitions
   */
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    const response = await api.get('/achievements/definitions');
    return response.data.data;
  },

  /**
   * Manually trigger achievement unlock (for testing)
   */
  async unlockAchievement(achievementId: string): Promise<{ unlocked: boolean; achievement: Achievement }> {
    const response = await api.post(`/achievements/${achievementId}/unlock`);
    return response.data.data;
  },
};

