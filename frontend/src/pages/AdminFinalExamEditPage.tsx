import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ExamQuestion {
  text: string;
  type: string;
  order: number;
  points: number;
  options?: ExamQuestionOption[];
}

interface ExamQuestionOption {
  text: string;
  isCorrect: boolean;
  order: number;
}

interface FinalExamFormData {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: ExamQuestion[];
}

const AdminFinalExamEditPage: React.FC = () => {
  const { courseId } = useParams<{
    courseId: string;
  }>();
  const [examId, setExamId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [formData, setFormData] = useState<FinalExamFormData>({
    title: '',
    description: '',
    timeLimit: 60,
    passingScore: 70,
    questions: [],
  });
  const [questionsJson, setQuestionsJson] = useState('[]');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [useVisualEditor, setUseVisualEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchFinalExam();
  }, [courseId]);

  const fetchFinalExam = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}`,
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

      if (data.data.finalExam) {
        const exam = data.data.finalExam;
        setExamId(exam.id);
        setIsNew(false);
        setFormData({
          title: exam.title,
          description: exam.description,
          timeLimit: exam.timeLimit,
          passingScore: exam.passingScore,
          questions: exam.questions || [],
        });
        setQuestionsJson(JSON.stringify(exam.questions || [], null, 2));
      } else {
        // No exam exists, set up for new exam
        setIsNew(true);
        const defaultQuestions = [
          {
            text: 'Sample multiple choice question?',
            type: 'multiple_choice',
            order: 1,
            points: 10,
            options: [
              { text: 'Option A', isCorrect: true, order: 1 },
              { text: 'Option B', isCorrect: false, order: 2 },
              { text: 'Option C', isCorrect: false, order: 3 },
              { text: 'Option D', isCorrect: false, order: 4 },
            ],
          },
        ];
        setQuestionsJson(JSON.stringify(defaultQuestions, null, 2));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load final exam'
      );
      navigate(`/admin/courses/${courseId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: ExamQuestion = {
      text: '',
      type: 'multiple_choice',
      order: formData.questions.length + 1,
      points: 10,
      options: [
        { text: '', isCorrect: true, order: 1 },
        { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 },
        { text: '', isCorrect: false, order: 4 },
      ],
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    // Reorder remaining questions
    updatedQuestions.forEach((q, i) => {
      q.order = i + 1;
    });
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateQuestion = (index: number, field: keyof ExamQuestion, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof ExamQuestionOption,
    value: any
  ) => {
    const updatedQuestions = [...formData.questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    updatedQuestions[questionIndex].options = options;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    const options = updatedQuestions[questionIndex].options || [];
    options.push({
      text: '',
      isCorrect: false,
      order: options.length + 1,
    });
    updatedQuestions[questionIndex].options = options;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    const options = (updatedQuestions[questionIndex].options || []).filter(
      (_, i) => i !== optionIndex
    );
    // Reorder remaining options
    options.forEach((opt, i) => {
      opt.order = i + 1;
    });
    updatedQuestions[questionIndex].options = options;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const syncFromJson = () => {
    try {
      const parsedQuestions = JSON.parse(questionsJson);
      setFormData({ ...formData, questions: parsedQuestions });
      toast.success('Questions synced from JSON');
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const syncToJson = () => {
    setQuestionsJson(JSON.stringify(formData.questions, null, 2));
    toast.success('Questions synced to JSON');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If using JSON editor, parse and validate
    if (!useVisualEditor) {
      try {
        const parsedQuestions = JSON.parse(questionsJson);
        formData.questions = parsedQuestions;
      } catch (error) {
        toast.error('Invalid JSON in questions field');
        return;
      }
    }

    // Validate questions
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const url = isNew
        ? `${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}/final-exam`
        : `${import.meta.env.VITE_API_URL}/api/admin/final-exams/${examId}`;

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
        throw new Error(data.error?.message || 'Failed to save final exam');
      }

      toast.success(
        `Final exam ${isNew ? 'created' : 'updated'} successfully`
      );
      navigate(`/admin/courses/${courseId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save final exam'
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
            {isNew ? 'Create Final Exam' : 'Edit Final Exam'}
          </h1>
          <p className="text-steel-grey">
            {isNew
              ? 'Add a final exam for this course'
              : 'Update final exam details'}
          </p>
        </div>

        <GlassmorphicCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Exam Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="e.g., Course 1 Final Exam"
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
                placeholder="Brief overview of the final exam..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glossy-black mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeLimit: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-glossy-black mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingScore: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                />
              </div>
            </div>

            {/* Editor Mode Toggle */}
            <div className="flex items-center gap-4 border-t border-steel-grey/20 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!useVisualEditor) syncFromJson();
                  setUseVisualEditor(true);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  useVisualEditor
                    ? 'bg-hot-pink text-white'
                    : 'bg-steel-grey/20 text-glossy-black hover:bg-steel-grey/30'
                }`}
              >
                Visual Editor
              </button>
              <button
                type="button"
                onClick={() => {
                  if (useVisualEditor) syncToJson();
                  setUseVisualEditor(false);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  !useVisualEditor
                    ? 'bg-hot-pink text-white'
                    : 'bg-steel-grey/20 text-glossy-black hover:bg-steel-grey/30'
                }`}
              >
                JSON Editor
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="ml-auto px-4 py-2 rounded-lg bg-success-teal/20 text-glossy-black hover:bg-success-teal/30 transition-all"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {/* Visual Question Bank Editor */}
            {useVisualEditor && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-glossy-black">
                    Question Bank ({formData.questions.length} questions)
                  </label>
                  <GlassmorphicButton
                    type="button"
                    variant="secondary"
                    onClick={addQuestion}
                  >
                    + Add Question
                  </GlassmorphicButton>
                </div>

                {formData.questions.map((question, qIndex) => (
                  <GlassmorphicCard key={qIndex} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-hot-pink">
                        Question {qIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-glossy-black mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(qIndex, 'text', e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink text-sm"
                        placeholder="Enter the question..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-glossy-black mb-1">
                          Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'type', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink text-sm"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-glossy-black mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(
                              qIndex,
                              'points',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-glossy-black mb-1">
                          Order
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={question.order}
                          onChange={(e) =>
                            updateQuestion(
                              qIndex,
                              'order',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink text-sm"
                        />
                      </div>
                    </div>

                    {/* Options for multiple choice */}
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-medium text-glossy-black">
                            Answer Options
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-xs text-success-teal hover:text-success-teal/80"
                          >
                            + Add Option
                          </button>
                        </div>

                        {question.options?.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className="flex items-center gap-2 bg-white/5 p-2 rounded"
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={option.isCorrect}
                              onChange={() => {
                                // Set all options to false first
                                question.options?.forEach((_, i) => {
                                  updateOption(qIndex, i, 'isCorrect', false);
                                });
                                // Then set this one to true
                                updateOption(qIndex, oIndex, 'isCorrect', true);
                              }}
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) =>
                                updateOption(qIndex, oIndex, 'text', e.target.value)
                              }
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 px-3 py-1 rounded glassmorphic-input focus:outline-none focus:ring-1 focus:ring-hot-pink text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="text-red-500 hover:text-red-700 text-xs px-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassmorphicCard>
                ))}

                {formData.questions.length === 0 && (
                  <div className="text-center py-8 text-steel-grey">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>
            )}

            {/* JSON Editor */}
            {!useVisualEditor && (
              <div>
                <label className="block text-sm font-medium text-glossy-black mb-2">
                  Questions (JSON)
                </label>
                <textarea
                  value={questionsJson}
                  onChange={(e) => setQuestionsJson(e.target.value)}
                  required
                  rows={16}
                  className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink font-mono text-sm"
                  placeholder="Enter exam questions as JSON..."
                />
                <p className="text-xs text-steel-grey mt-1">
                  Enter the exam questions as valid JSON. Each question should have
                  text, type, order, points, and options (for multiple choice).
                </p>
              </div>
            )}

            {/* Preview Section */}
            {showPreview && (
              <div className="border-t border-steel-grey/20 pt-6">
                <h3 className="text-xl font-bold text-hot-pink mb-4">
                  Exam Preview
                </h3>
                <GlassmorphicCard className="p-6 space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-glossy-black mb-2">
                      {formData.title || 'Untitled Exam'}
                    </h4>
                    <p className="text-steel-grey mb-4">
                      {formData.description || 'No description'}
                    </p>
                    <div className="flex gap-4 text-sm text-steel-grey">
                      <span>⏱️ Time Limit: {formData.timeLimit} minutes</span>
                      <span>📊 Passing Score: {formData.passingScore}%</span>
                      <span>❓ Questions: {formData.questions.length}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.questions.map((question, index) => (
                      <div
                        key={index}
                        className="bg-white/5 p-4 rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-glossy-black">
                            {index + 1}. {question.text || 'No question text'}
                          </p>
                          <span className="text-xs bg-hot-pink/20 text-hot-pink px-2 py-1 rounded">
                            {question.points} pts
                          </span>
                        </div>

                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2 pl-4">
                            {question.options?.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  option.isCorrect
                                    ? 'bg-success-teal/10 border border-success-teal/30'
                                    : 'bg-white/5'
                                }`}
                              >
                                <span className="w-6 h-6 rounded-full border-2 border-steel-grey flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + oIndex)}
                                </span>
                                <span className="text-sm">
                                  {option.text || `Option ${oIndex + 1}`}
                                </span>
                                {option.isCorrect && (
                                  <span className="ml-auto text-xs text-success-teal">
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'true_false' && (
                          <div className="flex gap-4 pl-4">
                            <div className="px-4 py-2 bg-white/5 rounded">True</div>
                            <div className="px-4 py-2 bg-white/5 rounded">False</div>
                          </div>
                        )}

                        {question.type === 'short_answer' && (
                          <div className="pl-4">
                            <div className="w-full h-20 bg-white/5 rounded border border-steel-grey/20 p-2 text-xs text-steel-grey">
                              Student answer will appear here...
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {formData.questions.length === 0 && (
                      <div className="text-center py-8 text-steel-grey">
                        No questions to preview
                      </div>
                    )}
                  </div>
                </GlassmorphicCard>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <GlassmorphicButton
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/courses/${courseId}`)}
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
                  ? 'Create Final Exam'
                  : 'Update Final Exam'}
              </GlassmorphicButton>
            </div>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminFinalExamEditPage;
