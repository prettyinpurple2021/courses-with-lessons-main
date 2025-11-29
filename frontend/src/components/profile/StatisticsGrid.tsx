import React from 'react';
import { UserStatistics } from '../../types/profile';
import GlassmorphicCard from '../common/GlassmorphicCard';

interface StatisticsGridProps {
  statistics: UserStatistics;
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({ statistics }) => {
  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const stats = [
    {
      icon: '🎓',
      label: 'Courses Completed',
      value: statistics.coursesCompleted,
      color: 'from-hot-pink to-holographic-magenta',
      description: 'Total courses finished',
    },
    {
      icon: '📚',
      label: 'Lessons Viewed',
      value: statistics.lessonsViewed,
      color: 'from-success-teal to-holographic-cyan',
      description: 'Lessons completed',
    },
    {
      icon: '✅',
      label: 'Activities Completed',
      value: statistics.activitiesCompleted,
      color: 'from-holographic-cyan to-holographic-magenta',
      description: 'Interactive activities done',
    },
    {
      icon: '⭐',
      label: 'Average Score',
      value: `${statistics.averageScore}%`,
      color: 'from-holographic-yellow to-hot-pink',
      description: 'Exam performance',
    },
    {
      icon: '⏱️',
      label: 'Study Time',
      value: formatStudyTime(statistics.totalStudyTime),
      color: 'from-holographic-magenta to-hot-pink',
      description: 'Total learning time',
    },
    {
      icon: '🔥',
      label: 'Current Streak',
      value: `${statistics.currentStreak} days`,
      color: 'from-hot-pink to-holographic-yellow',
      description: 'Consecutive learning days',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <GlassmorphicCard
          key={index}
          variant="elevated"
          className="p-6 hover:scale-105 transition-transform duration-300"
          holographicBorder
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="text-4xl">{stat.icon}</div>

            {/* Content */}
            <div className="flex-1">
              <div className="text-white/70 text-sm mb-1">{stat.label}</div>
              <div
                className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
              >
                {stat.value}
              </div>
              <div className="text-white/50 text-xs">{stat.description}</div>
            </div>
          </div>

          {/* Holographic effect on hover */}
          <div className="absolute inset-0 holographic opacity-0 hover:opacity-20 rounded-lg pointer-events-none transition-opacity duration-300" />
        </GlassmorphicCard>
      ))}
    </div>
  );
};

export default StatisticsGrid;
