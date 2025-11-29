interface QuickActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function QuickActionButton({
  icon,
  title,
  description,
  onClick,
  variant = 'primary',
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        glassmorphic-elevated rounded-lg p-6 text-left transition-all duration-300
        hover:scale-105 hover:glassmorphic-elevated group
        ${variant === 'primary' ? 'holographic-border' : ''}
      `}
    >
      {/* Icon */}
      <div className="text-4xl mb-3">{icon}</div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-hot-pink transition-colors">
          {title}
        </h3>
        <p className="text-white/70 text-sm">{description}</p>
      </div>

      {/* Holographic effect on hover */}
      <div className="absolute inset-0 holographic opacity-0 group-hover:opacity-20 rounded-lg pointer-events-none transition-opacity duration-300" />
    </button>
  );
}
