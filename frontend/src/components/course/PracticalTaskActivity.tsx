import React, { useState } from 'react';
import { Activity, PracticalTaskContent, PracticalTaskResponse } from '../../types/activity';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';
import GlassmorphicInput from '../common/GlassmorphicInput';

interface PracticalTaskActivityProps {
  activity: Activity;
  onSubmit: (response: PracticalTaskResponse) => Promise<void>;
  isSubmitting: boolean;
}

const PracticalTaskActivity: React.FC<PracticalTaskActivityProps> = ({ activity, onSubmit, isSubmitting }) => {
  const content = activity.content as PracticalTaskContent;
  const [submission, setSubmission] = useState<Record<string, any>>(
    activity.submission?.response?.submission || {}
  );

  const handleFieldChange = (field: string, value: any) => {
    setSubmission((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const missingFields = content.requiredFields.filter((field) => !submission[field]);
    if (missingFields.length > 0) {
      alert('Please fill in all required fields before submitting.');
      return;
    }
    await onSubmit({ submission });
  };

  const allFieldsFilled = content.requiredFields.every((field) => submission[field]);

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
        <h3 className="text-lg font-semibold text-white mb-6">Task Submission</h3>
        
        <div className="space-y-4">
          {content.requiredFields.map((field) => {
            const label = content.fieldLabels[field] || field;
            const isTextArea = field.toLowerCase().includes('description') || 
                              field.toLowerCase().includes('notes') ||
                              field.toLowerCase().includes('details');

            return (
              <div key={field}>
                {isTextArea ? (
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      {label} <span className="text-hot-pink">*</span>
                    </label>
                    <textarea
                      value={submission[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      disabled={activity.isCompleted}
                      className="w-full h-32 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-hot-pink/50 focus:border-hot-pink/50 transition-all duration-300 resize-none disabled:opacity-70 disabled:cursor-not-allowed glassmorphic"
                      placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                  </div>
                ) : (
                  <GlassmorphicInput
                    label={`${label} *`}
                    value={submission[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    disabled={activity.isCompleted}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </GlassmorphicCard>

      {!activity.isCompleted && (
        <div className="flex justify-end">
          <GlassmorphicButton
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!allFieldsFilled || isSubmitting}
            loading={isSubmitting}
          >
            Submit Task
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

export default PracticalTaskActivity;
