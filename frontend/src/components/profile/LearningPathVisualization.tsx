import React from 'react';
import { CourseProgressSummary } from '../../types/profile';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { useNavigate } from 'react-router-dom';

interface LearningPathVisualizationProps {
  courseProgress: CourseProgressSummary[];
  detailed?: boolean;
}

const LearningPathVisualization: React.FC<LearningPathVisualizationProps> = ({
  courseProgress,
  detailed = false,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'from-success-teal to-holographic-cyan';
      case 'in_progress':
        return 'from-hot-pink to-holographic-magenta';
      default:
        return 'from-steel-grey to-white/50';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🎯';
      default:
        return '🔒';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  if (courseProgress.length === 0) {
    return (
      <GlassmorphicCard variant="elevated" className="p-8 text-center">
        <p className="text-white/70">No courses enrolled yet. Start your learning journey!</p>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-4">
      {courseProgress.map((course, index) => (
        <GlassmorphicCard
          key={course.courseId}
          variant="elevated"
          className="p-6 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
          onClick={() => navigate(`/courses/${course.courseId}`)}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Course Number Badge */}
            <div className="flex-shrink-0">
              <div
                className={`
                  w-16 h-16 rounded-full glassmorphic-elevated flex items-center justify-center
                  border-4 ${course.status === 'completed' ? 'border-success-teal' : course.status === 'in_progress' ? 'border-hot-pink' : 'border-steel-grey'}
                `}
              >
                <span className="text-2xl font-bold text-white">{course.courseNumber}</span>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white truncate">{course.courseTitle}</h3>
                <span className="text-xl">{getStatusIcon(course.status)}</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                  <span>
                    {course.lessonsCompleted} / {course.totalLessons} lessons
                  </span>
                  <span>{course.progress}%</span>
                </div>
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getStatusColor(course.status)} transition-all duration-500 relative`}
                    style={{ width: `${course.progress}%` }}
                  >
                    {/* Holographic shimmer effect */}
                    <div className="absolute inset-0 holographic opacity-50" />
                  </div>
                </div>
              </div>

              {/* Status and Date */}
              {detailed && (
                <div className="flex flex-wrap gap-3 text-sm text-white/60">
                  <span
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(course.status)} text-white font-semibold`}
                  >
                    {getStatusText(course.status)}
                  </span>
                  <span>
                    Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                  </span>
                  {course.completedAt && (
                    <span>
                      Completed: {new Date(course.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="flex-shrink-0 text-hot-pink text-2xl">
              →
            </div>
          </div>

          {/* Connection line to next course (except for last course) */}
          {index < courseProgress.length - 1 && (
            <div className="flex justify-center mt-4">
              <div className="w-1 h-8 bg-gradient-to-b from-hot-pink to-holographic-magenta rounded-full" />
            </div>
          )}
        </GlassmorphicCard>
      ))}
    </div>
  );
};

export default LearningPathVisualization;
