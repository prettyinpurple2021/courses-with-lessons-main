import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface PendingExam {
  id: string;
  submittedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  exam: {
    id: string;
    title: string;
    course: {
      title: string;
    };
  };
}

const AdminGradingPage: React.FC = () => {
  const [exams, setExams] = useState<PendingExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchPendingExams();
  }, []);

  const fetchPendingExams = async () => {
    try {
      const data = await adminService.getPendingExams();
      setExams(data);
    } catch (error) {
      toast.error('Failed to load pending exams');
    } finally {
      setIsLoading(false);
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-hot-pink mb-2">
              Grading Queue
            </h1>
            <p className="text-steel-grey">
              Review and grade student submissions
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 rounded-lg glassmorphic text-white hover:bg-white/10 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {exams.length === 0 ? (
          <GlassmorphicCard className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              All Caught Up!
            </h2>
            <p className="text-steel-grey">
              There are no exams pending review at this time.
            </p>
          </GlassmorphicCard>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <GlassmorphicCard key={exam.id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-hot-pink/20 flex items-center justify-center text-xl font-bold text-hot-pink">
                      {exam.user.firstName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {exam.user.firstName} {exam.user.lastName}
                      </h3>
                      <p className="text-sm text-steel-grey">{exam.user.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 md:px-8">
                    <h4 className="text-lg font-semibold text-holographic-cyan">
                      {exam.exam.title}
                    </h4>
                    <p className="text-sm text-steel-grey">
                      {exam.exam.course.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <div className="text-sm text-steel-grey">Submitted</div>
                      <div className="text-white">
                        {new Date(exam.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/grading/${exam.id}`)}
                      className="px-6 py-2 rounded-lg bg-hot-pink text-white font-semibold hover:bg-hot-pink/80 transition-colors shadow-neon-pink"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGradingPage;
