import React from 'react';
import { Activity } from '../../types/activity';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const getActivityTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      quiz: 'Quiz',
      exercise: 'Exercise',
      reflection: 'Reflection',
      practical_task: 'Practical Task',
    };
    return labels[type] || type;
  };

  const getActivityTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      quiz: 'bg-hot-pink/20 text-hot-pink',
      exercise: 'bg-success-teal/20 text-success-teal',
      reflection: 'bg-purple-500/20 text-purple-400',
      practical_task: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[type] || 'bg-white/20 text-white';
  };

  return (
    <GlassmorphicCard
      variant="default"
      className={`p-6 ${activity.isLocked ? 'opacity-60' : ''} ${!activity.isLocked && onClick ? 'hover:scale-[1.02]' : ''} transition-all duration-300`}
      onClick={!activity.isLocked ? onClick : undefined}
      holographicBorder={activity.isCompleted}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-white/70 font-semibold">
              Activity {activity.activityNumber}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActivityTypeColor(activity.type)}`}>
              {getActivityTypeLabel(activity.type)}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            {activity.title}
          </h3>
          
          <p className="text-white/80 text-sm">
            {activity.description}
          </p>

          {activity.submission?.feedback && (
            <div className="mt-3 p-3 bg-success-teal/10 border border-success-teal/30 rounded-lg">
              <p className="text-success-teal text-sm">
                {activity.submission.feedback}
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {activity.isCompleted ? (
            <div className="holographic-badge">
              <CheckCircleIcon className="w-8 h-8 text-success-teal" />
            </div>
          ) : activity.isLocked ? (
            <LockClosedIcon className="w-8 h-8 text-white/40" />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-white/30" />
          )}
        </div>
      </div>

      {activity.isLocked && (
        <div className="mt-4 text-white/60 text-sm flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4" />
          <span>Complete previous activities to unlock</span>
        </div>
      )}
    </GlassmorphicCard>
  );
};

export default ActivityCard;
