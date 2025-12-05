import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Skeleton Loader Component
 * 
 * Displays animated placeholder while content is loading
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  animate = true,
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-steel-grey/20 via-steel-grey/30 to-steel-grey/20';
  const animateClasses = animate ? 'animate-pulse' : '';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animateClasses} ${className}`}
      style={style}
      aria-busy="true"
      aria-label="Loading"
      {...props}
    />
  );
}

/**
 * Course Card Skeleton
 */
export function CourseCardSkeleton() {
  return (
    <div className="glassmorphic rounded-xl p-6 space-y-4" aria-busy="true">
      <Skeleton variant="rectangular" height={200} className="rounded-lg" />
      <Skeleton variant="text" height={24} width="70%" />
      <Skeleton variant="text" height={16} width="100%" />
      <Skeleton variant="text" height={16} width="90%" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rounded" height={32} width={80} />
        <Skeleton variant="rounded" height={32} width={80} />
      </div>
    </div>
  );
}

/**
 * Lesson Card Skeleton
 */
export function LessonCardSkeleton() {
  return (
    <div className="glassmorphic rounded-xl p-4 space-y-3" aria-busy="true">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={20} width="60%" />
          <Skeleton variant="text" height={16} width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} className="rounded-lg" />
      <div className="flex justify-between items-center">
        <Skeleton variant="text" height={16} width="30%" />
        <Skeleton variant="rounded" height={32} width={100} />
      </div>
    </div>
  );
}

/**
 * Activity Card Skeleton
 */
export function ActivityCardSkeleton() {
  return (
    <div className="glassmorphic rounded-xl p-6 space-y-4" aria-busy="true">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" height={20} width="50%" />
        </div>
      </div>
      <Skeleton variant="text" height={16} width="100%" />
      <Skeleton variant="text" height={16} width="80%" />
      <Skeleton variant="rounded" height={40} width="100%" />
    </div>
  );
}

/**
 * Profile Skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="glassmorphic rounded-xl p-6 space-y-6" aria-busy="true">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={24} width="40%" />
          <Skeleton variant="text" height={16} width="60%" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" height={20} width="30%" />
        <Skeleton variant="rectangular" height={100} className="rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton variant="rounded" height={80} />
        <Skeleton variant="rounded" height={80} />
        <Skeleton variant="rounded" height={80} />
      </div>
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-busy="true">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glassmorphic rounded-xl p-6 space-y-3">
          <Skeleton variant="text" height={16} width="60%" />
          <Skeleton variant="text" height={32} width="40%" />
          <Skeleton variant="text" height={14} width="50%" />
        </div>
      ))}
    </div>
  );
}

/**
 * Forum Thread Skeleton
 */
export function ForumThreadSkeleton() {
  return (
    <div className="glassmorphic rounded-xl p-6 space-y-4" aria-busy="true">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={20} width="70%" />
          <Skeleton variant="text" height={14} width="40%" />
        </div>
      </div>
      <Skeleton variant="text" height={16} width="100%" />
      <Skeleton variant="text" height={16} width="90%" />
      <div className="flex gap-4 pt-2">
        <Skeleton variant="text" height={14} width={60} />
        <Skeleton variant="text" height={14} width={80} />
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-steel-grey/20" aria-busy="true">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton variant="text" height={16} width="80%" />
        </td>
      ))}
    </tr>
  );
}

/**
 * List Skeleton
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="glassmorphic rounded-lg p-4 space-y-2">
          <Skeleton variant="text" height={20} width="60%" />
          <Skeleton variant="text" height={16} width="80%" />
        </div>
      ))}
    </div>
  );
}

/**
 * Page Skeleton - Full page loading state
 */
export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8" aria-busy="true">
      <div className="space-y-4">
        <Skeleton variant="text" height={40} width="40%" />
        <Skeleton variant="text" height={20} width="60%" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
      </div>
    </div>
  );
}
