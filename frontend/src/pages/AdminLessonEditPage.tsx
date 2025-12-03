import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface LessonFormData {
  lessonNumber: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
}

interface YouTubeValidation {
  valid: boolean;
  videoId: string;
  title: string;
  duration: number;
  thumbnail: string;
}

const AdminLessonEditPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const isNew = lessonId === 'new';
  const [formData, setFormData] = useState<LessonFormData>({
    lessonNumber: 1,
    title: '',
    description: '',
    youtubeVideoId: '',
    duration: 0,
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [videoValidation, setVideoValidation] =
    useState<YouTubeValidation | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isNew && lessonId) {
      fetchLesson();
    }
  }, [lessonId, isNew]);

  const fetchLesson = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/lessons/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch lesson');
      }

      setFormData({
        lessonNumber: data.data.lessonNumber,
        title: data.data.title,
        description: data.data.description,
        youtubeVideoId: data.data.youtubeVideoId,
        duration: data.data.duration,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load lesson'
      );
      navigate(`/admin/courses/${courseId}/lessons`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateYouTubeVideo = async () => {
    if (!formData.youtubeVideoId) {
      toast.error('Please enter a YouTube video ID');
      return;
    }

    setIsValidating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/youtube/validate/${
          formData.youtubeVideoId
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Video validation failed');
      }

      setVideoValidation(data.data);
      setFormData({
        ...formData,
        duration: data.data.duration,
      });
      toast.success('Video validated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to validate video'
      );
      setVideoValidation(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoValidation && isNew) {
      toast.error('Please validate the YouTube video first');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const url = isNew
        ? `${import.meta.env.VITE_API_BASE_URL}/admin/courses/${courseId}/lessons`
        : `${import.meta.env.VITE_API_BASE_URL}/admin/lessons/${lessonId}`;

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to save lesson');
      }

      toast.success(
        `Lesson ${isNew ? 'created' : 'updated'} successfully`
      );
      navigate(`/admin/courses/${courseId}/lessons`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save lesson'
      );
    } finally {
      setIsSaving(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-hot-pink mb-2">
            {isNew ? 'Create New Lesson' : 'Edit Lesson'}
          </h1>
          <p className="text-steel-grey">
            {isNew ? 'Add a new lesson to the course' : 'Update lesson details'}
          </p>
        </div>

        <GlassmorphicCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Lesson Number (1-12)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.lessonNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lessonNumber: parseInt(e.target.value),
                  })
                }
                disabled={!isNew}
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                YouTube Video ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.youtubeVideoId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      youtubeVideoId: e.target.value,
                    });
                    setVideoValidation(null);
                  }}
                  required
                  className="flex-1 px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                  placeholder="e.g., dQw4w9WgXcQ"
                />
                <GlassmorphicButton
                  type="button"
                  variant="secondary"
                  onClick={validateYouTubeVideo}
                  disabled={isValidating || !formData.youtubeVideoId}
                  loading={isValidating}
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </GlassmorphicButton>
              </div>
              <p className="text-xs text-steel-grey mt-1">
                Enter the video ID from the YouTube URL (e.g., from
                youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
              </p>
            </div>

            {videoValidation && (
              <div className="p-4 rounded-lg bg-success-teal/10 border border-success-teal">
                <div className="flex gap-4">
                  <img
                    src={videoValidation.thumbnail}
                    alt="Video thumbnail"
                    className="w-32 h-20 object-cover rounded"
                  />
                  <div>
                    <div className="text-sm font-semibold text-glossy-black mb-1">
                      ✓ Video Validated
                    </div>
                    <div className="text-sm text-steel-grey">
                      {videoValidation.title}
                    </div>
                    <div className="text-xs text-steel-grey mt-1">
                      Duration:{' '}
                      {Math.floor(videoValidation.duration / 60)}m{' '}
                      {videoValidation.duration % 60}s
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Lesson Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="e.g., Introduction to Business Planning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="Describe what students will learn in this lesson..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="Auto-filled from YouTube validation"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <GlassmorphicButton
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}
                disabled={isSaving}
              >
                Cancel
              </GlassmorphicButton>
              <GlassmorphicButton
                type="submit"
                variant="primary"
                disabled={isSaving}
                loading={isSaving}
                className="flex-1"
              >
                {isSaving
                  ? 'Saving...'
                  : isNew
                  ? 'Create Lesson'
                  : 'Update Lesson'}
              </GlassmorphicButton>
            </div>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminLessonEditPage;
