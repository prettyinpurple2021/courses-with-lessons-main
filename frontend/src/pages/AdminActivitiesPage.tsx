/// <reference types="vite/client" />
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Activity {
  id: string;
  activityNumber: number;
  title: string;
  description: string;
  type: string;
  content: any;
  required: boolean;
}

const AdminActivitiesPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (lessonId) {
      fetchActivities();
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setLessonTitle(data.data.title);
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/lessons/${lessonId}/activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch activities');
      }

      setActivities(data.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load activities'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/activities/${activityId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete activity');
      }

      toast.success('Activity deleted successfully');
      fetchActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete activity'
      );
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      quiz: 'Quiz',
      exercise: 'Exercise',
      reflection: 'Reflection',
      practical_task: 'Practical Task',
    };
    return labels[type] || type;
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      quiz: 'bg-hot-pink',
      exercise: 'bg-success-teal',
      reflection: 'bg-holographic-cyan',
      practical_task: 'bg-holographic-magenta',
    };
    return colors[type] || 'bg-steel-grey';
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
              Activity Management
            </h1>
            <p className="text-steel-grey">{lessonTitle}</p>
          </div>
          <div className="flex gap-4">
            <GlassmorphicButton
              variant="secondary"
              onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}
            >
              ← Back to Lessons
            </GlassmorphicButton>
            <GlassmorphicButton
              variant="primary"
              onClick={() =>
                navigate(`/admin/courses/${courseId}/lessons/${lessonId}/activities/new`)
              }
            >
              + Add Activity
            </GlassmorphicButton>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.map((activity) => (
            <GlassmorphicCard key={activity.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-lg bg-hot-pink flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {activity.activityNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-glossy-black">
                        {activity.title}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full text-white ${getActivityTypeColor(
                          activity.type
                        )}`}
                      >
                        {getActivityTypeLabel(activity.type)}
                      </span>
                      {!activity.required && (
                        <span className="text-xs px-3 py-1 rounded-full bg-steel-grey text-white">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-steel-grey mb-3">
                      {activity.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/courses/${courseId}/lessons/${lessonId}/activities/${activity.id}/edit`
                      )
                    }
                    className="px-4 py-2 rounded-lg glassmorphic hover:bg-hot-pink/10 transition-colors text-sm font-semibold text-hot-pink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="px-4 py-2 rounded-lg glassmorphic hover:bg-red-500/10 transition-colors text-sm font-semibold text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-steel-grey text-lg mb-4">
              No activities found for this lesson
            </p>
            <GlassmorphicButton
              variant="primary"
              onClick={() =>
                navigate(`/admin/courses/${courseId}/lessons/${lessonId}/activities/new`)
              }
            >
              Create First Activity
            </GlassmorphicButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivitiesPage;
