import React from 'react';
import { UserProfile, UserStatistics } from '../../types/profile';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { formatDistanceToNow } from 'date-fns';

interface ProfileHeaderProps {
  user: UserProfile;
  statistics: UserStatistics;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, statistics }) => {
  const getAchievementLevel = () => {
    const { coursesCompleted } = statistics;
    if (coursesCompleted >= 7) return { level: 7, title: 'Boss Commander', color: 'text-holographic-yellow' };
    if (coursesCompleted >= 5) return { level: 6, title: 'Elite Leader', color: 'text-holographic-magenta' };
    if (coursesCompleted >= 3) return { level: 5, title: 'Advanced Boss', color: 'text-holographic-cyan' };
    if (coursesCompleted >= 2) return { level: 4, title: 'Rising Star', color: 'text-success-teal' };
    if (coursesCompleted >= 1) return { level: 3, title: 'Course Conqueror', color: 'text-hot-pink' };
    return { level: 1, title: 'Recruit', color: 'text-steel-grey' };
  };

  const achievementLevel = getAchievementLevel();

  return (
    <GlassmorphicCard variant="elevated" className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-32 h-32 rounded-full border-4 border-hot-pink object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-hot-pink to-holographic-magenta flex items-center justify-center text-white text-5xl font-bold border-4 border-hot-pink">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          )}
          
          {/* Achievement Level Badge */}
          <div className="absolute -bottom-2 -right-2 glassmorphic-elevated rounded-full px-3 py-1 border-2 border-hot-pink">
            <span className={`text-sm font-bold ${achievementLevel.color}`}>
              Lvl {achievementLevel.level}
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {user.firstName} {user.lastName}
          </h1>
          
          <p className={`text-lg font-semibold mb-3 ${achievementLevel.color}`}>
            {achievementLevel.title}
          </p>

          {user.bio && (
            <p className="text-white/80 mb-4 max-w-2xl">{user.bio}</p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-steel-grey">
            <div className="flex items-center gap-2">
              <span className="text-hot-pink">📧</span>
              <span>{user.email}</span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-hot-pink">📅</span>
              <span>
                Member {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex md:flex-col gap-4 md:gap-2 text-center">
          <div className="glassmorphic rounded-lg p-3 min-w-[100px]">
            <div className="text-2xl font-bold text-hot-pink">{statistics.coursesCompleted}</div>
            <div className="text-xs text-white/70">Courses</div>
          </div>
          <div className="glassmorphic rounded-lg p-3 min-w-[100px]">
            <div className="text-2xl font-bold text-success-teal">{statistics.lessonsViewed}</div>
            <div className="text-xs text-white/70">Lessons</div>
          </div>
          <div className="glassmorphic rounded-lg p-3 min-w-[100px]">
            <div className="text-2xl font-bold text-holographic-cyan">{statistics.averageScore}%</div>
            <div className="text-xs text-white/70">Avg Score</div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default ProfileHeader;
