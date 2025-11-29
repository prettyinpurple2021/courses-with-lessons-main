import React, { useState } from 'react';
import { ProfileAchievement } from '../../types/profile';
import Modal from '../common/Modal';
import { formatDistanceToNow } from 'date-fns';

interface AchievementGridProps {
  achievements: ProfileAchievement[];
  showAll?: boolean;
}

const AchievementGrid: React.FC<AchievementGridProps> = ({ achievements, showAll = false }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<ProfileAchievement | null>(null);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return 'from-holographic-yellow via-holographic-magenta to-holographic-cyan';
      case 'epic':
        return 'from-holographic-magenta to-holographic-cyan';
      case 'rare':
        return 'from-success-teal to-holographic-cyan';
      default:
        return 'from-steel-grey to-white';
    }
  };

  const getRarityBorderColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return 'border-holographic-yellow';
      case 'epic':
        return 'border-holographic-magenta';
      case 'rare':
        return 'border-success-teal';
      default:
        return 'border-steel-grey';
    }
  };

  if (achievements.length === 0) {
    return (
      <div className="glassmorphic rounded-lg p-8 text-center">
        <p className="text-white/70">No achievements yet. Keep learning to unlock them!</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${showAll ? 'lg:grid-cols-6' : 'lg:grid-cols-6'} gap-4`}>
        {achievements.map((achievement) => (
          <button
            key={achievement.id}
            onClick={() => setSelectedAchievement(achievement)}
            className="group relative"
          >
            <div
              className={`
                glassmorphic-elevated rounded-lg p-4 transition-all duration-300
                hover:scale-110 cursor-pointer border-2 ${getRarityBorderColor(achievement.rarity)}
              `}
            >
              {/* Icon */}
              <div className="text-4xl mb-2 relative z-10">{achievement.icon}</div>

              {/* Title */}
              <p className="text-white text-xs font-semibold text-center line-clamp-2 relative z-10">
                {achievement.title}
              </p>

              {/* Rarity indicator */}
              <div
                className={`
                  absolute top-2 right-2 w-2 h-2 rounded-full
                  bg-gradient-to-r ${getRarityColor(achievement.rarity)}
                `}
              />

              {/* Holographic effect */}
              <div className="absolute inset-0 holographic opacity-0 group-hover:opacity-30 rounded-lg pointer-events-none transition-opacity duration-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAchievement(null)}
          title={selectedAchievement.title}
        >
          <div className="space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div
                className={`
                  w-24 h-24 rounded-full glassmorphic-elevated flex items-center justify-center
                  text-6xl holographic-border border-4 ${getRarityBorderColor(selectedAchievement.rarity)}
                `}
              >
                {selectedAchievement.icon}
              </div>
            </div>

            {/* Description */}
            <p className="text-white/80 text-center">{selectedAchievement.description}</p>

            {/* Rarity */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/60 text-sm">Rarity:</span>
              <span
                className={`
                  px-3 py-1 rounded-full text-sm font-semibold
                  bg-gradient-to-r ${getRarityColor(selectedAchievement.rarity)}
                  text-white
                `}
              >
                {selectedAchievement.rarity.charAt(0).toUpperCase() +
                  selectedAchievement.rarity.slice(1)}
              </span>
            </div>

            {/* Unlock Date */}
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Unlocked {formatDistanceToNow(new Date(selectedAchievement.unlockedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AchievementGrid;
