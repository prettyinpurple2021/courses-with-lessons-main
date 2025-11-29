import { useNavigate } from 'react-router-dom';
import GlassmorphicButton from '../common/GlassmorphicButton';

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface LessonNavigationProps {
  currentLesson: {
    id: string;
    lessonNumber: number;
    courseId: string;
  };
  allLessons: Lesson[];
  className?: string;
}

export default function LessonNavigation({
  currentLesson,
  allLessons,
  className = '',
}: LessonNavigationProps) {
  const navigate = useNavigate();

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handlePrevious = () => {
    if (previousLesson) {
      navigate(`/lessons/${previousLesson.id}`);
    }
  };

  const handleNext = () => {
    if (nextLesson && !nextLesson.isLocked) {
      navigate(`/lessons/${nextLesson.id}`);
    }
  };

  const completedCount = allLessons.filter((l) => l.isCompleted).length;
  const progressPercentage = (completedCount / allLessons.length) * 100;

  return (
    <div className={`glassmorphic p-6 rounded-lg ${className}`}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold">Course Progress</h3>
          <span className="text-sm text-gray-400">
            {completedCount} / {allLessons.length} lessons
          </span>
        </div>
        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-hot-pink via-holographic-magenta to-success-teal holographic transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{Math.round(progressPercentage)}% complete</p>
      </div>

      {/* Lesson List */}
      <div className="mb-6 max-h-64 overflow-y-auto space-y-2">
        {allLessons.map((lesson) => {
          const isCurrent = lesson.id === currentLesson.id;
          return (
            <button
              key={lesson.id}
              onClick={() => {
                if (!lesson.isLocked) {
                  navigate(`/lessons/${lesson.id}`);
                }
              }}
              disabled={lesson.isLocked}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-hot-pink/20 border-2 border-hot-pink'
                  : lesson.isCompleted
                  ? 'bg-success-teal/10 border border-success-teal/30 hover:bg-success-teal/20'
                  : lesson.isLocked
                  ? 'bg-gray-800/30 border border-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-white/5 border border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <span
                  className={`font-bold ${
                    isCurrent
                      ? 'text-hot-pink'
                      : lesson.isCompleted
                      ? 'text-success-teal'
                      : 'text-gray-400'
                  }`}
                >
                  {lesson.lessonNumber}
                </span>
                <span
                  className={`text-sm ${
                    isCurrent ? 'text-white font-semibold' : 'text-gray-300'
                  }`}
                >
                  {lesson.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {lesson.isCompleted && <span className="text-success-teal">✓</span>}
                {lesson.isLocked && <span className="text-gray-400">🔒</span>}
                {isCurrent && <span className="text-hot-pink">▶</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <GlassmorphicButton
          onClick={handlePrevious}
          disabled={!previousLesson}
          variant="secondary"
          className="flex-1"
        >
          <span className="flex items-center justify-center gap-2">
            <span>←</span>
            <span className="hidden sm:inline">Previous</span>
          </span>
        </GlassmorphicButton>
        <GlassmorphicButton
          onClick={handleNext}
          disabled={!nextLesson || nextLesson.isLocked}
          className="flex-1"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="hidden sm:inline">Next</span>
            <span>→</span>
          </span>
        </GlassmorphicButton>
      </div>

      {nextLesson?.isLocked && (
        <p className="text-xs text-gray-400 text-center mt-3">
          Complete this lesson to unlock the next one
        </p>
      )}
    </div>
  );
}
