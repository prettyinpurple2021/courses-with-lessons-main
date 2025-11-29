import React from 'react';

interface HolographicBadgeProps {
  title: string;
  description?: string;
  icon?: string;
  unlocked?: boolean;
  unlockedDate?: Date;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HolographicBadge: React.FC<HolographicBadgeProps> = ({
  title,
  description,
  icon,
  unlocked = false,
  unlockedDate,
  rarity = 'common',
  size = 'md',
  className = '',
}) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-24 h-24 text-sm',
    lg: 'w-32 h-32 text-base',
  };

  const baseClasses = unlocked
    ? 'glassmorphic holographic holographic-border'
    : 'glassmorphic grayscale opacity-50';

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} flex flex-col items-center justify-center p-4 ${className}`}>
      {icon && (
        <div className={`text-4xl mb-2 ${unlocked ? 'holographic-text' : ''}`}>
          {icon}
        </div>
      )}
      {!icon && (
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarityColors[rarity]} mb-2 flex items-center justify-center text-white font-bold`}
        >
          {title.charAt(0)}
        </div>
      )}
      <div className="text-center">
        <h3 className="font-bold text-white text-xs">{title}</h3>
        {description && (
          <p className="text-white/70 text-xs mt-1 line-clamp-2">{description}</p>
        )}
        {unlocked && unlockedDate && (
          <p className="text-success-teal text-xs mt-1">
            {new Date(unlockedDate).toLocaleDateString()}
          </p>
        )}
        {!unlocked && (
          <p className="text-white/50 text-xs mt-1">Locked</p>
        )}
      </div>
    </div>
  );
};

export default HolographicBadge;
