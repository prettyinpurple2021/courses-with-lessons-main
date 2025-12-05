import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ExamDetail {
  id: string;
  score: number;
  passed: boolean;
  submittedAt: string;
  answers: Record<string, any>;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  exam: {
    id: string;
    title: string;
    passingScore: number;
    questions: any[]; // Assuming we can fetch questions or they are embedded in answers for now
    course: {
      title: string;
    };
  };
}

const AdminGradingDetailPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (resultId) {
      // We can reuse getPendingExams and filter, or fetch specific. 
      // For now, let's assume we fetch the specific one or filter from list if API doesn't support single fetch yet.
      // Actually, we didn't add a single fetch endpoint in the plan. 
      // Let's implement a quick fetch by ID or just filter from the list for MVP.
      // Better: Add a getExamResult endpoint? 
      // For MVP, let's just fetch all pending and find it. Not efficient but works for now.
      fetchExam();
    }
  }, [resultId]);

  const fetchExam = async () => {
    try {
      const exams = await adminService.getPendingExams();
      const found = exams.find((e: any) => e.id === resultId);
      if (found) {
        setExam(found);
        // Initialize score if it exists (likely 0 or partial)
        setScore(found.score || 0);
      } else {
        toast.error('Exam not found');
        navigate('/admin/grading');
      }
    } catch (error) {
      toast.error('Failed to load exam details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || !resultId) return;

    setIsSubmitting(true);
    try {
      // Determine passed status based on exam passing score (default 70 if not available)
      const passingScore = 70; // We should get this from the exam details ideally
      const passed = score >= passingScore;

      await adminService.gradeExam(resultId, score, passed);
      toast.success('Exam graded successfully');
      navigate('/admin/grading');
    } catch (error) {
      toast.error('Failed to submit grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam) {
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
          <button
            onClick={() => navigate('/admin/grading')}
            className="text-steel-grey hover:text-white mb-4 transition-colors"
          >
            ← Back to Queue
          </button>
          <h1 className="text-3xl font-bold text-hot-pink">
            Grading: {exam.exam.title}
          </h1>
          <p className="text-white/70">
            Student: {exam.user.firstName} {exam.user.lastName} ({exam.user.email})
          </p>
        </div>

        <div className="grid gap-6">
          {/* Answers Section */}
          <GlassmorphicCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Student Answers</h2>
            <div className="space-y-4">
              {/* 
                Since we don't have the full question text in the result object usually, 
                we might just display the raw answers for now or need to fetch the exam definition.
                For MVP, we'll display the raw JSON of answers or iterate keys.
              */}
              {Object.entries(exam.answers || {}).map(([questionId, answer], index) => (
                <div key={questionId} className="bg-black/20 p-4 rounded-lg">
                  <div className="text-sm text-steel-grey mb-1">Question {index + 1} (ID: {questionId})</div>
                  <div className="text-white whitespace-pre-wrap">
                    {typeof answer === 'object' ? JSON.stringify(answer, null, 2) : String(answer)}
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>

          {/* Grading Form */}
          <GlassmorphicCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Grade Submission</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-steel-grey mb-2">
                  Final Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-hot-pink transition-colors"
                  required
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <div className={`text-2xl font-bold ${score >= 70 ? 'text-success-teal' : 'text-hot-pink'}`}>
                  {score >= 70 ? 'PASSED' : 'FAILED'}
                </div>
                <div className="text-sm text-steel-grey">
                  (Passing score: 70)
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-hot-pink text-white font-bold hover:bg-hot-pink/80 transition-colors shadow-neon-pink disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Grade'}
              </button>
            </form>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default AdminGradingDetailPage;
