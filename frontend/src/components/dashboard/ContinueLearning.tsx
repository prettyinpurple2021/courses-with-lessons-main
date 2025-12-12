import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLastAccessedLesson } from '../../services/progressService';
import { useCrossDeviceSync } from '../../hooks/useCrossDeviceSync';
import { logger } from '../../utils/logger';

interface LastLesson {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  videoPosition: number;
}

/**
 * Continue Learning component
 * Shows the last accessed lesson and allows resuming from any device
 */
export function ContinueLearning() {
  const [lastLesson, setLastLesson] = useState<LastLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isSyncing, lastSyncTime, syncWithServer } = useCrossDeviceSync();

  useEffect(() => {
    loadLastLesson();
  }, []);

  const loadLastLesson = async () => {
    try {
      setLoading(true);
      const lesson = await getLastAccessedLesson();
      setLastLesson(lesson);
    } catch (error) {
      logger.error('Failed to load last lesson', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (lastLesson) {
      navigate(`/lessons/${lastLesson.lessonId}`);
    }
  };

  const handleRefresh = async () => {
    await syncWithServer();
    await loadLastLesson();
  };

  const formatVideoPosition = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="glassmorphic p-6 rounded-xl animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
      </div>
    );
  }

  if (!lastLesson) {
    return null;
  }

  return (
    <div className="glassmorphic p-6 rounded-xl relative overflow-hidden">
      {/* Holographic border effect */}
      <div className="absolute inset-0 holographic-border opacity-50 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Continue Learning</h3>
            <p className="text-sm text-white/70">Pick up where you left off</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            title="Sync progress"
          >
            <svg
              className={`h-5 w-5 text-white ${isSyncing ? 'animate-spin' : ''}`}
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
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/60 mb-1">Course</p>
            <p className="text-white font-medium">{lastLesson.courseTitle}</p>
          </div>

          <div>
            <p className="text-sm text-white/60 mb-1">Lesson</p>
            <p className="text-white font-medium">{lastLesson.lessonTitle}</p>
          </div>

          {lastLesson.videoPosition > 0 && (
            <div>
              <p className="text-sm text-white/60 mb-1">Resume at</p>
              <p className="text-white font-medium">
                {formatVideoPosition(lastLesson.videoPosition)}
              </p>
            </div>
          )}

          {lastSyncTime && (
            <div>
              <p className="text-xs text-white/50">
                Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          className="
            mt-6 w-full
            px-6 py-3
            bg-hot-pink hover:bg-hot-pink/90
            text-white font-bold
            rounded-lg
            transition-all duration-300
            transform hover:scale-105
            holographic-button
          "
        >
          Continue Learning
        </button>

        <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
          <span>Your progress is synced across all your devices</span>
        </div>
      </div>
    </div>
  );
}
