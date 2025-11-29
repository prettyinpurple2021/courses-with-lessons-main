import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import { getForumCategories, createThread } from '../services/forumService';
import { ForumCategory } from '../types/forum';
import { useToast } from '../hooks/useToast';

const CreateThreadPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getForumCategories();
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load categories');
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const thread = await createThread({
        categoryId,
        title: title.trim(),
        content: content.trim(),
      });

      toast.success('Thread created successfully');
      navigate(`/community/threads/${thread.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen camo-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community')}
          className="mb-6 text-hot-pink hover:text-hot-pink/80 transition-colors flex items-center gap-2"
        >
          ← Back to Forum
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Thread</h1>
          <p className="text-steel-grey">Start a new discussion in the community</p>
        </div>

        {/* Form */}
        <GlassmorphicCard variant="elevated" className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-black/30 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors"
                disabled={isSubmitting}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <div className="mt-2 text-red-400 text-sm">{errors.categoryId}</div>
              )}
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-2">Thread Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title..."
                className="w-full bg-black/30 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors"
                disabled={isSubmitting}
              />
              <div className="mt-1 text-sm text-steel-grey">
                {title.length}/200 characters
              </div>
              {errors.title && (
                <div className="mt-2 text-red-400 text-sm">{errors.title}</div>
              )}
            </div>

            {/* Content Input */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or ideas..."
                className="w-full bg-black/30 text-white border border-white/20 rounded-lg px-4 py-3 min-h-[200px] focus:outline-none focus:border-hot-pink transition-colors resize-none"
                disabled={isSubmitting}
              />
              <div className="mt-1 text-sm text-steel-grey">
                {content.length} characters
              </div>
              {errors.content && (
                <div className="mt-2 text-red-400 text-sm">{errors.content}</div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/community')}
                className="px-6 py-3 text-white hover:text-hot-pink transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-hot-pink text-white font-bold rounded-lg hover:bg-hot-pink/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all holographic-shimmer"
              >
                {isSubmitting ? 'Creating...' : 'Create Thread'}
              </button>
            </div>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default CreateThreadPage;
