import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { fetchAchievements } from '../../services/dashboardService';
import type { Achievement } from '../../types/dashboard';

export default function AchievementShowcase() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const { data: achievements, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'achievements'],
    queryFn: fetchAchievements,
    staleTime: 5 * 60_000,
  });

  const unlockedAchievements = achievements?.filter((a) => a.unlocked) ?? [];
  const lockedAchievements = achievements?.filter((a) => !a.unlocked) ?? [];

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

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading achievements..." />
      </div>
    );
  }

  if (isError || !achievements) {
    return (
      <div className="glassmorphic rounded-lg p-8 text-center">
        <p className="text-white/70">We couldn&apos;t load your achievements. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Unlocked Achievements */}
        <section>
          <h3 className="text-xl font-bold text-white mb-4">
            Unlocked ({unlockedAchievements.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {unlockedAchievements.map((achievement) => (
              <button
                key={achievement.id}
                onClick={() => setSelectedAchievement(achievement)}
                className="group relative"
              >
                <div
                  className={`
                    glassmorphic-elevated rounded-lg p-4 transition-all duration-300
                    hover:scale-110 cursor-pointer
                  `}
                >
                  {/* Holographic border based on rarity */}
                  <div
                    className={`
                      absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                      transition-opacity duration-300 holographic-border
                    `}
                  />

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
        </section>

        {/* Locked Achievements */}
        <section>
          <h3 className="text-xl font-bold text-white mb-4">
            Locked ({lockedAchievements.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {lockedAchievements.map((achievement) => (
              <button
                key={achievement.id}
                onClick={() => setSelectedAchievement(achievement)}
                className="group relative"
              >
                <div
                  className={`
                    glassmorphic rounded-lg p-4 transition-all duration-300
                    hover:scale-105 cursor-pointer opacity-50 grayscale
                  `}
                >
                  {/* Lock icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                    <span className="text-2xl">🔒</span>
                  </div>

                  {/* Icon (blurred) */}
                  <div className="text-4xl mb-2 blur-sm">{achievement.icon}</div>

                  {/* Title */}
                  <p className="text-white text-xs font-semibold text-center line-clamp-2">
                    {achievement.title}
                  </p>

                  {/* Rarity indicator */}
                  <div
                    className={`
                      absolute top-2 right-2 w-2 h-2 rounded-full
                      bg-gradient-to-r ${getRarityColor(achievement.rarity)}
                      opacity-50
                    `}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
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
                  text-6xl holographic-border
                  ${selectedAchievement.unlocked ? '' : 'grayscale opacity-50'}
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

            {/* Unlock Date or Status */}
            {!selectedAchievement.unlocked ? (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm">
                  <span>🔒</span> Locked
                </span>
              </div>
            ) : selectedAchievement.unlockedAt ? (
              <div className="text-center">
                <p className="text-white/60 text-sm">
                  Unlocked on {formatDate(new Date(selectedAchievement.unlockedAt))}
                </p>
              </div>
            ) : null}
          </div>
        </Modal>
      )}
    </>
  );
}
