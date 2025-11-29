import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface FinalProjectFormData {
  title: string;
  description: string;
  instructions: string;
  requirements: any;
}

const AdminFinalProjectEditPage: React.FC = () => {
  const { courseId } = useParams<{
    courseId: string;
  }>();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [formData, setFormData] = useState<FinalProjectFormData>({
    title: '',
    description: '',
    instructions: '',
    requirements: {},
  });
  const [requirementsJson, setRequirementsJson] = useState('{}');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchFinalProject();
  }, [courseId]);

  const fetchFinalProject = async () => {
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

      if (data.data.finalProject) {
        const project = data.data.finalProject;
        setProjectId(project.id);
        setIsNew(false);
        setFormData({
          title: project.title,
          description: project.description,
          instructions: project.instructions,
          requirements: project.requirements,
        });
        setRequirementsJson(JSON.stringify(project.requirements, null, 2));
      } else {
        // No project exists, set up for new project
        setIsNew(true);
        const defaultRequirements = {
          deliverables: [
            'Completed project document',
            'Supporting materials',
          ],
          format: 'PDF or online submission',
          minPages: 5,
        };
        setRequirementsJson(JSON.stringify(defaultRequirements, null, 2));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load final project'
      );
      navigate(`/admin/courses/${courseId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON requirements
    try {
      const parsedRequirements = JSON.parse(requirementsJson);
      formData.requirements = parsedRequirements;
    } catch (error) {
      toast.error('Invalid JSON in requirements field');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const url = isNew
        ? `${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}/final-project`
        : `${import.meta.env.VITE_API_URL}/api/admin/final-projects/${projectId}`;

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
        throw new Error(data.error?.message || 'Failed to save final project');
      }

      toast.success(
        `Final project ${isNew ? 'created' : 'updated'} successfully`
      );
      navigate(`/admin/courses/${courseId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save final project'
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
            {isNew ? 'Create Final Project' : 'Edit Final Project'}
          </h1>
          <p className="text-steel-grey">
            {isNew
              ? 'Add a final project for this course'
              : 'Update final project details'}
          </p>
        </div>

        <GlassmorphicCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="e.g., Business Plan Development"
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
                placeholder="Brief overview of the final project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                required
                rows={8}
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="Detailed instructions for completing the project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glossy-black mb-2">
                Requirements (JSON)
              </label>
              <textarea
                value={requirementsJson}
                onChange={(e) => setRequirementsJson(e.target.value)}
                required
                rows={10}
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink font-mono text-sm"
                placeholder="Enter project requirements as JSON..."
              />
              <p className="text-xs text-steel-grey mt-1">
                Enter the project requirements as valid JSON (e.g., deliverables, format, minimum pages).
              </p>
            </div>

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
                  ? 'Create Final Project'
                  : 'Update Final Project'}
              </GlassmorphicButton>
            </div>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminFinalProjectEditPage;
