import React, { useState } from 'react';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  showAnimation?: boolean;
  className?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  unlocked,
  unlockedDate,
  rarity = 'common',
  showAnimation = true,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(showAnimation && unlocked);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
  };

  const rarityBorders = {
    common: 'border-gray-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400',
  };

  React.useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isAnimating]);

  const baseClasses = unlocked
    ? `glassmorphic-elevated ${rarityBorders[rarity]} border-2`
    : 'glassmorphic grayscale opacity-40';

  const animationClass = isAnimating ? 'holographic-pulse animate-bounce' : '';

  return (
    <div
      className={`${baseClasses} ${animationClass} p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 ${className}`}
    >
      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-br ${rarityColors[rarity]} flex items-center justify-center text-3xl mb-3 ${
          unlocked ? 'holographic' : ''
        }`}
      >
        {icon}
      </div>
      <h3 className={`font-bold text-white mb-1 ${unlocked ? 'holographic-text' : ''}`}>
        {title}
      </h3>
      <p className="text-white/70 text-xs mb-2 line-clamp-2">{description}</p>
      {unlocked && unlockedDate && (
        <p className="text-success-teal text-xs font-semibold">
          Unlocked {new Date(unlockedDate).toLocaleDateString()}
        </p>
      )}
      {!unlocked && (
        <div className="flex items-center gap-1 text-white/50 text-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Locked</span>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
