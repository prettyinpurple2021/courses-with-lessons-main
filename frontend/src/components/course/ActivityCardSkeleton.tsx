import React from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';
import SkeletonLoader from '../common/SkeletonLoader';

const ActivityCardSkeleton: React.FC = () => {
  return (
    <GlassmorphicCard variant="default" className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Activity number and type badge */}
          <div className="flex items-center gap-3">
            <SkeletonLoader variant="text" height="16px" width="100px" />
            <SkeletonLoader variant="text" height="24px" width="80px" className="rounded-full" />
          </div>
          
          {/* Title */}
          <SkeletonLoader variant="text" height="24px" width="70%" />
          
          {/* Description */}
          <div className="space-y-2">
            <SkeletonLoader variant="text" height="14px" width="100%" />
            <SkeletonLoader variant="text" height="14px" width="85%" />
          </div>
        </div>

        {/* Status icon */}
        <div className="flex-shrink-0">
          <SkeletonLoader variant="circle" width="32px" height="32px" />
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default ActivityCardSkeleton;
