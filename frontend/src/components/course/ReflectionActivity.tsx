import React, { useState } from 'react';
import { Activity, ReflectionContent, ReflectionResponse } from '../../types/activity';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';

interface ReflectionActivityProps {
  activity: Activity;
  onSubmit: (response: ReflectionResponse) => Promise<void>;
  isSubmitting: boolean;
}

const ReflectionActivity: React.FC<ReflectionActivityProps> = ({ activity, onSubmit, isSubmitting }) => {
  const content = activity.content as ReflectionContent;
  const [reflection, setReflection] = useState<string>(activity.submission?.response?.reflection || '');

  const handleSubmit = async () => {
    if (reflection.trim().length < content.minLength) {
      alert(`Please write at least ${content.minLength} characters for your reflection.`);
      return;
    }
    await onSubmit({ reflection });
  };

  const meetsMinLength = reflection.trim().length >= content.minLength;
  const progressPercentage = Math.min(100, (reflection.trim().length / content.minLength) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{activity.title}</h2>
        <p className="text-white/80">{activity.description}</p>
      </div>

      <GlassmorphicCard variant="default" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Reflection Prompt</h3>
        <div className="text-white/80 whitespace-pre-wrap text-lg italic">
          "{content.prompt}"
        </div>
      </GlassmorphicCard>

      <GlassmorphicCard variant="default" className="p-6">
        <label className="block text-white font-semibold mb-3">Your Reflection</label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your thoughts and insights..."
          disabled={activity.isCompleted}
          className="w-full h-64 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-hot-pink/50 focus:border-hot-pink/50 transition-all duration-300 resize-none disabled:opacity-70 disabled:cursor-not-allowed"
        />
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">
              {reflection.trim().length} / {content.minLength} characters minimum
            </span>
            <span className={`text-sm font-semibold ${meetsMinLength ? 'text-success-teal' : 'text-white/60'}`}>
              {meetsMinLength ? '✓ Minimum met' : 'Keep writing...'}
            </span>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                meetsMinLength ? 'bg-success-teal' : 'bg-hot-pink'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </GlassmorphicCard>

      {!activity.isCompleted && (
        <div className="flex justify-end">
          <GlassmorphicButton
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!meetsMinLength || isSubmitting}
            loading={isSubmitting}
          >
            Submit Reflection
          </GlassmorphicButton>
        </div>
      )}

      {activity.submission?.feedback && (
        <GlassmorphicCard variant="elevated" className="p-6 bg-success-teal/10 border-success-teal/30">
          <h4 className="text-success-teal font-semibold mb-2">Feedback</h4>
          <p className="text-white">{activity.submission.feedback}</p>
        </GlassmorphicCard>
      )}
    </div>
  );
};

export default ReflectionActivity;
