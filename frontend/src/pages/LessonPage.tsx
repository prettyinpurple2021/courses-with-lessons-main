import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import YouTubePlayer from '../components/course/YouTubePlayer';
import NoteTakingPanel from '../components/course/NoteTakingPanel';
import ResourceList from '../components/course/ResourceList';
import LessonNavigation from '../components/course/LessonNavigation';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { getCourseById } from '../services/courseService';
import LessonTutorModal from '../components/ai/LessonTutorModal';
import ActivityView from '../components/course/ActivityView';
import { Activity } from '../types/activity';
import { activityService } from '../services/activityService';
import { useAchievements } from '../hooks/useAchievements';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';

interface LessonDetails {
  id: string;
  lessonNumber: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
  courseId: string;
  activities: Array<{
    id: string;
    activityNumber: number;
    title: string;
    description: string;
    type: string;
    content: any;
    required: boolean;
    isCompleted: boolean;
    isLocked: boolean;
  }>;
  progress: {
    completed: boolean;
    videoPosition: number;
    currentActivity: number;
  };
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

const clampProgress = (value: number) => Math.max(0, Math.min(value, 100));

interface ProgressBarProps {
  progress: number;
  gradientId: string;
  startColor: string;
  endColor: string;
  containerClassName?: string;
  progressClassName?: string;
}

const ProgressBar = ({
  progress,
  gradientId,
  startColor,
  endColor,
  containerClassName = '',
  progressClassName = '',
}: ProgressBarProps) => {
  const normalizedProgress = clampProgress(progress);

  return (
    <div className={`h-2 rounded-full overflow-hidden ${containerClassName}`.trim()}>
      <svg className="w-full h-full" viewBox="0 0 100 4" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        <rect
          className={`transition-all duration-300 ${progressClassName}`.trim()}
          x="0"
          y="0"
          width={normalizedProgress}
          height="4"
          fill={`url(#${gradientId})`}
        />
      </svg>
    </div>
  );
};

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const { currentAchievement, checkForNewAchievements, closeCurrentAchievement } = useAchievements();

