import React, { useState } from 'react';
import { Activity, ExerciseContent, ExerciseResponse } from '../../types/activity';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';

interface ExerciseActivityProps {
  activity: Activity;
  onSubmit: (response: ExerciseResponse) => Promise<void>;
  isSubmitting: boolean;
}

const ExerciseActivity: React.FC<ExerciseActivityProps> = ({ activity, onSubmit, isSubmitting }) => {
  const content = activity.content as ExerciseContent;
  const [answer, setAnswer] = useState<string>(activity.submission?.response?.answer || '');

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }
    await onSubmit({ answer });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{activity.title}</h2>
        <p className="text-white/80">{activity.description}</p>
      </div>

      <GlassmorphicCard variant="default" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
        <div className="text-white/80 whitespace-pre-wrap">{content.instructions}</div>
      </GlassmorphicCard>

      <GlassmorphicCard variant="default" className="p-6">
        <label className="block text-white font-semibold mb-3">Your Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={content.placeholder || 'Type your answer here...'}
          disabled={activity.isCompleted}
          className="w-full h-48 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-hot-pink/50 focus:border-hot-pink/50 transition-all duration-300 resize-none disabled:opacity-70 disabled:cursor-not-allowed"
        />
        <div className="mt-2 text-white/60 text-sm">
          {answer.length} characters
        </div>
      </GlassmorphicCard>

      {!activity.isCompleted && (
        <div className="flex justify-end">
          <GlassmorphicButton
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            loading={isSubmitting}
          >
            Submit Exercise
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

export default ExerciseActivity;
