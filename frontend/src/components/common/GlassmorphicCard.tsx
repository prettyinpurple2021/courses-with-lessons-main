import React from 'react';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat';
  className?: string;
  onClick?: () => void;
  holographicBorder?: boolean;
  camoBackground?: boolean;
  role?: string;
  ariaLabel?: string;
  tabIndex?: number;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  holographicBorder = false,
  camoBackground = false,
  role,
  ariaLabel,
  tabIndex,
}) => {
  const variantClasses = {
    default: 'glassmorphic',
    elevated: 'glassmorphic-elevated',
    flat: 'glassmorphic-flat',
  };

  const baseClasses = variantClasses[variant];
  const borderClass = holographicBorder ? 'holographic-border' : '';
  const bgClass = camoBackground ? 'camo-background' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${baseClasses} ${borderClass} ${bgClass} ${cursorClass} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? role || 'button' : role}
      aria-label={ariaLabel}
      tabIndex={onClick ? tabIndex ?? 0 : tabIndex}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
