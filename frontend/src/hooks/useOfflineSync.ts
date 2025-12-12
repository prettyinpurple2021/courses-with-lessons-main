import { useState, useEffect, useCallback } from 'react';
import { backgroundSync } from '../utils/backgroundSync';
import { requestBackgroundSync } from '../utils/serviceWorkerRegistration';
import { logger } from '../utils/logger';

/**
 * Hook for managing offline state and sync
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Update queue size
   */
  const updateQueueSize = useCallback(() => {
    setQueueSize(backgroundSync.getQueueSize());
  }, []);

  /**
   * Manually trigger sync
   */
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      logger.debug('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      await backgroundSync.syncQueue();
      updateQueueSize();
      
      // Request background sync via service worker
      await requestBackgroundSync('sync-progress');
    } catch (error) {
      logger.error('Failed to trigger sync', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, updateQueueSize]);

  /**
   * Setup online/offline listeners
   */
  useEffect(() => {
    const handleOnline = () => {
      logger.info('Connection restored');
      setIsOnline(true);
      
      // Trigger sync when coming back online
      setTimeout(() => {
        triggerSync();
      }, 1000);
    };

    const handleOffline = () => {
      logger.info('Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update queue size periodically
    const interval = setInterval(updateQueueSize, 2000);

    // Start periodic sync
    backgroundSync.startPeriodicSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      backgroundSync.stopPeriodicSync();
    };
  }, [triggerSync, updateQueueSize]);

  /**
   * Listen for service worker sync messages
   */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_PROGRESS') {
          logger.debug('Received sync message from service worker');
          triggerSync();
        }
      });
    }
  }, [triggerSync]);

  return {
    isOnline,
    queueSize,
    isSyncing,
    triggerSync,
  };
}
