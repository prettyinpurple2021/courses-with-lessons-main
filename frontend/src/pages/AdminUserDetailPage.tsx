import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface CourseProgress {
  courseId: string;
  courseNumber: number;
  courseTitle: string;
  isEnrolled: boolean;
  isCompleted: boolean;
  enrolledAt?: string;
  completedAt?: string;
  currentLesson: number;
  totalLessons: number;
  completedLessons: number;
  totalActivities: number;
  completedActivities: number;
  finalProjectStatus: string;
  finalExamPassed: boolean;
  finalExamScore?: number;
}

interface UserProgress {
  userId: string;
  userName: string;
  email: string;
  courses: CourseProgress[];
}

const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockCourseNumber, setUnlockCourseNumber] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserProgress();
    }
  }, [userId]);

  const fetchUserProgress = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch user progress');
      }

      setUserProgress(data.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load user progress'
      );
      navigate('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockCourse = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/unlock-course`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseNumber: unlockCourseNumber }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to unlock course');
      }

      toast.success('Course unlocked successfully');
      setShowUnlockModal(false);
      fetchUserProgress();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to unlock course'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userProgress) {
    return null;
  }

  return (
    <div className="min-h-screen camo-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="text-hot-pink hover:text-hot-pink/80 mb-4"
          >
            ← Back to Users
          </button>
          <h1 className="text-4xl font-bold text-hot-pink mb-2">
            {userProgress.userName}
          </h1>
          <p className="text-steel-grey">{userProgress.email}</p>
        </div>

        {/* Actions */}
        <GlassmorphicCard className="p-6 mb-6">
          <div className="flex gap-4">
            <GlassmorphicButton
              variant="primary"
              onClick={() => setShowUnlockModal(true)}
            >
              Unlock Course
            </GlassmorphicButton>
            <GlassmorphicButton
              variant="secondary"
              onClick={() =>
                navigate(`/admin/users/${userId}/activities`)
              }
            >
              View Activity Details
            </GlassmorphicButton>
          </div>
        </GlassmorphicCard>

        {/* Course Progress */}
        <div className="space-y-4">
          {userProgress.courses.map((course) => (
            <GlassmorphicCard key={course.courseId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-glossy-black">
                    Course {course.courseNumber}: {course.courseTitle}
                  </h3>
                  <div className="flex gap-3 mt-2">
                    {course.isEnrolled ? (
                      <span className="px-3 py-1 bg-success-teal/20 text-success-teal rounded-full text-xs font-semibold">
                        ENROLLED
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-steel-grey/20 text-steel-grey rounded-full text-xs font-semibold">
                        NOT ENROLLED
                      </span>
                    )}
                    {course.isCompleted && (
                      <span className="px-3 py-1 bg-hot-pink/20 text-hot-pink rounded-full text-xs font-semibold">
                        COMPLETED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {course.isEnrolled && (
                <div className="space-y-4">
                  {/* Lessons Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-glossy-black">
                        Lessons Progress
                      </span>
                      <span className="text-sm text-steel-grey">
                        {course.completedLessons} / {course.totalLessons}
                      </span>
                    </div>
                    <div className="w-full bg-steel-grey/20 rounded-full h-3">
                      <div
                        className="bg-hot-pink h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            (course.completedLessons / course.totalLessons) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-steel-grey mt-1">
                      Currently on Lesson {course.currentLesson}
                    </p>
                  </div>

                  {/* Activities Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-glossy-black">
                        Activities Completed
                      </span>
                      <span className="text-sm text-steel-grey">
                        {course.completedActivities} / {course.totalActivities}
                      </span>
                    </div>
                    <div className="w-full bg-steel-grey/20 rounded-full h-3">
                      <div
                        className="bg-success-teal h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            (course.completedActivities / course.totalActivities) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Final Project & Exam Status */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-steel-grey/20">
                    <div>
                      <p className="text-sm font-medium text-glossy-black mb-1">
                        Final Project
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.finalProjectStatus === 'approved'
                            ? 'bg-success-teal/20 text-success-teal'
                            : course.finalProjectStatus === 'pending'
                            ? 'bg-hot-pink/20 text-hot-pink'
                            : 'bg-steel-grey/20 text-steel-grey'
                        }`}
                      >
                        {course.finalProjectStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-glossy-black mb-1">
                        Final Exam
                      </p>
                      {course.finalExamPassed ? (
                        <div>
                          <span className="px-3 py-1 bg-success-teal/20 text-success-teal rounded-full text-xs font-semibold">
                            PASSED ({course.finalExamScore}%)
                          </span>
                        </div>
                      ) : course.finalExamScore !== undefined ? (
                        <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-semibold">
                          FAILED ({course.finalExamScore}%)
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-steel-grey/20 text-steel-grey rounded-full text-xs font-semibold">
                          NOT TAKEN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  {course.enrolledAt && (
                    <div className="text-xs text-steel-grey pt-2">
                      Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                      {course.completedAt && (
                        <> • Completed: {new Date(course.completedAt).toLocaleDateString()}</>
                      )}
                    </div>
                  )}
                </div>
              )}
            </GlassmorphicCard>
          ))}
        </div>

        {/* Unlock Course Modal */}
        {showUnlockModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <GlassmorphicCard className="p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-hot-pink mb-4">
                Unlock Course
              </h3>
              <p className="text-steel-grey mb-6">
                Select which course to unlock for this user:
              </p>
              <select
                value={unlockCourseNumber}
                onChange={(e) => setUnlockCourseNumber(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink mb-6"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    Course {num}
                  </option>
                ))}
              </select>
              <div className="flex gap-4">
                <GlassmorphicButton
                  variant="secondary"
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1"
                >
                  Cancel
                </GlassmorphicButton>
                <GlassmorphicButton
                  variant="primary"
                  onClick={handleUnlockCourse}
                  className="flex-1"
                >
                  Unlock
                </GlassmorphicButton>
              </div>
            </GlassmorphicCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
