import React from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';
import SkeletonLoader from '../common/SkeletonLoader';

const CourseCardSkeleton: React.FC = () => {
  return (
    <GlassmorphicCard variant="elevated" className="h-full">
      <div className="flex flex-col h-full">
        {/* Thumbnail Skeleton */}
        <div className="relative w-full h-48 bg-gradient-to-br from-white/5 to-white/10 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" 
               style={{ animation: 'shimmer 2s infinite' }} />
        </div>
        
        {/* Content Skeleton */}
        <div className="p-6 flex-1 flex flex-col gap-4">
          {/* Title */}
          <SkeletonLoader variant="text" height="24px" width="80%" />
          
          {/* Description lines */}
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" height="14px" width="100%" />
            <SkeletonLoader variant="text" height="14px" width="90%" />
            <SkeletonLoader variant="text" height="14px" width="70%" />
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-10">
            <SkeletonLoader variant="text" height="14px" width="80px" />
            <SkeletonLoader variant="text" height="14px" width="60px" />
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default CourseCardSkeleton;
