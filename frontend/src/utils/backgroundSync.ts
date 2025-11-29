import { batchUpdateProgress } from '../services/progressService';
import { ProgressUpdate } from '../services/progressService';

const SYNC_QUEUE_KEY = 'progress_sync_queue';
const SYNC_INTERVAL = 30000; // 30 seconds

/**
 * Background sync manager for progress updates
 * Handles queuing and syncing of progress data
 */
class BackgroundSyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;

  constructor() {
    this.setupOnlineListener();
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Connection restored, syncing queued updates...');
      this.syncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Connection lost, updates will be queued');
    });
  }

  /**
   * Add update to sync queue
   */
  addToQueue(update: ProgressUpdate): void {
    const queue = this.getQueue();
    
    // Check if update for this lesson already exists
    const existingIndex = queue.findIndex(
      (item) => item.lessonId === update.lessonId
    );

    if (existingIndex !== -1) {
      // Merge with existing update
      queue[existingIndex] = {
        ...queue[existingIndex],
        ...update,
        timestamp: Date.now(),
      };
    } else {
      // Add new update
      queue.push({
        ...update,
        timestamp: Date.now(),
      });
    }

    this.saveQueue(queue);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncQueue();
    }
  }

  /**
   * Get sync queue from localStorage
   */
  private getQueue(): Array<ProgressUpdate & { timestamp: number }> {
    try {
      const queueStr = localStorage.getItem(SYNC_QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (error) {
      console.error('Failed to read sync queue:', error);
      return [];
    }
  }

  /**
   * Save sync queue to localStorage
   */
  private saveQueue(queue: Array<ProgressUpdate & { timestamp: number }>): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Sync queued updates to server
   */
  async syncQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
      return;
    }

    const queue = this.getQueue();
    if (queue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      console.log(`Syncing ${queue.length} queued updates...`);
      
      // Remove timestamp before sending to server
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updates = queue.map(({ timestamp, ...update }) => update);
      
      const result = await batchUpdateProgress(updates);
      
      console.log(`Sync complete: ${result.success} succeeded, ${result.failed} failed`);

      // Clear queue on success
      if (result.failed === 0) {
        this.clearQueue();
      } else {
        // Keep failed items in queue
        const failedUpdates = queue.slice(-result.failed);
        this.saveQueue(failedUpdates);
      }
    } catch (error) {
      console.error('Failed to sync queue:', error);
      // Keep queue for retry
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.getQueue().length;
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync(): void {
    if (this.syncInterval) {
      return;
    }

    this.syncInterval = setInterval(() => {
      this.syncQueue();
    }, SYNC_INTERVAL);

    console.log('Background sync started');
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Background sync stopped');
    }
  }

  /**
   * Check if online
   */
  isConnectionOnline(): boolean {
    return this.isOnline;
  }
}

// Export singleton instance
export const backgroundSync = new BackgroundSyncManager();
