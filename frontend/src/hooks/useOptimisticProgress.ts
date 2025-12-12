import { useState, useCallback } from 'react';
import { updateLessonProgress } from '../services/progressService';
import { backgroundSync } from '../utils/backgroundSync';
import { logger } from '../utils/logger';

interface ProgressState {
  videoPosition: number;
  currentActivity: number;
  completed: boolean;
}

interface UseOptimisticProgressOptions {
  lessonId: string;
  initialState: ProgressState;
  onError?: (error: Error) => void;
}

/**
 * Hook for optimistic UI updates with automatic fallback
 * Updates UI immediately and syncs to server in background
 */
export function useOptimisticProgress({
  lessonId,
  initialState,
  onError,
}: UseOptimisticProgressOptions) {
  const [progress, setProgress] = useState<ProgressState>(initialState);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Update progress with optimistic UI update
   */
  const updateProgress = useCallback(
    async (updates: Partial<ProgressState>) => {
      // Optimistically update UI
      const previousState = progress;
      const newState = { ...progress, ...updates };
      setProgress(newState);

      // Try to sync to server
      setIsSyncing(true);
      try {
        if (backgroundSync.isConnectionOnline()) {
          await updateLessonProgress(lessonId, updates);
        } else {
          // Queue for later sync
          backgroundSync.addToQueue({
            lessonId,
            ...updates,
          });
        }
      } catch (error) {
        logger.error('Failed to update progress', error);
        
        // Revert optimistic update on error
        setProgress(previousState);
        
        // Queue for retry
        backgroundSync.addToQueue({
          lessonId,
          ...updates,
        });

        if (onError) {
          onError(error as Error);
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [lessonId, progress, onError]
  );

  /**
   * Update video position
   */
  const updateVideoPosition = useCallback(
    (position: number) => {
      updateProgress({ videoPosition: position });
    },
    [updateProgress]
  );

  /**
   * Update current activity
   */
  const updateCurrentActivity = useCallback(
    (activityNumber: number) => {
      updateProgress({ currentActivity: activityNumber });
    },
    [updateProgress]
  );

  /**
   * Mark as completed
   */
  const markCompleted = useCallback(() => {
    updateProgress({ completed: true });
  }, [updateProgress]);

  return {
    progress,
    isSyncing,
    updateVideoPosition,
    updateCurrentActivity,
    markCompleted,
    updateProgress,
  };
}
