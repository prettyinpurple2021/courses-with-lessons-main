import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { achievementService, Achievement } from '../services/achievementService';

export function useAchievements() {
  const queryClient = useQueryClient();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [currentUnlockedIndex, setCurrentUnlockedIndex] = useState(0);

  // Fetch user achievements
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: achievementService.getUserAchievements,
  });

  // Check for newly unlocked achievements
  const checkForNewAchievements = useCallback(async () => {
    try {
      const currentAchievements = await achievementService.getUserAchievements();
      
      // Compare with cached achievements to find new ones
      const cachedAchievements = queryClient.getQueryData<Achievement[]>(['achievements']) || [];
      const cachedIds = new Set(cachedAchievements.map(a => a.id));
      
      const newAchievements = currentAchievements.filter(
        a => !cachedIds.has(a.id)
      );

      if (newAchievements.length > 0) {
        setNewlyUnlocked(newAchievements);
        setCurrentUnlockedIndex(0);
        // Invalidate to update cache
        queryClient.setQueryData(['achievements'], currentAchievements);
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [queryClient]);

  // Show next achievement
  const showNextAchievement = useCallback(() => {
    if (currentUnlockedIndex < newlyUnlocked.length - 1) {
      setCurrentUnlockedIndex(prev => prev + 1);
    } else {
      setNewlyUnlocked([]);
      setCurrentUnlockedIndex(0);
    }
  }, [currentUnlockedIndex, newlyUnlocked.length]);

  // Close current achievement
  const closeCurrentAchievement = useCallback(() => {
    showNextAchievement();
  }, [showNextAchievement]);

  // Get current achievement to display
  const currentAchievement = newlyUnlocked[currentUnlockedIndex] || null;

  return {
    achievements,
    isLoading,
    currentAchievement,
    hasNewAchievements: newlyUnlocked.length > 0,
    checkForNewAchievements,
    closeCurrentAchievement,
  };
}

