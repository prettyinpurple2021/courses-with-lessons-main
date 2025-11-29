import React from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';
import SkeletonLoader from '../common/SkeletonLoader';

interface LessonListSkeletonProps {
  count?: number;
}

const LessonListSkeleton: React.FC<LessonListSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <GlassmorphicCard key={index} variant="default" className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - lesson info */}
            <div className="flex items-center gap-4 flex-1">
              {/* Lesson number circle */}
              <SkeletonLoader variant="circle" width="48px" height="48px" />
              
              {/* Lesson details */}
              <div className="flex-1 space-y-2">
                <SkeletonLoader variant="text" height="20px" width="60%" />
                <SkeletonLoader variant="text" height="14px" width="40%" />
              </div>
            </div>

            {/* Right side - status */}
            <div className="flex items-center gap-3">
              <SkeletonLoader variant="text" height="14px" width="80px" />
              <SkeletonLoader variant="circle" width="24px" height="24px" />
            </div>
          </div>
        </GlassmorphicCard>
      ))}
    </div>
  );
};

export default LessonListSkeleton;
