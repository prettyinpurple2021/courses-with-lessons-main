import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import PostComposer from '../components/community/PostComposer';
import { getThreadById, createReply } from '../services/forumService';
import { ThreadWithPosts, ForumPost } from '../types/forum';
import { useToast } from '../hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

const ThreadDetailPage: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [threadData, setThreadData] = useState<ThreadWithPosts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (threadId) {
      loadThread();
    }
  }, [threadId]);

  const loadThread = async () => {
    if (!threadId) return;

    setIsLoading(true);
    try {
      const data = await getThreadById(threadId);
      setThreadData(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load thread');
      navigate('/community');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (content: string) => {
    if (!threadId) return;

    await createReply(threadId, content);
    toast.success('Reply posted successfully');
    loadThread(); // Reload thread to show new reply
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400';
      case 'epic':
        return 'text-purple-400';
      case 'rare':
        return 'text-blue-400';
      default:
        return 'text-steel-grey';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen camo-background flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hot-pink"></div>
          <p className="mt-4">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!threadData) {
    return null;
  }

  const { thread, posts } = threadData;

  return (
    <div className="min-h-screen camo-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community')}
          className="mb-6 text-hot-pink hover:text-hot-pink/80 transition-colors flex items-center gap-2"
        >
          ← Back to Forum
        </button>

        {/* Thread Header */}
        <GlassmorphicCard variant="elevated" className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            {thread.isPinned && (
              <span className="text-hot-pink text-sm font-bold">📌 PINNED</span>
            )}
            {thread.isLocked && (
              <span className="text-steel-grey text-sm font-bold">🔒 LOCKED</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{thread.title}</h1>

          <div className="flex items-center gap-3 text-sm text-steel-grey">
            <div className="flex items-center gap-2">
              {thread.author.avatar ? (
                <img
                  src={thread.author.avatar}
                  alt={`${thread.author.firstName} ${thread.author.lastName}`}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-hot-pink flex items-center justify-center text-white text-sm font-bold">
                  {thread.author.firstName[0]}
                </div>
              )}
              <span className="text-white font-semibold">
                {thread.author.firstName} {thread.author.lastName}
              </span>
            </div>
            <span>•</span>
            <span>{getTimeAgo(thread.createdAt)}</span>
            <span>•</span>
            <span>💬 {thread.postCount} {thread.postCount === 1 ? 'reply' : 'replies'}</span>
          </div>
        </GlassmorphicCard>

        {/* Posts */}
        <div className="space-y-4 mb-6">
          {posts.map((post: ForumPost, index: number) => (
            <GlassmorphicCard key={post.id} variant="default" camoBackground className="p-6">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={`${post.author.firstName} ${post.author.lastName}`}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-hot-pink flex items-center justify-center text-white font-bold">
                      {post.author.firstName[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold">
                      {post.author.firstName} {post.author.lastName}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-hot-pink text-white px-2 py-0.5 rounded">
                        AUTHOR
                      </span>
                    )}
                  </div>

                  {/* Achievements */}
                  {post.author.achievements.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      {post.author.achievements.map((achievement, idx) => (
                        <span
                          key={idx}
                          className={`text-xs ${getRarityColor(achievement.rarity)}`}
                          title={achievement.title}
                        >
                          {achievement.icon}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-steel-grey">
                    {getTimeAgo(post.createdAt)}
                    {post.createdAt !== post.updatedAt && ' (edited)'}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="text-white whitespace-pre-wrap">{post.content}</div>
            </GlassmorphicCard>
          ))}
        </div>

        {/* Reply Composer */}
        {!thread.isLocked ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Post a Reply</h2>
            <PostComposer
              onSubmit={handleReply}
              placeholder="Write your reply..."
              submitButtonText="Post Reply"
              isReply
            />
          </div>
        ) : (
          <GlassmorphicCard variant="default" className="p-6 text-center">
            <p className="text-steel-grey">
              🔒 This thread is locked and cannot accept new replies
            </p>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
};

export default ThreadDetailPage;
