import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllCourses } from '../../services/courseService';
import QuickActionButton from './QuickActionButton';

export default function QuickActions() {
  const navigate = useNavigate();
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: getAllCourses,
  });

  // Find the current course (first enrolled, incomplete course)
  const currentCourse = courses?.find((c) => c.isEnrolled && !c.isCompleted);

  const handleContinueLearning = () => {
    if (currentCourse) {
      navigate(`/courses/${currentCourse.id}`);
    }
  };

  const handleBrowseCourses = () => {
    navigate('/dashboard');
    // This would switch to the courses tab, but for now just navigate to dashboard
  };

  const handleViewAchievements = () => {
    navigate('/dashboard');
    // This would switch to the achievements tab
  };

  const handleJoinCommunity = () => {
    navigate('/dashboard');
    // This would switch to the community tab
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Continue Learning */}
      {currentCourse && (
        <QuickActionButton
          icon="📚"
          title="Continue Learning"
          description={`Resume ${currentCourse.title}`}
          onClick={handleContinueLearning}
          variant="primary"
        />
      )}

      {/* Browse Courses */}
      <QuickActionButton
        icon="🔍"
        title="Browse Courses"
        description="Explore all available courses"
        onClick={handleBrowseCourses}
        variant="secondary"
      />

      {/* View Achievements */}
      <QuickActionButton
        icon="🏆"
        title="Achievements"
        description="View your earned badges"
        onClick={handleViewAchievements}
        variant="secondary"
      />

      {/* Join Community */}
      <QuickActionButton
        icon="👥"
        title="Community"
        description="Connect with other students"
        onClick={handleJoinCommunity}
        variant="secondary"
      />
    </div>
  );
}
