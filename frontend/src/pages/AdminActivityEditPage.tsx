import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface QuizQuestion {
  id?: string;
  question?: string;
  text?: string; // Alternative field name
  options: string[];
  correctAnswer: number;
  feedback?: string;
  explanation?: string;
}

interface ActivityFormData {
  activityNumber: number;
  title: string;
  description: string;
  type: string;
  content: any;
  required: boolean;
}

const AdminActivityEditPage: React.FC = () => {
  const { courseId, lessonId, activityId } = useParams<{
    courseId: string;
    lessonId: string;
    activityId: string;
  }>();
  const isNew = activityId === 'new';
  const [formData, setFormData] = useState<ActivityFormData>({
    activityNumber: 1,
    title: '',
    description: '',
    type: 'quiz',
    content: {},
    required: true,
  });
  const [contentJson, setContentJson] = useState('{}');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isNew && activityId) {
      fetchActivity();
    }
  }, [activityId, isNew]);

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/activities/${activityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch activity');
      }

      setFormData({
        activityNumber: data.data.activityNumber,
        title: data.data.title,
        description: data.data.description,
        type: data.data.type,
        content: data.data.content,
        required: data.data.required,
      });
      setContentJson(JSON.stringify(data.data.content, null, 2));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load activity'
      );
      navigate(`/admin/courses/${courseId}/lessons/${lessonId}/activities`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON content
    try {
      const parsedContent = JSON.parse(contentJson);
      formData.content = parsedContent;
    } catch (error) {
      toast.error('Invalid JSON in content field');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const url = isNew
        ? `${import.meta.env.VITE_API_URL}/api/admin/lessons/${lessonId}/activities`
        : `${import.meta.env.VITE_API_URL}/api/admin/activities/${activityId}`;

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
        throw new Error(data.error?.message || 'Failed to save activity');
      }

      toast.success(
        `Activity ${isNew ? 'created' : 'updated'} successfully`
      );
      navigate(`/admin/courses/${courseId}/lessons/${lessonId}/activities`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save activity'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activityTypes = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'practical_task', label: 'Practical Task' },
  ];

  const getContentTemplate = (type: string) => {
    const templates: Record<string, any> = {
      quiz: {
        questions: [
          {
            question: 'Sample question?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
          },
        ],
      },
      exercise: {
        instructions: 'Complete the following exercise...',
        tasks: ['Task 1', 'Task 2'],
      },
      reflection: {
        prompt: 'Reflect on the following...',
        minWords: 100,
      },
      practical_task: {
        instructions: 'Complete this practical task...',
        deliverables: ['Deliverable 1', 'Deliverable 2'],
      },
    };
    return JSON.stringify(templates[type] || {}, null, 2);
  };

  const handleTypeChange = (newType: string) => {
    setFormData({ ...formData, type: newType });
    if (isNew) {
      setContentJson(getContentTemplate(newType));
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
            {isNew ? 'Create New Activity' : 'Edit Activity'}
          </h1>
          <p className="text-steel-grey">
            {isNew ? 'Add a new activity to the lesson' : 'Update activity details'}
          </p>
        </div>

        <GlassmorphicCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Activity Number
              </label>
              <input
                type="number"
                min="1"
                value={formData.activityNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activityNumber: parseInt(e.target.value),
                  })
                }
                disabled={!isNew}
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Activity Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Activity Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="e.g., Quiz: Business Planning Basics"
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
                rows={3}
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="Describe what students will do in this activity..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Content (JSON)
              </label>
              <textarea
                value={contentJson}
                onChange={(e) => setContentJson(e.target.value)}
                required
                rows={12}
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink font-mono text-sm"
                placeholder="Enter activity content as JSON..."
              />
              <div className="mt-2 space-y-2">
                <p className="text-xs text-steel-grey">
                  Enter the activity content as valid JSON. The structure depends on the activity type.
                </p>
                {formData.type === 'quiz' && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-hot-pink font-semibold hover:text-hot-pink/80">
                      📝 Quiz JSON Format Example (with feedback)
                    </summary>
                    <div className="mt-2 p-3 bg-white/5 rounded-lg border border-steel-grey/20">
                      <pre className="text-xs text-steel-grey whitespace-pre-wrap overflow-x-auto">
{`{
  "questions": [
    {
      "id": "q1",
      "text": "What is the primary purpose of a business plan?",
      "options": [
        "To secure funding",
        "To outline business strategy",
        "To track expenses",
        "To hire employees"
      ],
      "correctAnswer": 1,
      "explanation": "A business plan primarily outlines the business strategy, goals, and roadmap for achieving success. While it can help secure funding, that's a secondary purpose."
    },
    {
      "id": "q2",
      "text": "Which section comes first in a business plan?",
      "options": [
        "Financial Projections",
        "Executive Summary",
        "Market Analysis",
        "Operations Plan"
      ],
      "correctAnswer": 1,
      "feedback": "The Executive Summary is always first as it provides an overview of the entire plan."
    }
  ]
}`}
                      </pre>
                      <p className="text-xs text-steel-grey mt-2">
                        <strong>Tip:</strong> Include <code className="bg-white/10 px-1 rounded">feedback</code> or <code className="bg-white/10 px-1 rounded">explanation</code> fields to provide detailed feedback to students when they answer questions.
                      </p>
                    </div>
                  </details>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) =>
                  setFormData({ ...formData, required: e.target.checked })
                }
                className="w-5 h-5 rounded border-steel-grey focus:ring-hot-pink"
              />
              <label htmlFor="required" className="text-sm text-glossy-black">
                Required (students must complete this activity to progress)
              </label>
            </div>

            {/* Preview Toggle */}
            <div className="border-t border-steel-grey/20 pt-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 rounded-lg bg-success-teal/20 text-glossy-black hover:bg-success-teal/30 transition-all"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="border-t border-steel-grey/20 pt-6">
                <h3 className="text-xl font-bold text-hot-pink mb-4">
                  Activity Preview
                </h3>
                <GlassmorphicCard className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-hot-pink/20 text-hot-pink rounded-full text-xs font-semibold uppercase">
                        {formData.type.replace('_', ' ')}
                      </span>
                      {formData.required && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-semibold">
                          REQUIRED
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-glossy-black mb-2">
                      {formData.title || 'Untitled Activity'}
                    </h4>
                    <p className="text-steel-grey">
                      {formData.description || 'No description'}
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <h5 className="font-semibold text-glossy-black mb-3">
                      Activity Content:
                    </h5>
                    
                    {/* Quiz Preview */}
                    {formData.type === 'quiz' && (() => {
                      try {
                        const content = JSON.parse(contentJson);
                        return (
                          <div className="space-y-4">
                            {content.questions?.map((q: QuizQuestion, index: number) => {
                              const questionText = q.question || q.text || 'Untitled Question';
                              return (
                                <div key={index} className="space-y-2 p-4 bg-white/5 rounded-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-medium text-glossy-black">
                                      {index + 1}. {questionText}
                                    </p>
                                  </div>
                                  <div className="space-y-1 pl-4">
                                    {q.options?.map((opt: string, oIndex: number) => (
                                      <div
                                        key={oIndex}
                                        className={`p-2 rounded ${
                                          oIndex === q.correctAnswer
                                            ? 'bg-success-teal/10 border border-success-teal/30'
                                            : 'bg-white/5'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIndex)}. {opt}
                                        {oIndex === q.correctAnswer && (
                                          <span className="ml-2 text-xs text-success-teal">
                                            ✓ Correct
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  {(q.feedback || q.explanation) && (
                                    <div className="mt-3 pt-3 border-t border-steel-grey/20">
                                      <p className="text-xs font-semibold text-hot-pink mb-1">
                                        Feedback/Explanation:
                                      </p>
                                      <p className="text-xs text-steel-grey">
                                        {q.feedback || q.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {(!content.questions || content.questions.length === 0) && (
                              <p className="text-steel-grey text-sm italic">
                                No questions defined. Add questions in the JSON content field.
                              </p>
                            )}
                          </div>
                        );
                      } catch {
                        return <p className="text-red-500 text-sm">Invalid JSON format</p>;
                      }
                    })()}

                    {/* Exercise Preview */}
                    {formData.type === 'exercise' && (() => {
                      try {
                        const content = JSON.parse(contentJson);
                        return (
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium mb-2">Instructions:</p>
                              <p className="text-sm text-steel-grey">
                                {content.instructions}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium mb-2">Tasks:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {content.tasks?.map((task: string, index: number) => (
                                  <li key={index} className="text-sm text-steel-grey">
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      } catch {
                        return <p className="text-red-500 text-sm">Invalid JSON format</p>;
                      }
                    })()}

                    {/* Reflection Preview */}
                    {formData.type === 'reflection' && (() => {
                      try {
                        const content = JSON.parse(contentJson);
                        return (
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium mb-2">Prompt:</p>
                              <p className="text-sm text-steel-grey">
                                {content.prompt}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-steel-grey">
                                Minimum words: {content.minWords}
                              </p>
                              <div className="mt-2 w-full h-32 bg-white/5 rounded border border-steel-grey/20 p-2 text-xs text-steel-grey">
                                Student reflection will appear here...
                              </div>
                            </div>
                          </div>
                        );
                      } catch {
                        return <p className="text-red-500 text-sm">Invalid JSON format</p>;
                      }
                    })()}

                    {/* Practical Task Preview */}
                    {formData.type === 'practical_task' && (() => {
                      try {
                        const content = JSON.parse(contentJson);
                        return (
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium mb-2">Instructions:</p>
                              <p className="text-sm text-steel-grey">
                                {content.instructions}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium mb-2">Deliverables:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {content.deliverables?.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-steel-grey">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      } catch {
                        return <p className="text-red-500 text-sm">Invalid JSON format</p>;
                      }
                    })()}
                  </div>
                </GlassmorphicCard>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <GlassmorphicButton
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(`/admin/courses/${courseId}/lessons/${lessonId}/activities`)
                }
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
                  ? 'Create Activity'
                  : 'Update Activity'}
              </GlassmorphicButton>
            </div>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminActivityEditPage;
