import { useState, useEffect, useCallback } from 'react';
import { syncProgress, getUserProgress } from '../services/progressService';
import { useToast } from './useToast';

interface ProgressItem {
  lessonId: string;
  videoPosition: number;
  currentActivity: number;
  completed: boolean;
  updatedAt: Date;
}

interface SyncConflict {
  lessonId: string;
  serverTime: Date;
  clientTime: Date;
}

/**
 * Hook for cross-device synchronization
 * Syncs progress data across multiple devices
 */
export function useCrossDeviceSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const { error: showError, warning: showWarning } = useToast();

  /**
   * Get local progress from localStorage
   */
  const getLocalProgress = useCallback((): ProgressItem[] => {
    try {
      const progressStr = localStorage.getItem('local_progress');
      if (progressStr) {
        const progress = JSON.parse(progressStr);
        return progress.map((item: any) => ({
          ...item,
          updatedAt: new Date(item.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to read local progress:', error);
    }
    return [];
  }, []);

  /**
   * Save local progress to localStorage
   */
  const saveLocalProgress = useCallback((progress: ProgressItem[]) => {
    try {
      localStorage.setItem('local_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save local progress:', error);
    }
  }, []);

  /**
   * Sync progress with server
   */
  const syncWithServer = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    try {
      const localProgress = getLocalProgress();
      
      // Prepare client progress for sync
      const clientProgress = localProgress.map((item) => ({
        lessonId: item.lessonId,
        videoPosition: item.videoPosition,
        currentActivity: item.currentActivity,
        completed: item.completed,
        lastUpdated: item.updatedAt,
      }));

      // Sync with server
      const result = await syncProgress(clientProgress);

      // Update local progress with server data
      const serverProgress = result.serverProgress.map((item: any) => ({
        lessonId: item.lessonId,
        videoPosition: item.videoPosition,
        currentActivity: item.currentActivity,
        completed: item.completed,
        updatedAt: new Date(item.updatedAt),
      }));

      saveLocalProgress(serverProgress);
      setLastSyncTime(new Date());
      setConflicts(result.conflicts);

      if (result.conflicts.length > 0) {
        showWarning(
          `Synced with ${result.conflicts.length} conflict(s) resolved`
        );
      } else {
        console.log('Progress synced successfully');
      }
    } catch (error) {
      console.error('Failed to sync progress:', error);
      showError('Failed to sync progress');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, getLocalProgress, saveLocalProgress, showError, showWarning]);

  /**
   * Update local progress item
   */
  const updateLocalProgress = useCallback(
    (lessonId: string, updates: Partial<ProgressItem>) => {
      const localProgress = getLocalProgress();
      const existingIndex = localProgress.findIndex(
        (item) => item.lessonId === lessonId
      );

      const updatedItem: ProgressItem = {
        lessonId,
        videoPosition: updates.videoPosition ?? 0,
        currentActivity: updates.currentActivity ?? 1,
        completed: updates.completed ?? false,
        updatedAt: new Date(),
      };

      if (existingIndex !== -1) {
        localProgress[existingIndex] = {
          ...localProgress[existingIndex],
          ...updatedItem,
        };
      } else {
        localProgress.push(updatedItem);
      }

      saveLocalProgress(localProgress);
    },
    [getLocalProgress, saveLocalProgress]
  );

  /**
   * Get progress for a specific lesson
   */
  const getLessonProgress = useCallback(
    (lessonId: string): ProgressItem | null => {
      const localProgress = getLocalProgress();
      return localProgress.find((item) => item.lessonId === lessonId) || null;
    },
    [getLocalProgress]
  );

  /**
   * Fetch all progress from server and update local
   */
  const fetchServerProgress = useCallback(async () => {
    try {
      const serverProgress = await getUserProgress();
      
      const progress = serverProgress.map((item: any) => ({
        lessonId: item.lessonId,
        videoPosition: item.videoPosition,
        currentActivity: item.currentActivity,
        completed: item.completed,
        updatedAt: new Date(item.updatedAt),
      }));

      saveLocalProgress(progress);
      setLastSyncTime(new Date());
      
      return progress;
    } catch (error) {
      console.error('Failed to fetch server progress:', error);
      throw error;
    }
  }, [saveLocalProgress]);

  /**
   * Auto-sync on mount and periodically
   */
  useEffect(() => {
    // Initial sync
    syncWithServer();

    // Periodic sync every 5 minutes
    const interval = setInterval(() => {
      syncWithServer();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [syncWithServer]);

  /**
   * Sync when window gains focus (user switches back to tab)
   */
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, syncing progress...');
      syncWithServer();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithServer]);

  /**
   * Sync before page unload
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable sync on page unload
      const localProgress = getLocalProgress();
      if (localProgress.length > 0) {
        const data = JSON.stringify({
          clientProgress: localProgress.map((item) => ({
            lessonId: item.lessonId,
            videoPosition: item.videoPosition,
            currentActivity: item.currentActivity,
            completed: item.completed,
            lastUpdated: item.updatedAt,
          })),
        });

        navigator.sendBeacon('/api/progress/sync', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getLocalProgress]);

  return {
    isSyncing,
    lastSyncTime,
    conflicts,
    syncWithServer,
    updateLocalProgress,
    getLessonProgress,
    fetchServerProgress,
  };
}
