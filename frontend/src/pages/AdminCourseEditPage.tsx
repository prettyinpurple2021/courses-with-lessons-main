import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface CourseFormData {
  courseNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  published: boolean;
}

interface CourseData extends CourseFormData {
  id: string;
  finalProject?: { id: string; title: string };
  finalExam?: { id: string; title: string };
}

const AdminCourseEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const [formData, setFormData] = useState<CourseFormData>({
    courseNumber: 1,
    title: '',
    description: '',
    thumbnail: '',
    published: false,
  });
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isNew && id) {
      fetchCourse();
    }
  }, [id, isNew]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/courses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch course');
      }

      setCourseData(data.data);
      setFormData({
        courseNumber: data.data.courseNumber,
        title: data.data.title,
        description: data.data.description,
        thumbnail: data.data.thumbnail,
        published: data.data.published,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load course'
      );
      navigate('/admin/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const url = isNew
        ? `${import.meta.env.VITE_API_BASE_URL}/admin/courses`
        : `${import.meta.env.VITE_API_BASE_URL}/admin/courses/${id}`;

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
        throw new Error(data.error?.message || 'Failed to save course');
      }

      toast.success(
        `Course ${isNew ? 'created' : 'updated'} successfully`
      );
      navigate('/admin/courses');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save course'
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
            {isNew ? 'Create New Course' : 'Edit Course'}
          </h1>
          <p className="text-steel-grey">
            {isNew
              ? 'Add a new course to the academy'
              : 'Update course information'}
          </p>
        </div>

        {!isNew && courseData && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-bold text-glossy-black mb-2">
                Final Project
              </h3>
              <p className="text-sm text-steel-grey mb-4">
                {courseData.finalProject
                  ? `Current: ${courseData.finalProject.title}`
                  : 'No final project created yet'}
              </p>
              <GlassmorphicButton
                variant="primary"
                onClick={() =>
                  navigate(`/admin/courses/${id}/final-project/edit`)
                }
              >
                {courseData.finalProject ? 'Edit' : 'Create'} Final Project
              </GlassmorphicButton>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-bold text-glossy-black mb-2">
                Final Exam
              </h3>
              <p className="text-sm text-steel-grey mb-4">
                {courseData.finalExam
                  ? `Current: ${courseData.finalExam.title}`
                  : 'No final exam created yet'}
              </p>
              <GlassmorphicButton
                variant="primary"
                onClick={() =>
                  navigate(`/admin/courses/${id}/final-exam/edit`)
                }
              >
                {courseData.finalExam ? 'Edit' : 'Create'} Final Exam
              </GlassmorphicButton>
            </GlassmorphicCard>
          </div>
        )}

        <GlassmorphicCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Course Number (1-7)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.courseNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    courseNumber: parseInt(e.target.value),
                  })
                }
                disabled={!isNew}
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Course Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="e.g., Business Foundations"
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
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail: e.target.value })
                }
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-5 h-5 rounded border-steel-grey focus:ring-hot-pink"
              />
              <label htmlFor="published" className="text-sm text-glossy-black">
                Publish course (make visible to students)
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <GlassmorphicButton
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/courses')}
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
                  ? 'Create Course'
                  : 'Update Course'}
              </GlassmorphicButton>
            </div>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminCourseEditPage;
