import React, { useState } from 'react';
import { Activity, QuizContent, QuizResponse } from '../../types/activity';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';

interface QuizActivityProps {
  activity: Activity;
  onSubmit: (response: QuizResponse) => Promise<void>;
  isSubmitting: boolean;
}

interface QuestionFeedback {
  questionNumber: number;
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
}

const QuizActivity: React.FC<QuizActivityProps> = ({ activity, onSubmit, isSubmitting }) => {
  const content = activity.content as QuizContent;
  const [answers, setAnswers] = useState<number[]>(
    activity.submission?.response?.answers || new Array(content.questions.length).fill(-1)
  );

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some((answer) => answer === -1)) {
      alert('Please answer all questions before submitting.');
      return;
    }
    await onSubmit({ answers });
  };

  const isAllAnswered = answers.every((answer) => answer !== -1);

  // Parse feedback to extract per-question feedback
  const parseFeedback = (feedback: string): { summary: string; questionFeedbacks: QuestionFeedback[] } => {
    // Helper function to unescape special characters
    const unescapeFeedback = (text: string): string => {
      return text
        .replace(/\\n/g, '\n')   // Unescape newlines
        .replace(/\\"/g, '"')    // Unescape quotes
        .replace(/\\\\/g, '\\'); // Unescape backslashes (must be last)
    };

    // Split using the unique separator
    const QUESTION_SEPARATOR = '\n\n---QUESTION---\n\n';
    const parts = feedback.split(QUESTION_SEPARATOR);
    const summary = parts[0] || '';
    const questionFeedbacks: QuestionFeedback[] = [];

    parts.slice(1).forEach((line) => {
      // Match the question pattern - now explanation can contain escaped characters
      // Use [\s\S] instead of . to match any character including newlines (more compatible)
      const match = line.match(/Question (\d+): (✓|✗) ([\s\S]+)/);
      if (match) {
        const questionNumber = parseInt(match[1]);
        const isCorrect = match[2] === '✓';
        let explanation = match[3];

        // Extract correct answer if present - handle escaped quotes and newlines
        // Match: The correct answer is "..." where ... can contain escaped characters
        const correctAnswerMatch = explanation.match(/The correct answer is "((?:[^"\\]|\\.)*)"/);
        const correctAnswer = correctAnswerMatch 
          ? unescapeFeedback(correctAnswerMatch[1]) // Unescape all special characters
          : undefined;
        
        // Remove the "The correct answer is..." part from explanation
        if (correctAnswerMatch) {
          // Remove everything from "The correct answer is" to the end
          explanation = explanation.replace(/ The correct answer is "(?:[^"\\]|\\.)*"\.?\s*$/, '').trim();
        }

        // Unescape the explanation text
        explanation = unescapeFeedback(explanation);

        questionFeedbacks.push({
          questionNumber,
          isCorrect,
          explanation: explanation.trim(),
          correctAnswer,
        });
      }
    });

    return { summary, questionFeedbacks };
  };

  const feedbackData = activity.submission?.feedback
    ? parseFeedback(activity.submission.feedback)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{activity.title}</h2>
        <p className="text-white/80">{activity.description}</p>
      </div>

      <div className="space-y-4">
        {content.questions.map((question, qIndex) => {
          const questionFeedback = feedbackData?.questionFeedbacks.find(
            (qf) => qf.questionNumber === qIndex + 1
          );
          const userAnswer = answers[qIndex];
          const showFeedback = activity.isCompleted && questionFeedback;

          return (
            <GlassmorphicCard
              key={question.id}
              variant="default"
              className={`p-6 ${
                showFeedback
                  ? questionFeedback.isCorrect
                    ? 'bg-success-teal/10 border-success-teal/30'
                    : 'bg-red-500/10 border-red-500/30'
                  : ''
              }`}
            >
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-hot-pink font-semibold">Question {qIndex + 1}</span>
                  {showFeedback && (
                    <span
                      className={`text-xl font-bold ${
                        questionFeedback.isCorrect ? 'text-success-teal' : 'text-red-500'
                      }`}
                    >
                      {questionFeedback.isCorrect ? '✓' : '✗'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mt-2">{question.text}</h3>
              </div>

              <div className="space-y-3">
                {question.options.map((option, oIndex) => {
                  const isSelected = userAnswer === oIndex;
                  const isCorrectOption = oIndex === question.correctAnswer;
                  const showCorrectIndicator = activity.isCompleted && isCorrectOption;

                  return (
                    <label
                      key={oIndex}
                      className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? showFeedback && !questionFeedback.isCorrect
                            ? 'bg-red-500/20 border-2 border-red-500/50'
                            : showFeedback && questionFeedback.isCorrect
                            ? 'bg-success-teal/20 border-2 border-success-teal/50'
                            : 'bg-hot-pink/20 border-2 border-hot-pink/50'
                          : showCorrectIndicator
                          ? 'bg-success-teal/10 border-2 border-success-teal/30'
                          : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                      } ${activity.isCompleted ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={oIndex}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(qIndex, oIndex)}
                        disabled={activity.isCompleted}
                        className="w-5 h-5 text-hot-pink focus:ring-hot-pink/50"
                      />
                      <span className="text-white flex-1">{option}</span>
                      {showCorrectIndicator && (
                        <span className="text-success-teal font-bold">✓ Correct</span>
                      )}
                    </label>
                  );
                })}
              </div>

              {showFeedback && questionFeedback.explanation && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {questionFeedback.explanation}
                  </p>
                </div>
              )}
            </GlassmorphicCard>
          );
        })}
      </div>

      {!activity.isCompleted && (
        <div className="flex justify-end">
          <GlassmorphicButton
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!isAllAnswered || isSubmitting}
            loading={isSubmitting}
          >
            Submit Quiz
          </GlassmorphicButton>
        </div>
      )}

      {activity.submission?.feedback && feedbackData && (
        <GlassmorphicCard variant="elevated" className="p-6 bg-success-teal/10 border-success-teal/30">
          <h4 className="text-success-teal font-semibold mb-4 text-xl">Quiz Results</h4>
          <div className="mb-4 p-4 bg-white/5 rounded-lg">
            <p className="text-white font-semibold text-lg">{feedbackData.summary}</p>
          </div>
          {feedbackData.questionFeedbacks.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-white font-semibold mb-3">Question-by-Question Review:</h5>
              {feedbackData.questionFeedbacks.map((qf) => (
                <div
                  key={qf.questionNumber}
                  className={`p-4 rounded-lg border ${
                    qf.isCorrect
                      ? 'bg-success-teal/10 border-success-teal/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className={`text-xl font-bold ${
                        qf.isCorrect ? 'text-success-teal' : 'text-red-500'
                      }`}
                    >
                      {qf.isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        Question {qf.questionNumber}: {qf.isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      {qf.explanation && (
                        <p className="text-white/80 text-sm mt-1">{qf.explanation}</p>
                      )}
                      {qf.correctAnswer && (
                        <p className="text-success-teal text-sm mt-2 font-semibold">
                          Correct answer: {qf.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassmorphicCard>
      )}
    </div>
  );
};

export default QuizActivity;
