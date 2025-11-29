import { useCrossDeviceSync } from '../../hooks/useCrossDeviceSync';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Sync status component
 * Shows current sync status and last sync time
 */
export function SyncStatus({ className = '', showDetails = false }: SyncStatusProps) {
  const { isSyncing, lastSyncTime, conflicts, syncWithServer } = useCrossDeviceSync();

  const getTimeSinceSync = (): string => {
    if (!lastSyncTime) {
      return 'Never synced';
    }

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);

    if (diff < 60) {
      return 'Just now';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes}m ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sync icon */}
      <button
        onClick={syncWithServer}
        disabled={isSyncing}
        className="
          p-2 rounded-lg
          bg-white/10 hover:bg-white/20
          transition-colors
          disabled:opacity-50
        "
        title="Sync now"
      >
        <svg
          className={`h-4 w-4 text-white ${isSyncing ? 'animate-spin' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showDetails && (
        <div className="text-xs text-white/70">
          {isSyncing ? (
            <span>Syncing...</span>
          ) : (
            <div className="flex flex-col">
              <span>Last sync: {getTimeSinceSync()}</span>
              {conflicts.length > 0 && (
                <span className="text-yellow-400">
                  {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} resolved
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status indicator dot */}
      {!showDetails && (
        <div
          className={`
            h-2 w-2 rounded-full
            ${isSyncing ? 'bg-hot-pink animate-pulse' : 'bg-success-teal'}
          `}
          title={isSyncing ? 'Syncing...' : `Last sync: ${getTimeSinceSync()}`}
        />
      )}
    </div>
  );
}
