import React from 'react';
import { Activity } from '../../types/activity';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface ActivityProgressIndicatorProps {
  activities: Activity[];
  currentActivityId?: string;
}

const ActivityProgressIndicator: React.FC<ActivityProgressIndicatorProps> = ({
  activities,
  currentActivityId,
}) => {
  const completedCount = activities.filter((a) => a.isCompleted).length;
  const totalCount = activities.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <GlassmorphicCard variant="default" className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Activity Progress</h3>
          <span className="text-white/80 font-semibold">
            {completedCount} / {totalCount} Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-hot-pink to-success-teal holographic"
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-success-teal font-semibold text-sm">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                activity.id === currentActivityId
                  ? 'bg-hot-pink/20 border-2 border-hot-pink/50'
                  : 'bg-white/5'
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {activity.isCompleted ? (
                  <CheckCircleIcon className="w-6 h-6 text-success-teal holographic-badge" />
                ) : activity.isLocked ? (
                  <LockClosedIcon className="w-6 h-6 text-white/40" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-hot-pink/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-hot-pink animate-pulse" />
                  </div>
                )}
              </div>

              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm font-semibold">
                    {activity.activityNumber}.
                  </span>
                  <span
                    className={`text-sm font-medium truncate ${
                      activity.isLocked ? 'text-white/40' : 'text-white'
                    }`}
                  >
                    {activity.title}
                  </span>
                </div>
              </div>

              {/* Type Badge */}
              <div className="flex-shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    activity.type === 'quiz'
                      ? 'bg-hot-pink/20 text-hot-pink'
                      : activity.type === 'exercise'
                      ? 'bg-success-teal/20 text-success-teal'
                      : activity.type === 'reflection'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {activity.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Completion Message */}
        {completedCount === totalCount && totalCount > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-success-teal/10 border-2 border-success-teal/30 rounded-lg text-center"
          >
            <CheckCircleIcon className="w-8 h-8 text-success-teal mx-auto mb-2 holographic-badge" />
            <p className="text-success-teal font-semibold">
              All activities completed! 🎉
            </p>
          </motion.div>
        )}
      </div>
    </GlassmorphicCard>
  );
};

export default ActivityProgressIndicator;
