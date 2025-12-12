import { useEffect, useRef, useCallback } from 'react';
import { updateLessonProgress } from '../services/progressService';
import { useToast } from './useToast';
import { logger } from '../utils/logger';

interface UseProgressSyncOptions {
  lessonId: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Hook for automatic progress synchronization
 * Handles video position tracking with 2-second save interval
 */
export function useProgressSync({ lessonId, enabled = true, onError }: UseProgressSyncOptions) {
  const { error: showError, success: showSuccess } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPositionRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  /**
   * Save video position with debouncing
   */
  const saveVideoPosition = useCallback(
    async (position: number, immediate = false) => {
      if (!enabled || isSavingRef.current) {
        return;
      }

      // Don't save if position hasn't changed significantly (less than 1 second)
      if (Math.abs(position - lastSavedPositionRef.current) < 1 && !immediate) {
        return;
      }

      const save = async () => {
        try {
          isSavingRef.current = true;
          await updateLessonProgress(lessonId, { videoPosition: position });
          lastSavedPositionRef.current = position;
        } catch (error) {
          logger.error('Failed to save video position', error);
          if (onError) {
            onError(error as Error);
          }
        } finally {
          isSavingRef.current = false;
        }
      };

      if (immediate) {
        await save();
      } else {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for 2 seconds
        saveTimeoutRef.current = setTimeout(save, 2000);
      }
    },
    [lessonId, enabled, onError]
  );

  /**
   * Save current activity progress
   */
  const saveActivityProgress = useCallback(
    async (currentActivity: number) => {
      if (!enabled) {
        return;
      }

      try {
        await updateLessonProgress(lessonId, { currentActivity });
      } catch (error) {
        logger.error('Failed to save activity progress', error);
        showError('Failed to save progress');
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [lessonId, enabled, onError, showError]
  );

  /**
   * Mark lesson as completed
   */
  const markLessonComplete = useCallback(
    async () => {
      if (!enabled) {
        return;
      }

      try {
        await updateLessonProgress(lessonId, { completed: true });
        showSuccess('Lesson completed!');
      } catch (error) {
        logger.error('Failed to mark lesson as complete', error);
        showError('Failed to save completion status');
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [lessonId, enabled, onError, showError, showSuccess]
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveVideoPosition,
    saveActivityProgress,
    markLessonComplete,
  };
}
