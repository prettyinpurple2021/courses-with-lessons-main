import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import { getMemberById } from '../services/forumService';
import { MemberProfile } from '../types/forum';
import { useToast } from '../hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

const MemberProfilePage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      loadMember();
    }
  }, [memberId]);

  const loadMember = async () => {
    if (!memberId) return;

    setIsLoading(true);
    try {
      const data = await getMemberById(memberId);
      setMember(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load member profile');
      navigate('/community/members');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400 border-yellow-400';
      case 'epic':
        return 'text-purple-400 border-purple-400';
      case 'rare':
        return 'text-blue-400 border-blue-400';
      default:
        return 'text-steel-grey border-steel-grey';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen camo-background flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hot-pink"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen camo-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community/members')}
          className="mb-6 text-hot-pink hover:text-hot-pink/80 transition-colors flex items-center gap-2"
        >
          ← Back to Members
        </button>

        {/* Profile Header */}
        <GlassmorphicCard variant="elevated" className="p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-hot-pink"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-hot-pink flex items-center justify-center text-white text-5xl font-bold border-4 border-hot-pink">
                  {member.firstName[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {member.firstName} {member.lastName}
              </h1>

              {member.bio && (
                <p className="text-steel-grey mb-4">{member.bio}</p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-steel-grey">
                <div>
                  <span className="text-hot-pink font-bold">{member.courseCount}</span> Courses Completed
                </div>
                <span>•</span>
                <div>
                  <span className="text-hot-pink font-bold">{member.achievementCount}</span> Achievements
                </div>
                <span>•</span>
                <div>
                  <span className="text-hot-pink font-bold">{member.reputationScore}</span> Reputation
                </div>
                <span>•</span>
                <div>
                  Member {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        {/* Achievements */}
        {member.achievements.length > 0 && (
          <GlassmorphicCard variant="default" className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {member.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} bg-black/30`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold ${getRarityColor(achievement.rarity)}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-steel-grey">
                        Unlocked {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>
        )}

        {member.achievements.length === 0 && (
          <GlassmorphicCard variant="default" className="p-8 text-center">
            <p className="text-steel-grey">No achievements yet</p>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
};

export default MemberProfilePage;
