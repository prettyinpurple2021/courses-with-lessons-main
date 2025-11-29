import { useState } from 'react';
import { DashboardTab } from '../types/dashboard';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardNav from '../components/dashboard/DashboardNav';
import CourseProgressGrid from '../components/dashboard/CourseProgressGrid';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import AchievementShowcase from '../components/dashboard/AchievementShowcase';
import CamoBackground from '../components/common/CamoBackground';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
              <QuickActions />
            </section>

            {/* Course Progress Section */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">My Courses</h2>
              <CourseProgressGrid />
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
              <RecentActivity />
            </section>
          </div>
        );
      case 'courses':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">All Courses</h2>
              <CourseProgressGrid />
            </section>
          </div>
        );
      case 'achievements':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Achievements</h2>
              <AchievementShowcase />
            </section>
          </div>
        );
      case 'community':
        return (
          <div className="space-y-6">
            <div className="glassmorphic rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Community</h2>
              <p className="text-white/70">
                This section will display community features and forums.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Camo Background */}
      <CamoBackground variant="subtle" className="fixed inset-0 -z-10" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header with User Info */}
        <DashboardHeader achievementLevel={1} />

        {/* Navigation Tabs */}
        <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
