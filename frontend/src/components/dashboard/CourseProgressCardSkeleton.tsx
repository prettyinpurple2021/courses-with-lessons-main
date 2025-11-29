import React from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';
import SkeletonLoader from '../common/SkeletonLoader';

const CourseProgressCardSkeleton: React.FC = () => {
  return (
    <GlassmorphicCard variant="elevated" className="p-6">
      <div className="space-y-4">
        {/* Course title */}
        <SkeletonLoader variant="text" height="24px" width="70%" />
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <SkeletonLoader variant="text" height="14px" width="100px" />
            <SkeletonLoader variant="text" height="14px" width="40px" />
          </div>
          <SkeletonLoader variant="rectangle" height="8px" width="100%" className="rounded-full" />
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <SkeletonLoader variant="text" height="14px" width="80px" />
          <SkeletonLoader variant="text" height="14px" width="60px" />
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default CourseProgressCardSkeleton;
