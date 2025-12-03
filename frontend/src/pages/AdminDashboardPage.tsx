import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalActivities: number;
  activeEnrollments: number;
  completedCourses: number;
  recentUsers: number;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch stats');
      }

      setStats(data.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load dashboard'
      );
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-hot-pink mb-2">
            Admin Dashboard
          </h1>
          <p className="text-steel-grey">
            Welcome back, {user?.firstName || 'Admin'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassmorphicCard className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-hot-pink mb-2">
                {stats?.totalUsers || 0}
              </div>
              <div className="text-sm text-steel-grey">Total Students</div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-success-teal mb-2">
                {stats?.activeEnrollments || 0}
              </div>
              <div className="text-sm text-steel-grey">Active Enrollments</div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-holographic-cyan mb-2">
                {stats?.completedCourses || 0}
              </div>
              <div className="text-sm text-steel-grey">Completed Courses</div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-holographic-magenta mb-2">
                {stats?.recentUsers || 0}
              </div>
              <div className="text-sm text-steel-grey">New Users (7 days)</div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassmorphicCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-glossy-black mb-2">
                {stats?.totalCourses || 0}
              </div>
              <div className="text-sm text-steel-grey">Total Courses</div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-glossy-black mb-2">
                {stats?.totalLessons || 0}
              </div>
              <div className="text-sm text-steel-grey">Total Lessons</div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-glossy-black mb-2">
                {stats?.totalActivities || 0}
              </div>
              <div className="text-sm text-steel-grey">Total Activities</div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Quick Actions */}
        <GlassmorphicCard className="p-6">
          <h2 className="text-2xl font-bold text-glossy-black mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/courses')}
              className="p-4 rounded-lg glassmorphic hover:bg-hot-pink/10 transition-colors text-left"
            >
              <div className="text-lg font-semibold text-hot-pink mb-1">
                Manage Courses
              </div>
              <div className="text-sm text-steel-grey">
                Create and edit courses
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 rounded-lg glassmorphic hover:bg-hot-pink/10 transition-colors text-left"
            >
              <div className="text-lg font-semibold text-hot-pink mb-1">
                Manage Users
              </div>
              <div className="text-sm text-steel-grey">
                View and manage students
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/activities')}
              className="p-4 rounded-lg glassmorphic hover:bg-hot-pink/10 transition-colors text-left"
            >
              <div className="text-lg font-semibold text-hot-pink mb-1">
                Manage Activities
              </div>
              <div className="text-sm text-steel-grey">
                Create and edit activities
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/assessments')}
              className="p-4 rounded-lg glassmorphic hover:bg-hot-pink/10 transition-colors text-left"
            >
              <div className="text-lg font-semibold text-hot-pink mb-1">
                Manage Assessments
              </div>
              <div className="text-sm text-steel-grey">
                Create exams and projects
              </div>
            </button>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
