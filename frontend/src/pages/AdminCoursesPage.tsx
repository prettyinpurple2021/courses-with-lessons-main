import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Course {
  id: string;
  courseNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  published: boolean;
  _count: {
    lessons: number;
    enrollments: number;
  };
  finalProject?: {
    id: string;
    title: string;
  };
  finalExam?: {
    id: string;
    title: string;
  };
}

const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch courses');
      }

      setCourses(data.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load courses'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen camo-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-hot-pink mb-2">
              Course Management
            </h1>
            <p className="text-steel-grey">
              Manage all 7 courses and their content
            </p>
          </div>
          <div className="flex gap-4">
            <GlassmorphicButton
              variant="secondary"
              onClick={() => navigate('/admin/dashboard')}
            >
              ← Back to Dashboard
            </GlassmorphicButton>
            <GlassmorphicButton
              variant="primary"
              onClick={() => navigate('/admin/courses/new')}
            >
              + Create Course
            </GlassmorphicButton>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <GlassmorphicCard key={course.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-hot-pink flex items-center justify-center text-white font-bold text-xl">
                    {course.courseNumber}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-glossy-black">
                      {course.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        course.published
                          ? 'bg-success-teal text-white'
                          : 'bg-steel-grey text-white'
                      }`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-steel-grey mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-steel-grey">Lessons</div>
                  <div className="font-bold text-glossy-black">
                    {course._count.lessons}/12
                  </div>
                </div>
                <div>
                  <div className="text-steel-grey">Enrollments</div>
                  <div className="font-bold text-glossy-black">
                    {course._count.enrollments}
                  </div>
                </div>
                <div>
                  <div className="text-steel-grey">Final Project</div>
                  <div className="font-bold text-glossy-black">
                    {course.finalProject ? '✓' : '✗'}
                  </div>
                </div>
                <div>
                  <div className="text-steel-grey">Final Exam</div>
                  <div className="font-bold text-glossy-black">
                    {course.finalExam ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                  className="flex-1 px-4 py-2 rounded-lg glassmorphic hover:bg-hot-pink/10 transition-colors text-sm font-semibold text-hot-pink"
                >
                  Manage
                </button>
                <button
                  onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                  className="flex-1 px-4 py-2 rounded-lg glassmorphic hover:bg-success-teal/10 transition-colors text-sm font-semibold text-success-teal"
                >
                  Lessons
                </button>
              </div>
            </GlassmorphicCard>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-steel-grey text-lg mb-4">No courses found</p>
            <GlassmorphicButton
              variant="primary"
              onClick={() => navigate('/admin/courses/new')}
            >
              Create Your First Course
            </GlassmorphicButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
