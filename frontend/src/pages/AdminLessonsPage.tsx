import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
  _count: {
    activities: number;
    resources: number;
  };
}

const AdminLessonsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseName, setCourseName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (courseId) {
      fetchLessons();
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCourseName(data.data.title);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/courses/${courseId}/lessons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch lessons');
      }

      setLessons(data.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load lessons'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/lessons/${lessonId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete lesson');
      }

      toast.success('Lesson deleted successfully');
      fetchLessons();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete lesson'
      );
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
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
              Lesson Management
            </h1>
            <p className="text-steel-grey">{courseName}</p>
          </div>
          <div className="flex gap-4">
            <GlassmorphicButton
              variant="secondary"
              onClick={() => navigate('/admin/courses')}
            >
              ← Back to Courses
            </GlassmorphicButton>
            <GlassmorphicButton
              variant="primary"
              onClick={() =>
                navigate(`/admin/courses/${courseId}/lessons/new`)
              }
            >
              + Add Lesson
            </GlassmorphicButton>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <GlassmorphicCard key={lesson.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-lg bg-hot-pink flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {lesson.lessonNumber}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-glossy-black mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-steel-grey mb-3">
                      {lesson.description}
                    </p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-steel-grey">Video ID:</span>{' '}
                        <span className="font-mono text-glossy-black">
                          {lesson.youtubeVideoId}
                        </span>
                      </div>
                      <div>
                        <span className="text-steel-grey">Duration:</span>{' '}
                        <span className="text-glossy-black">
                          {formatDuration(lesson.duration)}
                        </span>
                      </div>
                      <div>
                        <span className="text-steel-grey">Activities:</span>{' '}
                        <span className="text-glossy-black">
                          {lesson._count.activities}
                        </span>
                      </div>
                      <div>
                        <span className="text-steel-grey">Resources:</span>{' '}
                        <span className="text-glossy-black">
                          {lesson._count.resources}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/courses/${courseId}/lessons/${lesson.id}/edit`
                      )
                    }
                    className="px-4 py-2 rounded-lg glassmorphic hover:bg-hot-pink/10 transition-colors text-sm font-semibold text-hot-pink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/courses/${courseId}/lessons/${lesson.id}/activities`
                      )
                    }
                    className="px-4 py-2 rounded-lg glassmorphic hover:bg-success-teal/10 transition-colors text-sm font-semibold text-success-teal"
                  >
                    Activities
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="px-4 py-2 rounded-lg glassmorphic hover:bg-red-500/10 transition-colors text-sm font-semibold text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-steel-grey text-lg mb-4">
              No lessons found for this course
            </p>
            <GlassmorphicButton
              variant="primary"
              onClick={() =>
                navigate(`/admin/courses/${courseId}/lessons/new`)
              }
            >
              Create First Lesson
            </GlassmorphicButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLessonsPage;
