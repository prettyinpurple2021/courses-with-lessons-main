import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCourseById, enrollInCourse, checkCourseAccess } from '../services/courseService';
import { CourseDetails } from '../types/course';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([1]));
  const [isEnrolling, setIsEnrolling] = useState(false);

  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useQuery<CourseDetails>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  });

  const { data: accessData } = useQuery({
    queryKey: ['courseAccess', courseId],
    queryFn: () => checkCourseAccess(courseId!),
    enabled: !!courseId && isAuthenticated,
  });

  const toggleModule = (lessonNumber: number) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonNumber)) {
        newSet.delete(lessonNumber);
      } else {
        newSet.add(lessonNumber);
      }
      return newSet;
    });
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to enroll in courses', 'error');
      navigate('/login');
      return;
    }

    if (!courseId) return;

    setIsEnrolling(true);
    try {
      await enrollInCourse(courseId);
      showToast('Successfully enrolled in course!', 'success');
      refetch();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Failed to enroll in course', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    if (!course?.isEnrolled) {
      showToast('Please enroll in the course first', 'error');
      return;
    }
    navigate(`/lessons/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassmorphicCard className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
          <p className="text-gray-300 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <GlassmorphicButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </GlassmorphicButton>
        </GlassmorphicCard>
      </div>
    );
  }

  const canAccess = accessData?.canAccess ?? true;
  const accessMessage = accessData?.message;

  return (
    <div className="min-h-screen camo-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <GlassmorphicCard variant="elevated" className="overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Course Thumbnail */}
              <div className="md:w-1/3">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-64 md:h-full object-cover rounded-lg"
                />
              </div>

              {/* Course Info */}
              <div className="md:w-2/3 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-hot-pink text-white text-sm font-bold rounded-full">
                    Course {course.courseNumber}
                  </span>
                  {course.isCompleted && (
                    <span className="px-3 py-1 bg-success-teal text-white text-sm font-bold rounded-full">
                      ✓ Completed
                    </span>
                  )}
                  {course.isLocked && (
                    <span className="px-3 py-1 bg-steel-grey text-white text-sm font-bold rounded-full">
                      🔒 Locked
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-6">{course.description}</p>

                {/* Course Stats */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Lessons</p>
                    <p className="text-white text-xl font-bold">{course.lessons.length}</p>
                  </div>
                  {course.isEnrolled && course.progress !== undefined && (
                    <div>
                      <p className="text-gray-400 text-sm">Progress</p>
                      <p className="text-white text-xl font-bold">{course.progress}%</p>
                    </div>
                  )}
                </div>

                {/* Prerequisites */}
                {!canAccess && accessMessage && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm">
                      <strong>⚠️ Prerequisites Required:</strong> {accessMessage}
                    </p>
                  </div>
                )}

                {/* Enrollment Button */}
                {!course.isEnrolled && canAccess && (
                  <GlassmorphicButton
                    onClick={handleEnroll}
                    loading={isEnrolling}
                    disabled={isEnrolling}
                    size="lg"
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                  </GlassmorphicButton>
                )}

                {course.isEnrolled && (
                  <div className="flex gap-4">
                    <GlassmorphicButton
                      onClick={() => {
                        const firstLesson = course.lessons[0];
                        if (firstLesson) {
                          navigate(`/lessons/${firstLesson.id}`);
                        }
                      }}
                      size="lg"
                    >
                      Continue Learning
                    </GlassmorphicButton>
                  </div>
                )}
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <GlassmorphicCard className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What You'll Learn</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-success-teal text-2xl">✓</span>
              <p className="text-gray-300">Master essential business fundamentals</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-success-teal text-2xl">✓</span>
              <p className="text-gray-300">Develop strategic thinking skills</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-success-teal text-2xl">✓</span>
              <p className="text-gray-300">Build confidence in decision-making</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-success-teal text-2xl">✓</span>
              <p className="text-gray-300">Apply knowledge through practical exercises</p>
            </div>
          </div>
        </GlassmorphicCard>

        {/* Lessons List */}
        <GlassmorphicCard>
          <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
          <div className="space-y-4">
            {course.lessons.map((lesson) => {
              const isExpanded = expandedModules.has(lesson.lessonNumber);
              // Lesson is locked if:
              // 1. User is not enrolled, OR
              // 2. User is enrolled but lesson number is greater than completed lessons + 1
              // First lesson (lessonNumber 1) should always be unlocked if enrolled
              // Use completedLessons from backend (actual count) instead of calculating from progress percentage
              const completedLessons = course.completedLessons ?? 0;
              // First lesson is always unlocked if enrolled, otherwise check if lesson number exceeds completed + 1
              const isLocked = !course.isEnrolled || (course.isEnrolled && lesson.lessonNumber > 1 && lesson.lessonNumber > completedLessons + 1);

              return (
                <div key={lesson.id} className="border border-white/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleModule(lesson.lessonNumber)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-hot-pink font-bold text-lg">
                        {lesson.lessonNumber}
                      </span>
                      <div className="text-left">
                        <h3 className="text-white font-semibold">{lesson.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {Math.floor(lesson.duration / 60)} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isLocked && <span className="text-gray-400">🔒</span>}
                      <span className="text-white text-xl">
                        {isExpanded ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-black/20 border-t border-white/10">
                      <p className="text-gray-300 mb-4">{lesson.description}</p>
                      <GlassmorphicButton
                        onClick={() => handleLessonClick(lesson.id)}
                        size="sm"
                        disabled={!course.isEnrolled || isLocked}
                      >
                        {isLocked ? 'Locked' : 'Start Lesson'}
                      </GlassmorphicButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Project & Exam */}
          {course.finalProject && (
            <div className="mt-6 border border-white/20 rounded-lg p-4 bg-hot-pink/10">
              <h3 className="text-white font-bold mb-2">📋 Final Project</h3>
              <p className="text-gray-300 text-sm mb-2">{course.finalProject.title}</p>
              <p className="text-gray-400 text-xs">{course.finalProject.description}</p>
            </div>
          )}

          {course.finalExam && (
            <div className="mt-4 border border-white/20 rounded-lg p-4 bg-success-teal/10">
              <h3 className="text-white font-bold mb-2">📝 Final Exam</h3>
              <p className="text-gray-300 text-sm mb-2">{course.finalExam.title}</p>
              <p className="text-gray-400 text-xs">
                Time Limit: {course.finalExam.timeLimit} minutes | Passing Score:{' '}
                {course.finalExam.passingScore}%
              </p>
            </div>
          )}
        </GlassmorphicCard>
      </div>
    </div>
  );
}
