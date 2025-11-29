import React, { useState } from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';

interface PostComposerProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  submitButtonText?: string;
  isReply?: boolean;
}

const PostComposer: React.FC<PostComposerProps> = ({
  onSubmit,
  placeholder = 'Share your thoughts...',
  submitButtonText = 'Post',
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (content.trim().length < 10) {
      setError('Content must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassmorphicCard variant="default" className="p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/30 text-white border border-white/20 rounded-lg p-3 min-h-[120px] focus:outline-none focus:border-hot-pink transition-colors resize-none"
          disabled={isSubmitting}
        />
        
        {error && (
          <div className="mt-2 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-steel-grey">
            {content.length} characters
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || content.trim().length < 10}
            className="px-6 py-2 bg-hot-pink text-white font-bold rounded-lg hover:bg-hot-pink/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all holographic-shimmer"
          >
            {isSubmitting ? 'Posting...' : submitButtonText}
          </button>
        </div>
      </form>
    </GlassmorphicCard>
  );
};

export default PostComposer;
