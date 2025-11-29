import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { finalExamService } from '../services/finalExamService';
import { FinalExam, ExamQuestion } from '../types/finalExam';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import CelebrationAnimation from '../components/common/CelebrationAnimation';

const FinalExamPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [exam, setExam] = useState<FinalExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadExam();
  }, [courseId]);

  useEffect(() => {
    if (examStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [examStarted, timeRemaining]);

  const loadExam = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const data = await finalExamService.getFinalExam(courseId);
      setExam(data);

      // If there's already a result, show it
      if (data.result) {
        setShowResults(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load final exam');
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (exam) {
      setExamStarted(true);
      setTimeRemaining(exam.timeLimit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleAutoSubmit = async () => {
    toast.info('Time is up! Submitting your exam...');
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!courseId || !exam) return;

    try {
      setSubmitting(true);
      const result = await finalExamService.submitFinalExam(courseId, { answers });
      
      if (result.passed) {
        toast.success('Congratulations! You passed the final exam!');
        setShowCelebration(true);
      } else {
        toast.error('You did not pass this time. You can retake the exam.');
      }
      
      setShowResults(true);
      await loadExam();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white">Loading final exam...</div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <div className="max-w-4xl mx-auto">
          <GlassmorphicCard>
            <div className="text-center text-white">
              <p className="text-xl mb-4">Final exam not found</p>
              <GlassmorphicButton onClick={() => navigate(`/courses/${courseId}`)}>
                Back to Course
              </GlassmorphicButton>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  if (!exam.isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <div className="max-w-4xl mx-auto">
          <GlassmorphicCard>
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-4">Final Exam Locked</h2>
              <p className="mb-6">
                Complete and get approval for the final project to unlock the final exam.
              </p>
              <GlassmorphicButton onClick={() => navigate(`/courses/${courseId}/final-project`)}>
                Go to Final Project
              </GlassmorphicButton>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  // Show results if exam has been taken
  if (showResults && exam.result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <CelebrationAnimation show={showCelebration} onComplete={() => setShowCelebration(false)} />
        <div className="max-w-4xl mx-auto space-y-6">
          <GlassmorphicCard
            holographicBorder
            className={exam.result.passed ? 'border-success-teal' : 'border-hot-pink'}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{exam.result.passed ? '🎉' : '📚'}</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {exam.result.passed ? 'Congratulations!' : 'Keep Trying!'}
              </h2>
              <p className="text-2xl text-white mb-2">
                Your Score: <span className="font-bold">{exam.result.score}%</span>
              </p>
              <p className="text-white/80 mb-6">
                Passing Score: {exam.passingScore}%
              </p>
              {exam.result.passed ? (
                <div className="space-y-4">
                  <p className="text-white text-lg">
                    You've successfully completed this course! The next course has been unlocked.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <GlassmorphicButton onClick={() => navigate('/dashboard')}>
                      Go to Dashboard
                    </GlassmorphicButton>
                    <GlassmorphicButton
                      variant="secondary"
                      onClick={() => navigate(`/courses/${courseId}`)}
                    >
                      View Course
                    </GlassmorphicButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white text-lg">
                    Don't give up! Review the course materials and try again.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <GlassmorphicButton onClick={() => {
                      setShowResults(false);
                      setExamStarted(false);
                      setAnswers({});
                    }}>
                      Retake Exam
                    </GlassmorphicButton>
                    <GlassmorphicButton
                      variant="secondary"
                      onClick={() => navigate(`/courses/${courseId}`)}
                    >
                      Review Course
                    </GlassmorphicButton>
                  </div>
                </div>
              )}
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  // Show exam start screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <GlassmorphicCard holographicBorder>
            <h1 className="text-3xl font-bold text-white mb-2">{exam.title}</h1>
            <p className="text-white/80">{exam.description}</p>
          </GlassmorphicCard>

          <GlassmorphicCard>
            <h2 className="text-2xl font-bold text-white mb-4">Exam Information</h2>
            <div className="space-y-3 text-white">
              <p>
                <span className="font-semibold">Questions:</span> {exam.questions.length}
              </p>
              <p>
                <span className="font-semibold">Time Limit:</span> {exam.timeLimit} minutes
              </p>
              <p>
                <span className="font-semibold">Passing Score:</span> {exam.passingScore}%
              </p>
              <div className="mt-6 p-4 bg-hot-pink/20 rounded-lg border border-hot-pink/50">
                <p className="font-semibold mb-2">⚠️ Important:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Once you start, the timer will begin and cannot be paused</li>
                  <li>Your exam will auto-submit when time runs out</li>
                  <li>You can retake the exam if you don't pass</li>
                  <li>Make sure you have a stable internet connection</li>
                </ul>
              </div>
            </div>
          </GlassmorphicCard>

          <div className="flex gap-4 justify-center">
            <GlassmorphicButton onClick={startExam} size="lg">
              Start Exam
            </GlassmorphicButton>
            <GlassmorphicButton
              variant="secondary"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              Back to Course
            </GlassmorphicButton>
          </div>
        </div>
      </div>
    );
  }

  // Show exam questions
  return (
    <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Timer */}
        <GlassmorphicCard
          holographicBorder
          className={timeRemaining !== null && timeRemaining < 300 ? 'border-hot-pink animate-pulse' : ''}
        >
          <div className="text-center">
            <p className="text-white/80 text-sm mb-1">Time Remaining</p>
            <p className="text-4xl font-bold text-white">
              {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
            </p>
          </div>
        </GlassmorphicCard>

        {/* Questions */}
        {exam.questions.map((question: ExamQuestion, index: number) => (
          <GlassmorphicCard key={question.id}>
            <div className="mb-4">
              <p className="text-white/60 text-sm mb-2">
                Question {index + 1} of {exam.questions.length} ({question.points} points)
              </p>
              <p className="text-white text-lg font-semibold">{question.text}</p>
            </div>

            <div className="space-y-3">
              {question.type === 'multiple_choice' || question.type === 'true_false' ? (
                question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center p-4 bg-white/5 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => handleAnswerChange(question.id, option.id)}
                      className="mr-3"
                    />
                    <span className="text-white">{option.text}</span>
                  </label>
                ))
              ) : question.type === 'short_answer' ? (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-hot-pink"
                  rows={4}
                  placeholder="Type your answer here..."
                />
              ) : null}
            </div>
          </GlassmorphicCard>
        ))}

        {/* Submit Button */}
        <GlassmorphicCard>
          <div className="flex gap-4 justify-center">
            <GlassmorphicButton
              onClick={handleSubmit}
              disabled={submitting}
              loading={submitting}
              size="lg"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </GlassmorphicButton>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default FinalExamPage;
