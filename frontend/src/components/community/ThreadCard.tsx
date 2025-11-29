import React from 'react';
import { ForumThread } from '../../types/forum';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { formatDistanceToNow } from 'date-fns';

interface ThreadCardProps {
  thread: ForumThread;
  onClick: () => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onClick }) => {
  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <GlassmorphicCard
      variant="default"
      camoBackground
      className="p-4 hover:scale-[1.02] transition-transform duration-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Thread Title */}
          <div className="flex items-center gap-2 mb-2">
            {thread.isPinned && (
              <span className="text-hot-pink text-sm font-bold">📌 PINNED</span>
            )}
            {thread.isLocked && (
              <span className="text-steel-grey text-sm font-bold">🔒 LOCKED</span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2 hover:text-hot-pink transition-colors">
            {thread.title}
          </h3>

          {/* Author Info */}
          <div className="flex items-center gap-2 text-sm text-steel-grey mb-2">
            <div className="flex items-center gap-2">
              {thread.author.avatar ? (
                <img
                  src={thread.author.avatar}
                  alt={`${thread.author.firstName} ${thread.author.lastName}`}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-hot-pink flex items-center justify-center text-white text-xs font-bold">
                  {thread.author.firstName[0]}
                </div>
              )}
              <span className="text-white">
                {thread.author.firstName} {thread.author.lastName}
              </span>
            </div>
            <span>•</span>
            <span>{getTimeAgo(thread.createdAt)}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-steel-grey">
            <span>💬 {thread.postCount} {thread.postCount === 1 ? 'reply' : 'replies'}</span>
            {thread.lastPost && (
              <>
                <span>•</span>
                <span>
                  Last reply by {thread.lastPost.author.firstName}{' '}
                  {getTimeAgo(thread.lastPost.createdAt)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="text-hot-pink text-2xl">→</div>
      </div>
    </GlassmorphicCard>
  );
};

export default ThreadCard;
