import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { finalProjectService } from '../services/finalProjectService';
import { FinalProject } from '../types/finalProject';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';

const FinalProjectPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState<FinalProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  useEffect(() => {
    loadProject();
  }, [courseId]);

  const loadProject = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const data = await finalProjectService.getFinalProject(courseId);
      setProject(data);

      // Pre-fill if there's an existing submission
      if (data.submission) {
        setSubmissionText(data.submission.submission?.text || '');
        setSubmissionUrl(data.submission.submission?.url || '');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load final project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId || !project) return;

    if (!submissionText.trim() && !submissionUrl.trim()) {
      toast.error('Please provide either a description or a URL for your submission');
      return;
    }

    try {
      setSubmitting(true);
      await finalProjectService.submitFinalProject(courseId, {
        submission: {
          text: submissionText,
          url: submissionUrl,
          submittedAt: new Date().toISOString(),
        },
      });
      toast.success('Final project submitted successfully! Awaiting approval.');
      await loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white">Loading final project...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <div className="max-w-4xl mx-auto">
          <GlassmorphicCard>
            <div className="text-center text-white">
              <p className="text-xl mb-4">Final project not found</p>
              <GlassmorphicButton onClick={() => navigate(`/courses/${courseId}`)}>
                Back to Course
              </GlassmorphicButton>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  if (!project.isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
        <div className="max-w-4xl mx-auto">
          <GlassmorphicCard>
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-4">Final Project Locked</h2>
              <p className="mb-6">
                Complete all 12 lessons in this course to unlock the final project.
              </p>
              <GlassmorphicButton onClick={() => navigate(`/courses/${courseId}`)}>
                Back to Course
              </GlassmorphicButton>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <GlassmorphicCard holographicBorder>
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          <p className="text-white/80">{project.description}</p>
        </GlassmorphicCard>

        {/* Instructions */}
        <GlassmorphicCard>
          <h2 className="text-2xl font-bold text-white mb-4">Instructions</h2>
          <div className="text-white/90 whitespace-pre-wrap">{project.instructions}</div>
        </GlassmorphicCard>

        {/* Requirements */}
        {project.requirements && (
          <GlassmorphicCard>
            <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
            <div className="text-white/90">
              {Array.isArray(project.requirements) ? (
                <ul className="list-disc list-inside space-y-2">
                  {project.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              ) : (
                <div className="whitespace-pre-wrap">{JSON.stringify(project.requirements, null, 2)}</div>
              )}
            </div>
          </GlassmorphicCard>
        )}

        {/* Submission Status */}
        {project.submission && (
          <GlassmorphicCard
            className={
              project.submission.status === 'approved'
                ? 'border-2 border-success-teal'
                : project.submission.status === 'needs_revision'
                ? 'border-2 border-hot-pink'
                : 'border-2 border-holographic-yellow'
            }
          >
            <h2 className="text-2xl font-bold text-white mb-4">Submission Status</h2>
            <div className="space-y-2">
              <p className="text-white">
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={
                    project.submission.status === 'approved'
                      ? 'text-success-teal'
                      : project.submission.status === 'needs_revision'
                      ? 'text-hot-pink'
                      : 'text-holographic-yellow'
                  }
                >
                  {project.submission.status === 'approved'
                    ? '✓ Approved'
                    : project.submission.status === 'needs_revision'
                    ? '⚠ Needs Revision'
                    : '⏳ Pending Review'}
                </span>
              </p>
              <p className="text-white/80">
                Submitted: {new Date(project.submission.submittedAt).toLocaleString()}
              </p>
              {project.submission.feedback && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <p className="font-semibold text-white mb-2">Feedback:</p>
                  <p className="text-white/90">{project.submission.feedback}</p>
                </div>
              )}
            </div>
          </GlassmorphicCard>
        )}

        {/* Submission Form */}
        {(!project.submission || project.submission.status === 'needs_revision') && (
          <GlassmorphicCard>
            <h2 className="text-2xl font-bold text-white mb-4">
              {project.submission ? 'Resubmit Your Project' : 'Submit Your Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Project Description</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-hot-pink"
                  rows={6}
                  placeholder="Describe your project, what you built, and how it meets the requirements..."
                />
              </div>
              <div>
                <label className="block text-white mb-2">Project URL (optional)</label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-hot-pink"
                  placeholder="https://github.com/yourusername/project or https://yourproject.com"
                />
              </div>
              <div className="flex gap-4">
                <GlassmorphicButton type="submit" disabled={submitting} loading={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Project'}
                </GlassmorphicButton>
                <GlassmorphicButton
                  variant="secondary"
                  onClick={() => navigate(`/courses/${courseId}`)}
                >
                  Back to Course
                </GlassmorphicButton>
              </div>
            </form>
          </GlassmorphicCard>
        )}

        {/* Next Step */}
        {project.submission?.status === 'approved' && (
          <GlassmorphicCard holographicBorder>
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-4">Project Approved!</h2>
              <p className="text-white/90 mb-6">
                Congratulations! Your final project has been approved. You can now take the final exam.
              </p>
              <GlassmorphicButton onClick={() => navigate(`/courses/${courseId}/final-exam`)}>
                Take Final Exam
              </GlassmorphicButton>
            </div>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
};

export default FinalProjectPage;
