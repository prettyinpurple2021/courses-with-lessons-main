import { useQuery } from '@tanstack/react-query';
import RecentLessonCard from './RecentLessonCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { fetchRecentLessons } from '../../services/dashboardService';

export default function RecentActivity() {
  const { data: recentLessons, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'recent-lessons'],
    queryFn: fetchRecentLessons,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner size="md" text="Loading recent activity..." />
      </div>
    );
  }

  if (isError || !recentLessons) {
    return (
      <div className="glassmorphic rounded-lg p-8 text-center">
        <p className="text-white/70">We couldn&apos;t load your recent activity. Please try again shortly.</p>
      </div>
    );
  }

  if (recentLessons.length === 0) {
    return (
      <div className="glassmorphic rounded-lg p-8 text-center">
        <p className="text-white/70">No recent activity yet. Start learning to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentLessons.map((lesson) => (
        <RecentLessonCard key={`${lesson.id}-${lesson.lessonId ?? ''}`} lesson={lesson} />
      ))}
    </div>
  );
}
