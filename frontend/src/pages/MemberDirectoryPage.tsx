import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import { getMembers } from '../services/forumService';
import { MemberProfile } from '../types/forum';
import { useToast } from '../hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

const MemberDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMembers();
  }, [page]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await getMembers(searchQuery, page, 24);
      setMembers(data.members);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMembers();
  };

  const handleMemberClick = (memberId: string) => {
    navigate(`/community/members/${memberId}`);
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

  return (
    <div className="min-h-screen camo-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Member Directory</h1>
          <p className="text-steel-grey">Connect with fellow entrepreneurs in the community</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by name..."
              className="w-full bg-black/30 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors"
            />
          </form>
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="text-center text-white py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hot-pink"></div>
            <p className="mt-4">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <GlassmorphicCard variant="default" className="p-8 text-center">
            <p className="text-steel-grey text-lg">No members found</p>
          </GlassmorphicCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member) => (
                <GlassmorphicCard
                  key={member.id}
                  variant="default"
                  className="p-6 hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                  onClick={() => handleMemberClick(member.id)}
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-24 h-24 rounded-full border-4 border-hot-pink"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-hot-pink flex items-center justify-center text-white text-3xl font-bold border-4 border-hot-pink">
                        {member.firstName[0]}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    {member.firstName} {member.lastName}
                  </h3>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-steel-grey text-sm text-center mb-4 line-clamp-2">
                      {member.bio}
                    </p>
                  )}

                  {/* Achievements */}
                  {member.achievements.length > 0 && (
                    <div className="flex justify-center gap-2 mb-4">
                      {member.achievements.map((achievement, idx) => (
                        <span
                          key={idx}
                          className={`text-2xl ${getRarityColor(achievement.rarity)}`}
                          title={achievement.title}
                        >
                          {achievement.icon}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="text-hot-pink font-bold">{member.courseCount}</div>
                      <div className="text-steel-grey text-xs">Courses</div>
                    </div>
                    <div>
                      <div className="text-hot-pink font-bold">{member.achievementCount}</div>
                      <div className="text-steel-grey text-xs">Badges</div>
                    </div>
                    <div>
                      <div className="text-hot-pink font-bold">{member.reputationScore}</div>
                      <div className="text-steel-grey text-xs">Rep</div>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="mt-4 text-center text-xs text-steel-grey">
                    Member {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                  </div>
                </GlassmorphicCard>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
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
  );
};

export default MemberDirectoryPage;
