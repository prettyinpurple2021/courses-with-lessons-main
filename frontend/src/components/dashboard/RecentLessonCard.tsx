import { useNavigate } from 'react-router-dom';
import { RecentLesson } from '../../types/dashboard';

interface RecentLessonCardProps {
  lesson: RecentLesson;
}

export default function RecentLessonCard({ lesson }: RecentLessonCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (lesson.courseId && lesson.lessonId) {
      navigate(`/courses/${lesson.courseId}/lessons/${lesson.lessonId}`);
    }
  };

  const formatDate = (value: string): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(value).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div
      onClick={handleClick}
      className="glassmorphic rounded-lg p-4 cursor-pointer hover:glassmorphic-elevated transition-all duration-300 group"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-hot-pink to-steel-grey">
          {lesson.thumbnailUrl ? (
            <img
              src={lesson.thumbnailUrl}
              alt={lesson.lessonTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm truncate group-hover:text-hot-pink transition-colors">
                {lesson.lessonTitle}
              </h4>
              <p className="text-white/60 text-xs mt-1">{lesson.courseTitle}</p>
            </div>
            
            {/* Progress Badge */}
            {lesson.progress > 0 && (
              <span className="flex-shrink-0 text-xs text-success-teal font-semibold">
                {lesson.progress}%
              </span>
            )}
          </div>

          {/* Last Accessed */}
          <p className="text-white/50 text-xs mt-2">{formatDate(lesson.completedAt)}</p>
        </div>
      </div>
    </div>
  );
}
