import { ReactNode } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import GlassmorphicButton from './GlassmorphicButton';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

/**
 * Empty State Component
 * 
 * Displays a user-friendly message when there's no data to show
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <GlassmorphicCard className={`text-center py-12 px-6 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-6">
          <div className="text-6xl text-steel-grey/50">
            {icon}
          </div>
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-glossy-black mb-3">
        {title}
      </h3>
      
      <p className="text-steel-grey text-lg mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actionLabel && onAction && (
            <GlassmorphicButton
              onClick={onAction}
              className="bg-hot-pink hover:bg-hot-pink/90 text-white"
              aria-label={actionLabel}
            >
              {actionLabel}
            </GlassmorphicButton>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <GlassmorphicButton
              onClick={onSecondaryAction}
              variant="outline"
              aria-label={secondaryActionLabel}
            >
              {secondaryActionLabel}
            </GlassmorphicButton>
          )}
        </div>
      )}
    </GlassmorphicCard>
  );
}

// Pre-configured empty states for common scenarios

export function NoCoursesEnrolled({ onBrowseCourses }: { onBrowseCourses?: () => void }) {
  return (
    <EmptyState
      icon="📚"
      title="No Courses Yet"
      description="You haven't enrolled in any courses. Start your entrepreneurship journey today!"
      actionLabel="Browse Courses"
      onAction={onBrowseCourses}
    />
  );
}

export function NoLessonsCompleted() {
  return (
    <EmptyState
      icon="🎯"
      title="No Lessons Completed"
      description="Complete your first lesson to see your progress here."
    />
  );
}

export function NoActivities() {
  return (
    <EmptyState
      icon="✏️"
      title="No Activities Available"
      description="This lesson doesn't have any activities yet. Check back later or continue with the video content."
    />
  );
}

export function NoForumPosts({ onCreateThread }: { onCreateThread?: () => void }) {
  return (
    <EmptyState
      icon="💬"
      title="No Posts Yet"
      description="Be the first to start a conversation in this community!"
      actionLabel="Create Thread"
      onAction={onCreateThread}
    />
  );
}

export function NoAchievements() {
  return (
    <EmptyState
      icon="🏆"
      title="No Achievements Yet"
      description="Complete lessons and courses to earn achievements and showcase your progress!"
    />
  );
}

export function NoSearchResults({ query, onClearSearch }: { query?: string; onClearSearch?: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      description={query ? `No results found for "${query}". Try different keywords or clear your search.` : "No results found. Try adjusting your search criteria."}
      actionLabel={onClearSearch ? "Clear Search" : undefined}
      onAction={onClearSearch}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon="🔔"
      title="No Notifications"
      description="You're all caught up! We'll notify you when there's something new."
    />
  );
}

export function NoNotes({ onCreateNote }: { onCreateNote?: () => void }) {
  return (
    <EmptyState
      icon="📝"
      title="No Notes Yet"
      description="Start taking notes to remember important points from your lessons."
      actionLabel="Create Note"
      onAction={onCreateNote}
    />
  );
}

export function NoResources() {
  return (
    <EmptyState
      icon="📄"
      title="No Resources Available"
      description="There are no downloadable resources for this lesson yet. Check back later!"
    />
  );
}

export function NoCertificates({ onBrowseCourses }: { onBrowseCourses?: () => void }) {
  return (
    <EmptyState
      icon="🎓"
      title="No Certificates Earned"
      description="Complete courses and pass final exams to earn certificates!"
      actionLabel="View Courses"
      onAction={onBrowseCourses}
    />
  );
}