  // Fetch lesson details
  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery<LessonDetails>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await api.get(`/lessons/${lessonId}`);
      return response.data.data;
    },
    enabled: !!lessonId,
  });

  // Fetch lesson resources
  const { data: resources } = useQuery<Resource[]>({
    queryKey: ['lessonResources', lessonId],
    queryFn: async () => {
      const response = await api.get(`/lessons/${lessonId}/resources`);
      return response.data.data;
    },
    enabled: !!lessonId,
  });

  // Fetch course details to get all lessons for navigation
  const { data: courseDetails } = useQuery({
    queryKey: ['courseDetails', lesson?.courseId],
    queryFn: () => getCourseById(lesson!.courseId),
    enabled: !!lesson?.courseId,
  });

  // Update video progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (position: number) => {
      await api.put(`/lessons/${lessonId}/progress`, { position });
    },
  });

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/lessons/${lessonId}/complete`);
    },
    onSuccess: () => {
      showToast('Lesson completed! 🎉', 'success');
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      // Check for newly unlocked achievements
      setTimeout(() => {
        checkForNewAchievements();
      }, 1000);
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.error?.message || 'Failed to complete lesson',
        'error'
      );
    },
  });

  const handleVideoProgress = (currentTime: number) => {
    setCurrentVideoTime(currentTime);
    updateProgressMutation.mutate(currentTime);
  };

  const handleVideoComplete = () => {
    showToast('Video completed!', 'success');
  };

  const handleCompleteLesson = () => {
    if (!lesson) return;

    const incompleteActivities = lesson.activities.filter(
      (a) => a.required && !a.isCompleted
    );

    if (incompleteActivities.length > 0) {
      showToast(
        `Please complete all required activities before marking lesson as complete (${incompleteActivities.length} remaining)`,
        'error'
      );
      return;
    }

    completeLessonMutation.mutate();
  };

  const handleActivityClick = async (activity: LessonDetails['activities'][0]) => {
    if (activity.isLocked) {
      showToast('Complete previous activities to unlock this one', 'error');
      return;
    }
    
    try {
      // Fetch full activity details including submission data
      const fullActivity = await activityService.getActivityById(activity.id);
      setActiveActivity(fullActivity);
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message || 'Failed to load activity',
        'error'
      );
    }
  };

  const handleActivityCompleted = () => {
    // Refresh lesson data to get updated activity status
    queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
    // Check for newly unlocked achievements
    setTimeout(() => {
      checkForNewAchievements();
    }, 1000);
    // Close activity view
    setActiveActivity(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading lesson..." />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassmorphicCard className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h2>
          <p className="text-gray-300 mb-6">
            The lesson you're looking for doesn't exist or you don't have access to it.
          </p>
          <GlassmorphicButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </GlassmorphicButton>
        </GlassmorphicCard>
      </div>
    );
  }

  const completedActivities = lesson.activities.filter((a) => a.isCompleted).length;
  const totalActivities = lesson.activities.length;
  const activityProgress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const videoProgress =
    lesson.duration > 0 ? Math.min((currentVideoTime / lesson.duration) * 100, 100) : 0;

  // Render activity view if active
  if (activeActivity) {
    return (
      <div className="min-h-screen camo-background p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setActiveActivity(null)}
            className="text-white mb-4 hover:text-hot-pink transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Lesson
          </button>
          <ActivityView
            activity={activeActivity}
            onActivityCompleted={handleActivityCompleted}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen camo-background">
      {isTutorOpen && (
        <LessonTutorModal
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          lessonSummary={lesson.description}
          onClose={() => setIsTutorOpen(false)}
        />
      )}
      <AchievementUnlockModal
        achievement={currentAchievement}
        isOpen={!!currentAchievement}
        onClose={closeCurrentAchievement}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/courses/${lesson.courseId}`)}
            className="text-hot-pink hover:text-white transition-colors mb-4 flex items-center gap-2"
          >
            <span>←</span> Back to Course
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  Lesson {lesson.lessonNumber}: {lesson.title}
                </h1>
                {lesson.progress.completed && (
                  <span className="text-success-teal text-3xl holographic" title="Completed">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-gray-300">{lesson.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <GlassmorphicButton variant="outline" size="sm" onClick={() => setIsTutorOpen(true)}>
                Ask AI Tutor
              </GlassmorphicButton>
              {lesson.progress.completed && (
                <span className="px-4 py-2 bg-success-teal/20 border border-success-teal text-success-teal font-bold rounded-full holographic">
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <YouTubePlayer
              videoId={lesson.youtubeVideoId}
              startTime={lesson.progress.videoPosition}
              onProgress={handleVideoProgress}
              onComplete={handleVideoComplete}
            />

            {/* Lesson Content */}
            <GlassmorphicCard>
              <h2 className="text-xl font-bold text-white mb-4">About This Lesson</h2>
              <p className="text-gray-300 mb-4">{lesson.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Duration: {Math.floor(lesson.duration / 60)} minutes</span>
                <span>•</span>
                <span>{totalActivities} Activities</span>
              </div>
            </GlassmorphicCard>

            {/* Activities */}
            <GlassmorphicCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Interactive Activities</h2>
                <div className="text-sm text-gray-400">
                  {completedActivities} / {totalActivities} completed
                </div>
              </div>

              {/* Activity Progress Bar */}
              <div className="mb-6">
                <ProgressBar
                  progress={activityProgress}
                  gradientId="lessonActivityProgress"
                  startColor="#FF3CAC"
                  endColor="#2DD4BF"
                  containerClassName="bg-black/30"
                  progressClassName="holographic"
                />
              </div>

              <div className="space-y-3">
                {lesson.activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    disabled={activity.isLocked}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      activity.isCompleted
                        ? 'border-success-teal/50 bg-success-teal/10'
                        : activity.isLocked
                        ? 'border-gray-600 bg-gray-800/30 opacity-50 cursor-not-allowed'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-hot-pink font-bold">
                          {activity.activityNumber}
                        </span>
                        <div>
                          <h3 className="text-white font-semibold">{activity.title}</h3>
                          <p className="text-gray-400 text-sm">{activity.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.isCompleted && (
                          <span className="text-success-teal text-xl">✓</span>
                        )}
                        {activity.isLocked && <span className="text-gray-400">🔒</span>}
                        {!activity.isCompleted && !activity.isLocked && (
                          <span className="text-hot-pink">→</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </GlassmorphicCard>

            {/* Note-Taking Panel */}
            <NoteTakingPanel lessonId={lessonId!} currentVideoTime={currentVideoTime} />

            {/* Resources */}
            {resources && <ResourceList resources={resources} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Navigation */}
            {courseDetails && (
              <LessonNavigation
                currentLesson={{
                  id: lesson.id,
                  lessonNumber: lesson.lessonNumber,
                  courseId: lesson.courseId,
                }}
                allLessons={courseDetails.lessons.map((l) => ({
                  id: l.id,
                  lessonNumber: l.lessonNumber,
                  title: l.title,
                  isCompleted: false, // This would need to come from progress data
                  isLocked: false, // This would need to come from enrollment data
                }))}
              />
            )}

            {/* Progress Card */}
            <GlassmorphicCard>
              <h3 className="text-lg font-bold text-white mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Activities</span>
                    <span className="text-white font-semibold">
                      {completedActivities}/{totalActivities}
                    </span>
                  </div>
                  <ProgressBar
                    progress={activityProgress}
                    gradientId="sidebarActivityProgress"
                    startColor="#FF3CAC"
                    endColor="#FF3CAC"
                    containerClassName="bg-black/30"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Video Progress</span>
                    <span className="text-white font-semibold">
                      {Math.floor(videoProgress)}%
                    </span>
                  </div>
                  <ProgressBar
                    progress={videoProgress}
                    gradientId="sidebarVideoProgress"
                    startColor="#2DD4BF"
                    endColor="#2DD4BF"
                    containerClassName="bg-black/30"
                  />
                </div>
              </div>

              {!lesson.progress.completed && (
                <GlassmorphicButton
                  onClick={handleCompleteLesson}
                  loading={completeLessonMutation.isPending}
                  disabled={completeLessonMutation.isPending}
                  className="w-full mt-6"
                >
                  Mark as Complete
                </GlassmorphicButton>
              )}
            </GlassmorphicCard>

            {/* Quick Tips */}
            <GlassmorphicCard>
              <h3 className="text-lg font-bold text-white mb-4">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-hot-pink">•</span>
                  <span>Take notes while watching the video</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-hot-pink">•</span>
                  <span>Complete all activities to unlock the next lesson</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-hot-pink">•</span>
                  <span>Download resources for offline reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-hot-pink">•</span>
                  <span>Your progress is saved automatically</span>
                </li>
              </ul>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
