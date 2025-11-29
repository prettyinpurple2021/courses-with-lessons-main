import { useNavigate } from 'react-router-dom';
import { Course } from '../../types/course';
import ProgressTracker from '../common/ProgressTracker';

interface CourseProgressCardProps {
  course: Course;
}

export default function CourseProgressCard({ course }: CourseProgressCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!course.isLocked) {
      navigate(`/courses/${course.id}`);
    }
  };

  const getMilestoneIcon = (progress: number): string | null => {
    if (progress >= 100) return '🎓';
    if (progress >= 75) return '⭐';
    if (progress >= 50) return '🔥';
    if (progress >= 25) return '💪';
    return null;
  };

  const milestoneIcon = getMilestoneIcon(course.progress || 0);

  return (
    <div
      onClick={handleClick}
      className={`
        relative glassmorphic-elevated rounded-lg p-6 transition-all duration-300
        ${
          course.isLocked
            ? 'opacity-60 cursor-not-allowed'
            : 'cursor-pointer hover:scale-105 hover:glassmorphic-elevated'
        }
      `}
      style={{
        transform: 'translateZ(20px)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Locked Overlay */}
      {course.isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <p className="text-white font-semibold">Locked</p>
            <p className="text-white/70 text-sm mt-1">Complete previous course</p>
          </div>
        </div>
      )}

      {/* Course Thumbnail */}
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover"
          onError={(e) => {
            // Fallback to gradient if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.style.background =
              'linear-gradient(135deg, #FF1493 0%, #708090 100%)';
          }}
        />
        
        {/* Course Number Badge */}
        <div className="absolute top-3 left-3 w-10 h-10 rounded-full glassmorphic-elevated flex items-center justify-center text-white font-bold holographic-border">
          {course.courseNumber}
        </div>

        {/* Completion Badge */}
        {course.isCompleted && (
          <div className="absolute top-3 right-3">
            <div className="w-10 h-10 rounded-full glassmorphic-elevated flex items-center justify-center holographic-border">
              <span className="text-xl">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
          <p className="text-white/70 text-sm line-clamp-2">{course.description}</p>
        </div>

        {/* Progress Bar */}
        {course.isEnrolled && !course.isLocked && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Progress</span>
              <span className="text-white font-semibold">{course.progress || 0}%</span>
            </div>
            <ProgressTracker
              current={course.progress || 0}
              total={100}
              holographicEffect={true}
            />
          </div>
        )}

        {/* Lesson Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">{course.lessonCount} Lessons</span>
          
          {/* Milestone Badge */}
          {milestoneIcon && course.isEnrolled && (
            <div className="w-8 h-8 rounded-full glassmorphic-elevated flex items-center justify-center holographic-border">
              <span className="text-lg">{milestoneIcon}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="pt-2">
          {course.isCompleted ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success-teal/20 text-success-teal text-sm font-semibold">
              <span>✓</span> Completed
            </span>
          ) : course.isEnrolled ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-hot-pink/20 text-hot-pink text-sm font-semibold">
              <span>📚</span> In Progress
            </span>
          ) : !course.isLocked ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold">
              <span>🔓</span> Available
            </span>
          ) : null}
        </div>
      </div>

      {/* Holographic effect on hover */}
      {!course.isLocked && (
        <div className="absolute inset-0 holographic opacity-0 hover:opacity-20 rounded-lg pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
}
