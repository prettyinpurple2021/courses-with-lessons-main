import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import ThreadCard from '../components/community/ThreadCard';
import { getForumCategories, getThreads } from '../services/forumService';
import { ForumCategory, ForumThread } from '../types/forum';
import { useToast } from '../hooks/useToast';

const ForumPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadThreads();
  }, [selectedCategory, page]);

  const loadCategories = async () => {
    try {
      const data = await getForumCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load categories');
    }
  };

  const loadThreads = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (selectedCategory) filters.categoryId = selectedCategory;
      if (searchQuery) filters.search = searchQuery;

      const data = await getThreads(filters, page, 20);
      setThreads(data.threads);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load threads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadThreads();
  };

  const handleThreadClick = (threadId: string) => {
    navigate(`/community/threads/${threadId}`);
  };

  const handleCreateThread = () => {
    navigate('/community/threads/new');
  };

  return (
    <div className="min-h-screen camo-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Community Forum</h1>
          <p className="text-steel-grey">Connect, share, and learn with fellow entrepreneurs</p>
        </div>

        {/* Search and Create Thread */}
        <div className="mb-6 flex gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threads..."
              className="w-full bg-black/30 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors"
            />
          </form>
          <button
            onClick={handleCreateThread}
            className="px-6 py-3 bg-hot-pink text-white font-bold rounded-lg hover:bg-hot-pink/80 transition-all holographic-shimmer whitespace-nowrap"
          >
            + New Thread
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <GlassmorphicCard variant="default" className="p-4">
              <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-hot-pink text-white'
                      : 'text-steel-grey hover:bg-white/10'
                  }`}
                >
                  All Threads
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-hot-pink text-white'
                        : 'text-steel-grey hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-xs opacity-75">{category.threadCount} threads</div>
                  </button>
                ))}
              </div>
            </GlassmorphicCard>
          </div>

          {/* Threads List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center text-white py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hot-pink"></div>
                <p className="mt-4">Loading threads...</p>
              </div>
            ) : threads.length === 0 ? (
              <GlassmorphicCard variant="default" className="p-8 text-center">
                <p className="text-steel-grey text-lg">No threads found</p>
                <button
                  onClick={handleCreateThread}
                  className="mt-4 px-6 py-2 bg-hot-pink text-white font-bold rounded-lg hover:bg-hot-pink/80 transition-all"
                >
                  Start the conversation
                </button>
              </GlassmorphicCard>
            ) : (
              <>
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      onClick={() => handleThreadClick(thread.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-white">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
